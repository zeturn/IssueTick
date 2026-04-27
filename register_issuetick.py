import urllib.request
import json

token = "bpk_07452d75e8294369213679dd06a81e7490cde8f2e94c3945d46e34860780b952"
base_url = "http://localhost:8101/api/v1/manual"

headers = {
    "X-Api-Key": token,
    "Content-Type": "application/json"
}

# 1. Create App
app_data = {
    "name": "IssueTick",
    "description": "Ticket management system for issue tracking and resolution",
    "homepage_url": "http://localhost:5115",
    "redirect_uris": ["http://localhost:8112/api/auth/callback"],
    "allowed_origins": ["http://localhost:5115"]
}
req = urllib.request.Request(f"{base_url}/apps", data=json.dumps(app_data).encode("utf-8"), headers=headers, method="POST")
try:
    resp = urllib.request.urlopen(req)
    res_data = json.loads(resp.read().decode("utf-8"))
    print("Create App response:", json.dumps(res_data, indent=2))
    app_id = res_data["data"]["id"]
except Exception as e:
    print("Create App Error:", e)
    app_id = None

# 2. Create OAuth Client
if app_id:
    client_data = {
        "app_id": app_id,
        "name": "IssueTick OAuth",
        "description": "OAuth client for IssueTick",
        "redirect_uris": ["http://localhost:8112/api/auth/callback"],
        "allowed_origins": ["http://localhost:5115"]
    }
    req2 = urllib.request.Request(f"{base_url}/oauth/clients", data=json.dumps(client_data).encode("utf-8"), headers=headers, method="POST")
    try:
        resp2 = urllib.request.urlopen(req2)
        res_auth = json.loads(resp2.read().decode("utf-8"))
        print("Create OAuth response:", json.dumps(res_auth, indent=2))
        client_id = res_auth["data"]["client_id"]
        client_secret = res_auth["data"]["client_secret"]
        print("\n" + "=" * 50)
        print("Save these to backend/.env:")
        print(f"BASALT_CLIENT_ID={client_id}")
        print(f"BASALT_CLIENT_SECRET={client_secret}")
        print("=" * 50)
    except Exception as e:
        print("Create OAuth Error:", e)
