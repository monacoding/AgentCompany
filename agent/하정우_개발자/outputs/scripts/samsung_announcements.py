import os
import requests
import xml.etree.ElementTree as ET

# Load API key
API_KEY = os.getenv('DART_API_KEY')
BASE_URL = 'https://opendart.fss.or.kr/api'

# Function to get corp_code using stock_code
def get_corp_code(stock_code):
    url = f"{BASE_URL}/corpCode.xml?crtfc_key={API_KEY}"
    response = requests.get(url)
    if response.status_code == 200:
        # Parse the XML response
        zip_file_path = 'CORPCODE.zip'
        with open(zip_file_path, 'wb') as f:
            f.write(response.content)
        # Extract and parse the XML file
        xml_file_path = unzip_file(zip_file_path)
        tree = ET.parse(xml_file_path)
        root = tree.getroot()
        for corp in root.findall('list'):
            if corp.find('stock_code').text == stock_code:
                return corp.find('corp_code').text
    return None

# Function to get recent announcements
def get_recent_announcements(corp_code, count=5):
    url = f"{BASE_URL}/list.json?crtfc_key={API_KEY}&corp_code={corp_code}&page_count={count}"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        if data['status'] == '000':
            return data['list']
    return []

# Helper function to unzip file
def unzip_file(zip_file_path):
    import zipfile
    with zipfile.ZipFile(zip_file_path, 'r') as zip_ref:
        zip_ref.extractall('.')
    return 'CORPCODE.xml'

# Main execution block
if __name__ == "__main__":
    stock_code = '005930'  # Samsung Electronics stock code
    corp_code = get_corp_code(stock_code)
    if corp_code:
        announcements = get_recent_announcements(corp_code)
        # Print in a table-like format
        print("| Receipt No    | Title                                         | Date       |")
        print("|---------------|----------------------------------------------|------------|")
        for ann in announcements:
            print(f"| {ann['rcept_no']} | {ann['report_nm'][:45]:45} | {ann['rcept_dt']} |")
    else:
        print('Could not retrieve corp_code.')