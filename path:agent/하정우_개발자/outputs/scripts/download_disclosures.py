import os
import requests
import xml.etree.ElementTree as ET
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

DART_API_KEY = os.getenv('DART_API_KEY', 'YOUR_DART_API_KEY')
CORP_CODE = "00126380"
SAVE_PATH = "/Users/gimtaehyeong/Desktop/coding/1. Monaedu/company/projects/테스트/files/pdfs/DART_임원주요주주/"

def fetch_latest_disclosures():
    url = f"https://opendart.fss.or.kr/api/list.xml?crtfc_key={DART_API_KEY}&corp_code={CORP_CODE}&bgn_de=20230101&end_de=20231231"
    response = requests.get(url)
    return response.content

def parse_disclosures(xml_data):
    disclosures = []
    root = ET.fromstring(xml_data)
    for i, item in enumerate(root.findall(".//list")):
        if i >= 3:
            break
        rcept_no = item.findtext('rcept_no')
        report_nm = item.findtext('report_nm')
        disclosures.append({'rcept_no': rcept_no, 'report_nm': report_nm})
    return disclosures

def download_document(rcept_no):
    url = f"https://opendart.fss.or.kr/api/document.xml?crtfc_key={DART_API_KEY}&rcept_no={rcept_no}"
    response = requests.get(url)
    return response.content

def xml_to_pdf(xml_content, output_file):
    root = ET.fromstring(xml_content)
    doc_content = "\n".join([elem.text for elem in root.iter()])
    c = canvas.Canvas(output_file, pagesize=letter)
    text_object = c.beginText(40, 750)
    text_object.setFont("Helvetica", 10)
    for line in doc_content.split("\n"):
        text_object.textLine(line)
    c.drawText(text_object)
    c.save()

def main():
    xml_data = fetch_latest_disclosures()
    disclosures = parse_disclosures(xml_data)
    
    if not os.path.exists(SAVE_PATH):
        os.makedirs(SAVE_PATH)
        
    for disclosure in disclosures:
        rcept_no = disclosure['rcept_no']
        report_nm = disclosure['report_nm']
        xml_document = download_document(rcept_no)
        output_file = os.path.join(SAVE_PATH, f"{rcept_no}_{report_nm}.pdf")
        xml_to_pdf(xml_document, output_file)

if __name__ == "__main__":
    main()