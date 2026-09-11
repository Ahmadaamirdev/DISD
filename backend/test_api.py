import json
from app import app

def run_tests():
    client = app.test_client()
    print("=== Testing /api/chat Endpoints ===")

    # 1. Empty message test
    res = client.post("/api/chat", json={"message": ""})
    assert res.status_code == 400, f"Expected 400, got {res.status_code}"
    print("PASS: Empty query returns 400 error.")

    # 2. Greeting heuristic test
    res = client.post("/api/chat", json={"message": "Hello"})
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    data = res.get_json()
    assert data["success"] is True
    assert "Hello!" in data["response"]
    print("PASS: Greeting fast heuristic:", data["response"][:60], "...")

    # 3. Closing heuristic test
    res = client.post("/api/chat", json={"message": "Thank you"})
    assert res.status_code == 200
    data = res.get_json()
    assert "welcome" in data["response"].lower()
    print("PASS: Closing fast heuristic:", data["response"][:60], "...")

    # 4. RAG Product compatibility query
    res = client.post("/api/chat", json={"message": "What breaker fits a 22 ton excavator?"})
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert "TB210" in data["response"] or "breaker" in data["response"].lower()
    print("PASS: RAG Breaker query retrieved successfully:", data["response"][:100], "...")

    # 5. RAG Contact / Jeddah depot query
    res = client.post("/api/chat", json={"message": "Where is your Jeddah depot located and what is your phone number?"})
    assert res.status_code == 200
    data = res.get_json()
    assert "+966" in data["response"] or "Jeddah" in data["response"]
    print("PASS: RAG Contact query retrieved successfully:", data["response"][:100], "...")

    # 6. RAG 4WD Forklift query
    res = client.post("/api/chat", json={"message": "Tell me about the rough terrain 4WD forklift"})
    assert res.status_code == 200
    data = res.get_json()
    assert "FL500" in data["response"] or "forklift" in data["response"].lower()
    print("PASS: RAG Forklift query retrieved successfully:", data["response"][:100], "...")

    print("\nALL BACKEND API AND RAG RETRIEVAL TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
