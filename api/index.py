import sys
import os

# Add backend directory to path so we can import app and rag_engine
BACKEND_DIR = os.path.join(os.path.dirname(__file__), '..', 'backend')
sys.path.insert(0, os.path.abspath(BACKEND_DIR))

# Import the Flask app object — Vercel detects the `app` variable as the WSGI handler
from app import app
