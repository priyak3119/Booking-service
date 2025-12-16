import requests

MAGNATI_URL = "https://api.magnati.com/payment"
API_KEY = "YOUR_API_KEY"

def initiate_magnati_payment(amount, reference):
    payload = {
        "amount": amount,
        "currency": "AED",
        "reference": reference,
        "returnUrl": "https://yourdomain.com/payment-success"
    }

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    response = requests.post(MAGNATI_URL, json=payload, headers=headers)

    return response.json()
