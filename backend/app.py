import os
import json
import time
from datetime import datetime, timezone
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))
load_dotenv()

from flask import Flask, request, jsonify
from flask_cors import CORS
from rag_engine import get_chatbot

app = Flask(__name__)
CORS(app)

PORT = int(os.getenv("PORT", 8085))
PRODUCTS_FILE = os.path.join(BASE_DIR, "data", "products.json")
INQUIRIES_FILE = os.path.join(BASE_DIR, "data", "inquiries.json")

# In-memory inquiry store — used as fallback when filesystem is read-only (e.g. Vercel)
_INQUIRIES_MEMORY = []

def load_products():
    if os.path.exists(PRODUCTS_FILE):
        try:
            with open(PRODUCTS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"[API] Error loading products: {e}")
    return []

def load_inquiries():
    # Prefer file-based store; fall back to in-memory if unavailable
    if os.path.exists(INQUIRIES_FILE):
        try:
            with open(INQUIRIES_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                # Merge with any in-memory additions not yet on disk
                ids_on_disk = {i.get("referenceNumber") for i in data}
                extras = [i for i in _INQUIRIES_MEMORY if i.get("referenceNumber") not in ids_on_disk]
                return extras + data
        except Exception:
            pass
    return list(_INQUIRIES_MEMORY)

def save_inquiry(inquiry):
    _INQUIRIES_MEMORY.insert(0, inquiry)
    try:
        items = load_inquiries()
        with open(INQUIRIES_FILE, "w", encoding="utf-8") as f:
            json.dump(items, f, indent=2, ensure_ascii=False)
    except Exception:
        # Read-only filesystem (e.g. Vercel) — in-memory store already updated above
        pass
    return inquiry

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "online",
        "service": "Dragon International Services and Development LLC - Heavy Machinery API",
        "version": "1.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat()
    })

@app.route("/api/products", methods=["GET"])
def get_products():
    products = load_products()
    category = request.args.get("category")
    featured = request.args.get("featured")

    if category and category != "All":
        products = [p for p in products if p.get("category", "").lower() == category.lower()]
    if featured == "true":
        products = [p for p in products if p.get("featured")]

    return jsonify({
        "success": True,
        "count": len(products),
        "data": products
    })

@app.route("/api/products/<identifier>", methods=["GET"])
def get_product_by_id(identifier):
    products = load_products()
    for p in products:
        if p.get("id") == identifier or p.get("slug") == identifier or p.get("modelNumber", "").lower() == identifier.lower():
            return jsonify({
                "success": True,
                "data": p
            })
    return jsonify({"success": False, "error": "Product not found"}), 404

@app.route("/api/inquiries", methods=["GET"])
def get_inquiries():
    inquiries = load_inquiries()
    return jsonify({
        "success": True,
        "count": len(inquiries),
        "data": inquiries
    })

@app.route("/api/inquiries", methods=["POST"])
def create_inquiry():
    data = request.json or {}
    full_name = data.get("fullName", "").strip()
    company = data.get("company", "").strip()
    email = data.get("email", "").strip()
    phone = data.get("phone", "").strip()
    equipment_type = data.get("equipmentType", "").strip()

    if not full_name or not company or not email or not phone or not equipment_type:
        return jsonify({
            "success": False,
            "message": "Please provide full name, company, email, phone number, and required equipment type."
        }), 400

    ref_number = f"DISD-RFQ-{int(time.time() * 1000) % 1000000:06d}"
    inquiry_record = {
        "fullName": full_name,
        "company": company,
        "email": email,
        "phone": phone,
        "country": data.get("country", "Saudi Arabia"),
        "equipmentType": equipment_type,
        "excavatorTonnage": data.get("excavatorTonnage", "Unspecified"),
        "projectTimeline": data.get("projectTimeline", "1-3 Months"),
        "message": data.get("message", ""),
        "status": "Pending Review",
        "referenceNumber": ref_number,
        "createdAt": datetime.now(timezone.utc).isoformat()
    }

    saved = save_inquiry(inquiry_record)
    return jsonify({
        "success": True,
        "message": "Quotation request submitted successfully. Our engineering specialist in Jeddah will contact you within 24 hours.",
        "referenceNumber": ref_number,
        "data": saved
    }), 201

@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.json or {}
    message = data.get("message", "").strip()
    conversation = data.get("conversation", [])

    if not message:
        return jsonify({"error": "Message is required."}), 400

    chatbot = get_chatbot()
    reply = chatbot.generate_response(message, conversation)

    return jsonify({
        "success": True,
        "response": reply,
        "text": reply
    })

if __name__ == "__main__":
    print(f"[DISD Chatbot] Flask API starting on http://0.0.0.0:{PORT}...")
    app.run(host="0.0.0.0", port=PORT, debug=True)
