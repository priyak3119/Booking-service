import requests
from requests.auth import HTTPBasicAuth

url = "https://ap-gateway.mastercard.com/api/rest/version/70/merchant/804014000/session"

auth = HTTPBasicAuth(
    "merchant.804014000",
    "56e7281fda84682d652ce01d9d6e4ae4"
)

payload = {
    "apiOperation": "CREATE_CHECKOUT_SESSION"
}

response = requests.post(
    url,
    auth=auth,
    headers={"Content-Type": "application/json"},
    json=payload
)

print(response.status_code)
print(response.text)
