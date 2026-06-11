import os
import requests
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from zipfile import ZipFile
import xml.etree.ElementTree as ET

# Constants
API_KEY = os.getenv('DART_API_KEY')
CORP_CODE = '00126380'
URL_ELSTOCK = f'https://opendart.fss.or.kr/api/elestock.json?crtfc_key={API_KEY}&corp_code={CORP_CODE}'
SAVE_DIR = 'company/projects/테스트/files/pdfs/DART_임원주요주주/'

def fetch_disclosures():
    response = requests.get(URL_ELSTOCK)
    data = response.json()
    if data['status'] == '000':
        return data['list'][:3]  # Get the latest 3 disclosures
    return []

def download_xml(rcept_no):
    url_document = f'https://opendart.fss.or.kr/api/document.xml?crtfc_key={API_KEY}&rcept_no={rcept_no}'
    response = requests.get(url_document)
    file_path = os.path.join(SAVE_DIR, f'{rcept_no}.zip')
    with open(file_path, 'wb') as f:
        f.write(response.content)
    return file_path

def convert_xml_to_pdf(xml_path, pdf_path):
    with ZipFile(xml_path, 'r') as zip_ref:
        zip_ref.extractall(SAVE_DIR)
        
    xml_file = os.path.join(SAVE_DIR, 'document.xml')
    tree = ET.parse(xml_file)
    root = tree.getroot()
    
    pdf = canvas.Canvas(pdf_path, pagesize=letter)
    text = pdf.beginText(40, 750)
    text.setFont('Helvetica', 12)

    for elem in root.iter():
        txt = f'{elem.tag}: {elem.text}'
        text.textLine(txt)

    pdf.drawText(text)
    pdf.save()

def main():
    disclosures = fetch_disclosures()
    if not disclosures:
        print("No disclosures available or failed to fetch.")
        return

    if not os.path.exists(SAVE_DIR):
        os.makedirs(SAVE_DIR)

    for disclosure in disclosures:
        rcept_no = disclosure['rcept_no']
        zip_path = download_xml(rcept_no)
        pdf_path = os.path.join(SAVE_DIR, f'{rcept_no}.pdf')
        convert_xml_to_pdf(zip_path, pdf_path)
        os.remove(zip_path)  # Clean up ZIP file

    pdf_files = os.listdir(SAVE_DIR)
    print(f"Completed! {len(pdf_files)} PDF files saved in {SAVE_DIR}.")

if __name__ == "__main__":
    main()