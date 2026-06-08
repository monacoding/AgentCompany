#!/usr/bin/env python3
"""수능 기출 PDF 일괄 다운로드 — 평가원 공식 사이트 (suneung.re.kr)"""

from __future__ import annotations

import argparse
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path

BASE_URL = "https://www.suneung.re.kr"
LIST_BASE = (
    f"{BASE_URL}/boardCnts/list.do"
    "?boardID=1500234&m=0403&s=suneung"
)
MAX_LIST_PAGES = 12
MOCK_LIST_URL = (
    f"{BASE_URL}/boardCnts/list.do"
    "?boardID=1500236&m=0403&s=suneung"
)
DOWNLOAD_URL = f"{BASE_URL}/boardCnts/fileDown.do?fileSeq="

USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)


def fetch_html(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read().decode("utf-8", errors="replace")


def parse_filename(content_disposition: str | None, fallback: str) -> str:
    if not content_disposition:
        return fallback
    m = re.search(r"filename\*=UTF-8''([^;]+)", content_disposition, re.I)
    if m:
        return urllib.parse.unquote(m.group(1))
    m = re.search(r"filename=([^;]+)", content_disposition, re.I)
    if m:
        raw = m.group(1).strip().strip('"')
        return urllib.parse.unquote(raw, encoding="utf-8", errors="replace")
    return fallback


def parse_entries(html: str, subjects: set[str]) -> list[dict]:
    entries: list[dict] = []
    for row in re.findall(r"<tr[^>]*>.*?</tr>", html, re.DOTALL):
        if "fileDown" not in row:
            continue
        file_m = re.search(r"fileDown\('([a-f0-9]+)'\)", row)
        year_m = re.search(r"<td[^>]*>\s*(\d{4})\s*</td>", row)
        subj_m = re.search(r"<td[^>]*>\s*(국어|수학|영어|한국사)\s*</td>", row)
        seq_m = re.search(r"boardSeq=(\d+)", row)
        if not (file_m and subj_m):
            continue
        subject = subj_m.group(1)
        if subject not in subjects:
            continue
        entries.append(
            {
                "exam_year": year_m.group(1) if year_m else "unknown",
                "subject": subject,
                "board_seq": seq_m.group(1) if seq_m else "",
                "file_seq": file_m.group(1),
            }
        )
    return entries


def download_pdf(
    file_seq: str,
    out_dir: Path,
    exam_year: str,
    subject: str,
) -> Path:
    url = DOWNLOAD_URL + file_seq
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=60) as resp:
        cd = resp.headers.get("Content-Disposition")
        original = parse_filename(cd, f"{subject}영역_문제지.pdf")
        variant = ""
        if "홀수" in original:
            variant = "_홀수형"
        elif "짝수" in original:
            variant = "_짝수형"
        filename = f"{exam_year}학년도_{subject}영역_문제지{variant}.pdf"
        safe_name = re.sub(r'[\\/:*?"<>|]', "_", filename)
        dest = out_dir / safe_name
        dest.write_bytes(resp.read())
        return dest


def main() -> int:
    parser = argparse.ArgumentParser(description="수능 기출 PDF 다운로드")
    parser.add_argument(
        "--out",
        type=Path,
        default=Path("pdfs"),
        help="저장 디렉터리",
    )
    parser.add_argument(
        "--subjects",
        default="국어,수학",
        help="다운로드할 영역 (쉼표 구분)",
    )
    parser.add_argument(
        "--years",
        default="2024,2025,2026",
        help="학년도 필터 (쉼표 구분)",
    )
    parser.add_argument(
        "--include-mock",
        action="store_true",
        help="수능 모의평가 게시판 포함",
    )
    args = parser.parse_args()

    subjects = {s.strip() for s in args.subjects.split(",") if s.strip()}
    years = {y.strip() for y in args.years.split(",") if y.strip()}
    out_dir = args.out.resolve()
    out_dir.mkdir(parents=True, exist_ok=True)

    downloaded: list[str] = []
    seen: set[tuple[str, str, str]] = set()

    board_dir = out_dir / "대학수학능력시험"
    board_dir.mkdir(parents=True, exist_ok=True)

    for page in range(1, MAX_LIST_PAGES + 1):
        url = f"{LIST_BASE}&page={page}"
        try:
            html = fetch_html(url)
        except Exception as exc:  # noqa: BLE001
            print(f"WARN page {page}: {exc}", file=sys.stderr)
            continue
        entries = parse_entries(html, subjects)
        if not entries:
            break
        for entry in entries:
            if entry["exam_year"] not in years:
                continue
            key = (entry["exam_year"], entry["subject"], entry["file_seq"])
            if key in seen:
                continue
            seen.add(key)
            label = f"{entry['exam_year']}학년도_{entry['subject']}"
            try:
                dest = download_pdf(
                    entry["file_seq"],
                    board_dir,
                    entry["exam_year"],
                    entry["subject"],
                )
                downloaded.append(str(dest.relative_to(out_dir)))
                print(f"OK  page{page} {dest.name}")
            except Exception as exc:  # noqa: BLE001
                print(f"ERR {label}: {exc}", file=sys.stderr)

    if args.include_mock:
        mock_dir = out_dir / "수능모의평가"
        mock_dir.mkdir(parents=True, exist_ok=True)
        for page in range(1, MAX_LIST_PAGES + 1):
            url = f"{MOCK_LIST_URL}&page={page}"
            try:
                html = fetch_html(url)
            except Exception:
                break
            entries = parse_entries(html, subjects)
            if not entries:
                break
            for entry in entries:
                if entry["exam_year"] not in years:
                    continue
                key = ("mock", entry["exam_year"], entry["file_seq"])
                if key in seen:
                    continue
                seen.add(key)
                try:
                    dest = download_pdf(
                        entry["file_seq"],
                        mock_dir,
                        entry["exam_year"],
                        entry["subject"],
                    )
                    downloaded.append(str(dest.relative_to(out_dir)))
                    print(f"OK  mock page{page} {dest.name}")
                except Exception as exc:  # noqa: BLE001
                    print(f"ERR mock {entry['exam_year']}: {exc}", file=sys.stderr)

    print(f"\n완료: {len(downloaded)}개 PDF → {out_dir}")
    return 0 if downloaded else 1


if __name__ == "__main__":
    raise SystemExit(main())
