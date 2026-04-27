import requests
import json

base_url = "http://localhost:8101"
r = requests.get(f"{base_url}/api/manual/apps/13/oauth-clients")
print(json.dumps(r.json(), indent=2))
