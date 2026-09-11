import os
import json
import math
import re
import requests
from typing import List, Dict, Any, Tuple
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))
load_dotenv()

try:
    from groq import Groq
except ImportError:
    Groq = None

STOP_WORDS = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are",
    "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but",
    "by", "can", "did", "do", "does", "doing", "down", "during", "each", "few", "for", "from",
    "further", "had", "has", "have", "he", "her", "here", "him", "how", "i", "if", "in", "into",
    "is", "it", "its", "just", "me", "more", "most", "my", "no", "nor", "not", "now", "of",
    "off", "on", "once", "only", "or", "other", "our", "out", "over", "own", "so", "some",
    "such", "than", "that", "the", "their", "them", "then", "there", "these", "they", "this",
    "those", "through", "to", "too", "under", "until", "up", "very", "was", "we", "were",
    "what", "when", "where", "which", "while", "who", "whom", "why", "will", "with", "you", "your"
}

def convert_markdown_tables(text: str) -> str:
    if not text or '|' not in text:
        return text
    lines = text.split('\n')
    result = []
    table_lines = []

    def process_table(table_block):
        if len(table_block) < 2:
            return '\n'.join(table_block)
        parse_row = lambda r: [c.strip().replace('<br>', '\n').replace('<br/>', '\n') for c in r.strip().strip('|').split('|')]
        data_rows = [parse_row(l) for l in table_block[1:] if not re.match(r'^\s*\|?\s*[-:]+[-| :]*\|?\s*$', l)]
        cards = []
        for row in data_rows:
            if not row or not any(row):
                continue
            if len(row) == 1:
                cards.append(row[0])
            elif len(row) == 2:
                cards.append(f"**{row[0]}**\n{row[1]}")
            else:
                col1, col2, *rest = row
                cards.append(f"**{col2 or col1}**\n*{col1}*\n\n{chr(10).join(rest)}")
        return '\n\n'.join(cards)

    for line in lines:
        if re.match(r'^\s*\|.*\|\s*$', line):
            table_lines.append(line)
        else:
            if table_lines:
                result.append(process_table(table_lines))
                table_lines = []
            result.append(line)
    if table_lines:
        result.append(process_table(table_lines))
    return '\n'.join(result)

