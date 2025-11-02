import sys
import requests
import urllib3

urllib3.disable_warnings()

def main():
    url = sys.argv[1] if len(sys.argv) > 1 else 'https://127.0.0.1:5443/api/health'
    try:
        r = requests.get(url, timeout=6, verify=False)
        print(r.status_code)
        print(r.text)
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == '__main__':
    main()
