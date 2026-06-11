#!/usr/bin/env python3
"""Open DART — 임원·주요주주 소유보고서 XML/PDF 일괄 다운로드"""

from __future__ import annotations

import argparse
import io
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path

BASE = "https://opendart.fss.or.kr/api"
USER_AGENT = "AgentCompany/1.0 (dart-elestock-pdf)"
SLEEP_SEC = 0.35


def load_env_file(path: Path) -> None:
    if not path.is_file():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value


def bootstrap_env() -> None:
    cwd = Path.cwd()
    for candidate in (cwd / ".env", cwd / "company" / ".env"):
        load_env_file(candidate)


def api_key() -> str:
    key = os.environ.get("DART_API_KEY") or os.environ.get("CRTFC_KEY") or ""
    if not key:
        print("ERROR: DART_API_KEY 또는 CRTFC_KEY 환경변수를 설정하세요.", file=sys.stderr)
        sys.exit(1)
    return key


def fetch_bytes(url: str, params: dict[str, str] | None = None) -> bytes:
    if params:
        url = f"{url}?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=60) as resp:
        return resp.read()


def fetch_json(path: str, params: dict[str, str]) -> dict:
    raw = fetch_bytes(f"{BASE}/{path}", params)
    data = json.loads(raw.decode("utf-8"))
    if data.get("status") != "000":
        raise RuntimeError(f"DART API {path}: {data.get('status')} {data.get('message')}")
    return data


def resolve_corp_code(key: str, stock_code: str | None, corp_code: str | None) -> str:
    if corp_code:
        return corp_code.zfill(8)
    if not stock_code:
        raise ValueError("--corp-code 또는 --stock-code 중 하나는 필수입니다.")

    zip_bytes = fetch_bytes(f"{BASE}/corpCode.xml", {"crtfc_key": key})
    with zipfile.ZipFile(io.BytesIO(zip_bytes)) as zf:
        xml_name = next(n for n in zf.namelist() if n.lower().endswith(".xml"))
        root = ET.fromstring(zf.read(xml_name))

    target = stock_code.zfill(6)
    for item in root.findall("list"):
        sc = (item.findtext("stock_code") or "").strip()
        if sc == target:
            code = (item.findtext("corp_code") or "").strip()
            if code:
                return code.zfill(8)
    raise RuntimeError(f"종목코드 {stock_code}에 해당하는 corp_code를 찾지 못했습니다.")


def list_elestock(key: str, corp_code: str) -> list[dict]:
    data = fetch_json("elestock.json", {"crtfc_key": key, "corp_code": corp_code})
    return data.get("list") or []


def download_document_xml(key: str, rcept_no: str) -> bytes:
    return fetch_bytes(f"{BASE}/document.xml", {"crtfc_key": key, "rcept_no": rcept_no})


def extract_xml_from_zip(zip_bytes: bytes) -> tuple[str, bytes]:
    with zipfile.ZipFile(io.BytesIO(zip_bytes)) as zf:
        name = zf.namelist()[0]
        return name, zf.read(name)


def safe_filename(text: str) -> str:
    cleaned = re.sub(r'[\\/:*?"<>|\s]+', "_", text.strip())
    return cleaned[:80] or "unknown"