def clean_text_formatting(text: str) -> str:
    if not text:
        return ""
    text = convert_markdown_tables(text)
    text = re.sub(r'```(?:markdown|text|json)?\n?([\s\S]*?)```', r'\1', text)
    text = re.sub(r'<br\s*/?>', '\n', text, flags=re.IGNORECASE)
    text = re.sub(r'(\s*[-=]>\s*|\s*[→➜➔➢▶]\s*)', ' · ', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()

class VectorDocument:
    def __init__(self, doc_id: str, category: str, title: str, content: str, keywords: List[str]):
        self.doc_id = doc_id
        self.category = category
        self.title = title
        self.content = content
        self.keywords = [k.lower().strip() for k in keywords]
        full_text = f"{title} {content} {' '.join(keywords)}"
        self.tokens = self._tokenize(full_text)
        self.title_tokens = set(self._tokenize(title))
        self.term_freq = self._compute_tf(self.tokens)

    @staticmethod
    def _tokenize(text: str) -> List[str]:
        words = re.findall(r'\b[a-zA-Z0-9_\-\.\+]+\b', text.lower())
        return [w for w in words if len(w) > 1 and w not in STOP_WORDS]

    @staticmethod
    def _compute_tf(tokens: List[str]) -> Dict[str, float]:
        tf = {}
        total = len(tokens) or 1
        for t in tokens:
            tf[t] = tf.get(t, 0.0) + 1.0
        return {k: v / total for k, v in tf.items()}

class RAGVectorDatabase:
    def __init__(self, knowledge_file: str):
        self.knowledge_file = knowledge_file
        self.documents: List[VectorDocument] = []
        self.doc_freq: Dict[str, int] = {}
        self.idf: Dict[str, float] = {}
        self.load_knowledge()

    def load_knowledge(self):
        if not os.path.exists(self.knowledge_file):
            print(f"[RAG] Knowledge base file not found: {self.knowledge_file}")
            return
        with open(self.knowledge_file, "r", encoding="utf-8") as f:
            data = json.load(f)
        chunks = data.get("chunks", [])
        self.documents = []
        self.doc_freq = {}
        for chunk in chunks:
            doc = VectorDocument(
                doc_id=chunk.get("id", ""),
                category=chunk.get("category", "General"),
                title=chunk.get("title", ""),
                content=chunk.get("content", ""),
                keywords=chunk.get("keywords", [])
            )
            self.documents.append(doc)
            for t in set(doc.tokens):
                self.doc_freq[t] = self.doc_freq.get(t, 0) + 1

        total_docs = len(self.documents) or 1
        self.idf = {
            t: math.log((total_docs + 1.0) / (freq + 1.0)) + 1.0
            for t, freq in self.doc_freq.items()
        }

    def search(self, query: str, top_k: int = 4) -> List[Tuple[VectorDocument, float]]:
        query_tokens = VectorDocument._tokenize(query)
        if not query_tokens:
            return [(doc, 1.0) for doc in self.documents[:top_k]]

        query_tf = VectorDocument._compute_tf(query_tokens)
        query_lower = query.lower()
        results = []

        for doc in self.documents:
            dot_product = 0.0
            for t in query_tokens:
                if t in doc.term_freq:
                    idf_val = self.idf.get(t, 1.0)
                    weight = 1.0
                    if t in doc.title_tokens:
                        weight += 3.0
                    for kw in doc.keywords:
                        if t in kw or kw in query_lower:
                            weight += 4.0
                            break
                    dot_product += (query_tf[t] * idf_val) * (doc.term_freq[t] * idf_val) * weight

            q_norm = math.sqrt(sum((v * self.idf.get(k, 1.0)) ** 2 for k, v in query_tf.items())) or 1.0
            d_norm = math.sqrt(sum((v * self.idf.get(k, 1.0)) ** 2 for k, v in doc.term_freq.items())) or 1.0
            cosine_sim = dot_product / (q_norm * d_norm)

            if doc.title.lower() in query_lower:
                cosine_sim += 0.5
            for kw in doc.keywords:
                if kw in query_lower:
                    cosine_sim += 0.35

            if cosine_sim > 0.02:
                results.append((doc, cosine_sim))

        results.sort(key=lambda x: x[1], reverse=True)
        return results[:top_k]

class RAGChatbot:
    def __init__(self, knowledge_path: str = None):
        if not knowledge_path:
            knowledge_path = os.path.join(BASE_DIR, "data", "knowledge_base.json")
        self.vector_db = RAGVectorDatabase(knowledge_path)

        self.groq_api_key = os.getenv("GROQ_API_KEY", "").strip()
        self.groq_model = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b").strip()
        self.openrouter_api_key = os.getenv("OPENROUTER_API_KEY", "").strip()
        self.openrouter_model = os.getenv("OPENROUTER_MODEL", "nvidia/nemotron-3-ultra").strip()

        self.groq_client = None
        if self.groq_api_key and Groq and self.groq_api_key != "your_groq_api_key_here":
            try:
                self.groq_client = Groq(api_key=self.groq_api_key)
            except Exception as e:
                print(f"[RAG] Groq client warning: {e}")

    # Minimum cosine-similarity score required to attempt an LLM answer.
    # Below this threshold we return a polite "not in knowledge base" message
    # instead of letting the model hallucinate.
    CONFIDENCE_THRESHOLD = 0.05

    def generate_response(self, query: str, conversation_history: List[Dict[str, Any]] = None) -> str:
        q = query.lower().strip()

        # ── Instant fast heuristics ──────────────────────────────────────────
        if re.search(r'^(hi|hello|hey|greetings|good\s*(morning|afternoon|evening))\b', q) and len(q.split()) <= 3:
            return ("Hello! I'm the DISD Assistant. I can help you with our hydraulic breakers, "
                    "attachments, technical specs, pricing, or sales contact.\n\n"
                    "[Explore Our Products](#products) [Contact DISD](#where-to-buy)")
        if re.search(r'^(bye|goodbye|thank\s*you|thanks|nothing\s*else|that\'?s\s*all)\b', q) and len(q.split()) <= 4:
            return "You're welcome! Feel free to ask anytime. Have a great day!"

        # ── Fast heuristic: General product portfolio inquiry ───────────────
        is_general_products_query = bool(re.search(
            r'\b(what\s+(products?|machinery|equipment|attachments?)|our\s+machinery|product\s*list|list\s+of\s+products?|what\s+do\s+you\s+(offer|sell|have|make|provide)|portfolio|catalog(ue)?|types?\s+of\s+(products?|machinery|equipment))\b',
            q
        )) or q in [
            "products", "machinery", "equipment", "our machinery", "product list",
            "what do you offer", "what products do you have", "what products do you sell",
            "what machinery, hydraulic breakers, and attachments do you offer?"
        ]

        has_specific_model = bool(re.search(r'\b(tb210|fl500|vc80|ex360|wg360|sl1400|tb-210|fl-500|vc-80|ex-360|wg-360|sl-1400)\b', q))
        if is_general_products_query and not has_specific_model:
            return (
                "DISD manufactures and supplies heavy machinery and attachments for construction, quarrying, and demolition:\n\n"
                "- [Hydraulic Breaker](#products)\n"
                "- [Hydraulic wood grapple](#products)\n"
                "- [Vibrating compactor](#products)\n"
                "- [Hydraulic pulverizer](#products)\n"
                "- [Hydraulic quick coupler](#products)\n"
                "- [Compaction Equipment](#products)\n"
                "- [Excavator](#products)\n"
                "- [Forklift](#products)\n"
                "- [Scissor Lift](#products)\n\n"
                "[See Specifications](#products) · [Get a Quote](#quote-estimator)"
            )

        # ── Fast heuristic: Specifications & Compatibility inquiry ───────────
        is_specs_query = bool(re.search(
            r'\b(technical\s*parameters|excavator\s*compatibility|specifications?|specs\b|compatibility\s*specifications?|carrier\s*compatibility)\b',
            q
        )) or q in [
            "specifications", "specs", "technical parameters", "excavator compatibility",
            "what are the technical parameters and excavator compatibility specifications?"
        ]

        if is_specs_query and not has_specific_model:
            return (
                "**DISD Technical Parameters & Compatibility**\n\n"
                "**Key Specifications (DISD-TB210 Heavy Series)**\n"
                "- Impact Energy: 5,500 – 8,200 J\n"
                "- Impact Frequency: 350 – 650 bpm\n"
                "- Operating Pressure: 160 – 180 bar (2,320 – 2,610 psi)\n"
                "- Hydraulic Oil Flow: 150 – 190 L/min\n"
                "- Chisel Diameter: 140 mm forged high-alloy steel\n"
                "- Operating Weight: 1,850 kg – 3,200 kg\n\n"
                "**Excavator Compatibility**\n"
                "- Compatible Brands: Caterpillar (CAT), Komatsu, Volvo, Hyundai, Doosan, Sany, Hitachi, Kobelco, JCB\n"
                "- Carrier Range: 20 – 32 Ton excavators (CAT 320/330, Komatsu PC200/PC300, Volvo EC210)\n"
                "- Adapter Brackets: Custom CNC brackets machined to match your carrier's exact pin diameter and spacing\n\n"
                "[See Specifications](#products) · [Get a Quote](#quote-estimator)"
            )

        # ── Fast heuristic: Quote / RFQ inquiry ──────────────────────────────
        is_quote_query = bool(re.search(
            r'\b(request\s+a\s+quote|commercial\s+quotation|proforma\s+invoice|how\s+do\s+i\s+request\s+an?\s+official\s+commercial\s+quotation)\b',
            q
        )) or q in [
            "request a quote", "get a quote", "how do i request an official commercial quotation or proforma invoice?",
            "how do i request an official commercial quotation or proforma invoice"
        ]

        if is_quote_query:
            return (
                "**Requesting a Commercial Quote (RFQ)**\n\n"
                "To receive an official proforma invoice with transparent FOB or CIF (Jeddah/Dammam) pricing:\n\n"
                "1. **Specify Your Machine:** Excavator brand, model, and tonnage.\n"
                "2. **Confirm Hydraulic Parameters:** Operating pressure and flow rate.\n"
                "3. **Pin Dimensions:** Quick-coupler pin diameter and stick width.\n"
                "4. **Receive Formal Proforma:** Dispatched within 24 hours with warranty & delivery terms.\n\n"
                "[Get a Quote](#quote-estimator) · [Contact DISD](#where-to-buy)"
            )

        # ── Fast heuristic: Sales / Contact inquiry ──────────────────────────
        is_sales_query = bool(re.search(
            r'\b(talk\s+to\s+sales|contact\s+your\s+sales|sales\s+and\s+engineering\s+depot|depot\s+in\s+jeddah)\b',
            q
        )) or q in [
            "talk to sales", "contact sales", "how can i contact your sales and engineering depot in jeddah?",
            "how can i contact your sales and engineering depot in jeddah"
        ]

        if is_sales_query:
            return (
                "**DISD Sales & Engineering Depot — Jeddah**\n\n"
                "- **Location:** حي، طريق جازان العام, Al Jawharah, Jeddah, Saudi Arabia\n"
                "- **Phone / WhatsApp:** [+966-543732208](tel:+966543732208)\n"
                "- **Email:** [shoaib@deepaxis.cn](mailto:shoaib@deepaxis.cn)\n"
                "- **Working Hours:** Sunday – Thursday, 08:00 – 18:00 (GMT+3)\n"
                "- **Services:** Immediate inventory, spare chisels, seal kits, and on-site calibration.\n\n"
                "[Contact DISD](#where-to-buy) · [Get a Quote](#quote-estimator)"
            )

        # ── Context-Augmented Search ─────────────────────────────────────────
        # Extract keywords from recent turns so conversational follow-ups
        # like "how can i get this" know what product/topic was being discussed.
        context_keywords = ""
        if conversation_history:
            for turn in conversation_history[-3:]:
                t = turn.get("text") or turn.get("content") or ""
                if t and not turn.get("isGreetingCard"):
                    context_keywords += " " + t

        search_query = f"{query} {context_keywords[:120]}".strip()
        search_results = self.vector_db.search(search_query, top_k=4)

        # Context selection: if search finds relevant matches, use them;
        # otherwise provide core company knowledge base so AI can converse naturally about DISD.
        if search_results and search_results[0][1] >= 0.02:
            context_blocks = [
                f"[{doc.title} ({doc.category})]\n{doc.content}"
                for doc, score in search_results
            ]
        else:
            default_docs = [d for d in self.vector_db.documents if d.doc_id in ["about-us", "services-overview", "contact-info", "hydraulic-breakers"]]
            if not default_docs:
                default_docs = self.vector_db.documents[:3]
            context_blocks = [f"[{doc.title} ({doc.category})]\n{doc.content}" for doc in default_docs]

        context_str = "\n\n".join(context_blocks)

        system_prompt = f"""You are the official, intelligent sales and product assistant for DISD (Dragon International Services & Development LLC).
We engineer high-performance hydraulic breakers, heavy machinery attachments, and earthmoving equipment, with our regional sales, parts, and engineering depot in Jeddah, Saudi Arabia.

YOUR CORE BEHAVIOR:
1. Be intelligent, conversational, and helpful. Answer customer questions naturally, warmly, and professionally.
2. If asked conversational or procedural questions (e.g. "can you help me?", "how can I get this?", "what should I do next?", "tell me more"), respond helpfully and guide the user using DISD capabilities, quotation process, or depot contact.
3. Base all machinery models, specifications, depot locations, and technical facts strictly on DISD's real portfolio and the KNOWLEDGE BASE below.
4. If a question is completely unrelated to heavy machinery, construction, or DISD (e.g. cooking, politics, pop culture), politely decline and state that you specialize only in DISD heavy equipment.
5. NEVER output Markdown tables (no pipe characters | at all).
6. Use short bullet points and scannable formatting. Keep responses concise (under 120 words).
7. Always include 1–2 relevant navigation links from the approved list:
- [View Products](#products)
- [See Specifications](#products)
- [Get a Quote](#quote-estimator)
- [Contact DISD](#where-to-buy)
- [Company Info](#company-profile)
8. When asked generally about products, machinery, or offerings, ALWAYS list these exact 9 products with links:
- [Hydraulic Breaker](#products)
- [Hydraulic wood grapple](#products)
- [Vibrating compactor](#products)
- [Hydraulic pulverizer](#products)
- [Hydraulic quick coupler](#products)
- [Compaction Equipment](#products)
- [Excavator](#products)
- [Forklift](#products)
- [Scissor Lift](#products)

KNOWLEDGE BASE:
{context_str}"""

        messages = [{"role": "system", "content": system_prompt}]
        if conversation_history:
            for turn in conversation_history[-4:]:
                role = "assistant" if turn.get("sender") == "bot" or turn.get("role") == "assistant" else "user"
                content = turn.get("text") or turn.get("content") or ""
                if content and not getattr(turn, 'isGreetingCard', False):
                    messages.append({"role": role, "content": content})
        messages.append({"role": "user", "content": query})

        # ── Tier 1: Groq API ────────────────────────────────────────────────
        if self.groq_client:
            try:
                response = self.groq_client.chat.completions.create(
                    model=self.groq_model,
                    messages=messages,
                    temperature=0.05,
                    max_tokens=350
                )
                answer = response.choices[0].message.content
                return clean_text_formatting(answer)
            except Exception as groq_err:
                print(f"[RAG] Groq API failed ({groq_err}). Switching to OpenRouter fallback...")

        # ── Tier 2: OpenRouter API Fallback ─────────────────────────────────
        if self.openrouter_api_key and self.openrouter_api_key != "your_openrouter_api_key_here":
            try:
                headers = {
                    "Authorization": f"Bearer {self.openrouter_api_key}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://disd-sa.com",
                    "X-Title": "DISD Assistant"
                }
                payload = {
                    "model": self.openrouter_model,
                    "messages": messages,
                    "temperature": 0.05,
                    "max_tokens": 350
                }
                res = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload, timeout=12)
                if res.ok:
                    data = res.json()
                    answer = data["choices"][0]["message"]["content"]
                    return clean_text_formatting(answer)
            except Exception as or_err:
                print(f"[RAG] OpenRouter API fallback failed ({or_err}).")

        # ── Tier 3: Deterministic offline fallback ──────────────────────────
        # LLM unavailable — return the top knowledge-base snippet directly.
        if search_results:
            top_doc, top_score = search_results[0]
            if top_score >= self.CONFIDENCE_THRESHOLD:
                snippet = clean_text_formatting(top_doc.content)
                return f"{snippet}\n\n[View Products](#products) [Contact DISD](#where-to-buy)"

        return ("I don't have details on that right now. "
                "Please reach out to our team directly.\n\n"
                "[Contact DISD](#where-to-buy)")

_chatbot_instance = None
def get_chatbot() -> RAGChatbot:
    global _chatbot_instance
    if _chatbot_instance is None:
        _chatbot_instance = RAGChatbot()
    return _chatbot_instance
