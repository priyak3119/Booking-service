import requests
from requests.auth import HTTPBasicAuth

url = "https://ap-gateway.mastercard.com/api/rest/version/70/merchant/804014000/session"

payload = {
    "apiOperation": "CREATE_CHECKOUT_SESSION",
    "order": {
        "id": "BOOK-TEST-1234",
        "amount": "100.00",
        "currency": "AED"
    },
    "interaction": {
        "operation": "PURCHASE",
        "returnUrl": "http://localhost:5173/payment/success",
        "cancelUrl": "http://localhost:5173/payment/failed"
    }
}

response = requests.post(
    url,
    auth=HTTPBasicAuth("merchadmin", "Pass@2022Pass@2022"),
    json=payload
)

print(response.status_code)
print(response.text)