def xml_to_pdf(xml_bytes: bytes, dest: Path) -> None:
    try:
        from reportlab.lib import colors
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import getSampleStyleSheet
        from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
    except ImportError as exc:
        raise RuntimeError("PDF 변환에 reportlab 필요: pip install reportlab") from exc

    root = ET.fromstring(xml_bytes)
    doc_name = root.findtext(".//DOCUMENT-NAME") or "DART 공시"
    company = root.findtext(".//COMPANY-NAME") or ""

    story: list = []
    styles = getSampleStyleSheet()
    story.append(Paragraph(doc_name, styles["Title"]))
    if company:
        story.append(Paragraph(company, styles["Heading2"]))
    story.append(Spacer(1, 12))

    for table in root.iter("TABLE"):
        rows: list[list[str]] = []
        for tr in table.findall(".//TR"):
            cells = []
            for cell in tr:
                if cell.tag not in {"TD", "TH", "TE", "TU"}:
                    continue
                text = "".join(cell.itertext()).strip()
                cells.append(text or " ")
            if cells:
                rows.append(cells)
        if not rows:
            continue
        col_count = max(len(r) for r in rows)
        norm = [r + [""] * (col_count - len(r)) for r in rows]
        tbl = Table(norm, repeatRows=1)
        tbl.setStyle(
            TableStyle(
                [
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("FONTSIZE", (0, 0), (-1, -1), 8),
                ]
            )
        )
        story.append(tbl)
        story.append(Spacer(1, 8))

    for p in root.iter("P"):
        text = "".join(p.itertext()).strip()
        if text:
            story.append(Paragraph(text, styles["Normal"]))
            story.append(Spacer(1, 4))

    doc = SimpleDocTemplate(str(dest), pagesize=A4)
    doc.build(story)


def is_pdf(path: Path) -> bool:
    try:
        return path.read_bytes()[:4] == b"%PDF"
    except OSError:
        return False


def main() -> int:
    bootstrap_env()
    parser = argparse.ArgumentParser(description="DART 임원·주요주주 소유보고 PDF 다운로드")
    parser.add_argument("--corp-code", help="공시대상회사 고유번호 8자리")
    parser.add_argument("--stock-code", help="종목코드 6자리 (corp_code 자동 조회)")
    parser.add_argument("--since", help="접수일 시작 YYYY-MM-DD")
    parser.add_argument("--limit", type=int, default=10, help="최대 다운로드 건수")
    parser.add_argument("--pdf", action="store_true", help="XML을 PDF로 변환 (reportlab 필요)")
    parser.add_argument("--keep-xml", action="store_true", help="PDF와 함께 XML도 저장")
    parser.add_argument("--out", type=Path, default=Path("pdfs/DART_임원주요주주"))
    args = parser.parse_args()

    key = api_key()
    corp_code = resolve_corp_code(key, args.stock_code, args.corp_code)
    since = args.since.replace("-", "") if args.since else ""

    items = list_elestock(key, corp_code)
    if since:
        items = [x for x in items if (x.get("rcept_dt") or "").replace("-", "") >= since]
    items = items[: max(args.limit, 0)]

    out_dir = args.out.resolve()
    out_dir.mkdir(parents=True, exist_ok=True)

    downloaded: list[str] = []
    for item in items:
        rcept_no = item.get("rcept_no", "")
        if not rcept_no:
            continue
        corp_name = safe_filename(item.get("corp_name") or "corp")
        rcept_dt = safe_filename(item.get("rcept_dt") or "date")
        repror = safe_filename(item.get("repror") or "reporter")
        base = f"{corp_name}_{rcept_dt}_{repror}_{rcept_no}"

        try:
            zip_bytes = download_document_xml(key, rcept_no)
            _, xml_bytes = extract_xml_from_zip(zip_bytes)

            if args.keep_xml or not args.pdf:
                xml_path = out_dir / f"{base}.xml"
                xml_path.write_bytes(xml_bytes)

            if args.pdf:
                pdf_path = out_dir / f"{base}.pdf"
                xml_to_pdf(xml_bytes, pdf_path)
                if not is_pdf(pdf_path):
                    raise RuntimeError("PDF 헤더 검증 실패")
                downloaded.append(str(pdf_path))
                print(f"OK  PDF {pdf_path.name}")
            else:
                downloaded.append(str(out_dir / f"{base}.xml"))
                print(f"OK  XML {base}.xml")

            time.sleep(SLEEP_SEC)
        except Exception as exc:  # noqa: BLE001
            print(f"ERR {rcept_no}: {exc}", file=sys.stderr)

    print(f"\n완료: {len(downloaded)}건 → {out_dir}")
    return 0 if downloaded else 1


if __name__ == "__main__":
    raise SystemExit(main())
