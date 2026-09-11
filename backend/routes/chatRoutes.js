import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const KNOWLEDGE_PATH = path.resolve(__dirname, '../data/knowledge_base.json');

// Stop words for token filtering
const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but',
  'by', 'can', 'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from',
  'further', 'had', 'has', 'have', 'he', 'her', 'here', 'him', 'how', 'i', 'if', 'in', 'into',
  'is', 'it', 'its', 'just', 'me', 'more', 'most', 'my', 'no', 'nor', 'not', 'now', 'of',
  'off', 'on', 'once', 'only', 'or', 'other', 'our', 'out', 'over', 'own', 'so', 'some',
  'such', 'than', 'that', 'the', 'their', 'them', 'then', 'there', 'these', 'they', 'this',
  'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were',
  'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'will', 'with', 'you', 'your'
]);

function loadKnowledgeBase() {
  try {
    if (fs.existsSync(KNOWLEDGE_PATH)) {
      const data = JSON.parse(fs.readFileSync(KNOWLEDGE_PATH, 'utf-8'));
      return data.chunks || [];
    }
  } catch (err) {
    console.error('[Chat RAG] Error loading knowledge base:', err.message);
  }
  return [];
}

function convertMarkdownTables(text) {
  if (!text || !text.includes('|')) return text;

  const lines = text.split('\n');
  const result = [];
  let tableLines = [];

  function processTable(tableBlock) {
    if (tableBlock.length < 2) return tableBlock.join('\n');
    const parseRow = row => row.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim().replace(/<br\s*\/?>/gi, '\n'));
    const dataRows = tableBlock.slice(1).filter(l => !/^\s*\|?\s*[-:]+[-| :]*\|?\s*$/.test(l)).map(parseRow);

    const cards = [];
    for (const row of dataRows) {
      if (!row || row.length === 0 || row.every(c => !c)) continue;
      if (row.length === 1) {
        cards.push(row[0]);
      } else if (row.length === 2) {
        cards.push(`**${row[0]}**\n${row[1]}`);
      } else {
        const col1 = row[0];
        const col2 = row[1];
        const rest = row.slice(2).join('\n');
        cards.push(`**${col2 || col1}**\n*${col1}*\n\n${rest}`);
      }
    }
    return cards.join('\n\n');
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*\|.*\|\s*$/.test(line)) {
      tableLines.push(line);
    } else {
      if (tableLines.length > 0) {
        result.push(processTable(tableLines));
        tableLines = [];
      }
      result.push(line);
    }
  }
  if (tableLines.length > 0) {
    result.push(processTable(tableLines));
  }
  return result.join('\n');
}

function cleanTextFormatting(text) {
  if (!text) return '';
  let cleaned = convertMarkdownTables(text);
  // Separate multiple links chained with pipes or separators
  cleaned = cleaned.replace(/(\[[^\]]+\]\([^\)]+\))\s*\|\s*(\[[^\]]+\]\([^\)]+\))/g, '$1\n$2');
  // Remove raw html code blocks or markdown code wraps
  cleaned = cleaned.replace(/```(?:markdown|text|json)?\n?([\s\S]*?)```/gi, '$1');
  // Normalize html line breaks to newlines
  cleaned = cleaned.replace(/<br\s*\/?>/gi, '\n');
  // Normalize arrows
  cleaned = cleaned.replace(/(\s*[-=]>\s*|\s*[→➜➔➢▶]\s*)/g, ' · ');
  // Normalize excessive newlines
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  return cleaned.trim();
}

function tokenize(text) {
  const matches = (text || '').toLowerCase().match(/[a-zA-Z0-9_\-\.\+]+/g) || [];
  return matches.filter(w => w.length > 1 && !STOP_WORDS.has(w));
}

function searchKnowledge(query, chunks, topK = 3) {
  const queryTokens = tokenize(query);
  if (!queryTokens.length) return [];

  const scored = chunks.map(chunk => {
    let score = 0;
    const titleTokens = new Set(tokenize(chunk.title));
    const contentTokens = tokenize(chunk.content);
    const keywords = (chunk.keywords || []).map(k => k.toLowerCase().trim());

    for (const token of queryTokens) {
      if (titleTokens.has(token)) score += 3.5;
      if (keywords.some(k => k.includes(token) || token.includes(k))) score += 2.5;
      const count = contentTokens.filter(t => t === token).length;
      if (count > 0) score += Math.log(1 + count);
    }

    return { chunk, score };
  });

  return scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(item => item.chunk);
}

router.post('/', async (req, res) => {
  try {
    const { message = '', conversation = [] } = req.body || {};
    const query = (message || '').trim();

    if (!query) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const qLower = query.toLowerCase();

    // 1. Fast heuristics
    if (/^(hi|hello|hey|greetings|good\s*(morning|afternoon|evening))\b/.test(qLower) && qLower.split(/\s+/).length <= 3) {
      return res.json({
        success: true,
        response: 'Hello! Welcome to DISD (Dragon International Services & Development). How can I assist you with our hydraulic breakers, excavators, or engineering equipment today?',
        text: 'Hello! Welcome to DISD (Dragon International Services & Development). How can I assist you with our hydraulic breakers, excavators, or engineering equipment today?'
      });
    }

    if (/^(bye|goodbye|thank\s*you|thanks|nothing\s*else|that\'?s\s*all)\b/.test(qLower) && qLower.split(/\s+/).length <= 4) {
      return res.json({
        success: true,
        response: "You're very welcome! Feel free to reach out anytime if you need more assistance. Have a great day!",
        text: "You're very welcome! Feel free to reach out anytime if you need more assistance. Have a great day!"
      });
    }

    // 1.1 Product portfolio inquiry fast heuristic
    const isGeneralProductQuery = /\b(what\s+(products?|machinery|equipment|attachments?)|our\s+machinery|product\s*list|list\s+of\s+products?|what\s+do\s+you\s+(offer|sell|have|make|provide)|portfolio|catalog(ue)?|types?\s+of\s+(products?|machinery|equipment))\b/.test(qLower) ||
      ['products', 'machinery', 'equipment', 'our machinery', 'product list', 'what do you offer', 'what products do you have', 'what products do you sell', 'what machinery, hydraulic breakers, and attachments do you offer?'].includes(qLower);

    const hasSpecificModel = /\b(tb210|fl500|vc80|ex360|wg360|sl1400|tb-210|fl-500|vc-80|ex-360|wg-360|sl-1400)\b/.test(qLower);

    if (isGeneralProductQuery && !hasSpecificModel) {
      const productListReply = "DISD manufactures and supplies heavy machinery and attachments for construction, quarrying, and demolition:\n\n" +
        "- [Hydraulic Breaker](#products)\n" +
        "- [Hydraulic wood grapple](#products)\n" +
        "- [Vibrating compactor](#products)\n" +
        "- [Hydraulic pulverizer](#products)\n" +
        "- [Hydraulic quick coupler](#products)\n" +
        "- [Compaction Equipment](#products)\n" +
        "- [Excavator](#products)\n" +
        "- [Forklift](#products)\n" +
        "- [Scissor Lift](#products)\n\n" +
        "[See Specifications](#products) · [Get a Quote](#quote-estimator)";
      return res.json({ success: true, response: productListReply, text: productListReply });
    }

    // 1.2 Specifications & Compatibility fast heuristic
    const isSpecsQuery = /\b(technical\s*parameters|excavator\s*compatibility|specifications?|specs\b|compatibility\s*specifications?|carrier\s*compatibility)\b/.test(qLower) ||
      ['specifications', 'specs', 'technical parameters', 'excavator compatibility', 'what are the technical parameters and excavator compatibility specifications?'].includes(qLower);

    if (isSpecsQuery && !hasSpecificModel) {
      const specsReply = "**DISD Technical Parameters & Compatibility**\n\n" +
        "**Key Specifications (DISD-TB210 Heavy Series)**\n" +
        "- Impact Energy: 5,500 – 8,200 J\n" +
        "- Impact Frequency: 350 – 650 bpm\n" +
        "- Operating Pressure: 160 – 180 bar (2,320 – 2,610 psi)\n" +
        "- Hydraulic Oil Flow: 150 – 190 L/min\n" +
        "- Chisel Diameter: 140 mm forged high-alloy steel\n" +
        "- Operating Weight: 1,850 kg – 3,200 kg\n\n" +
        "**Excavator Compatibility**\n" +
        "- Compatible Brands: Caterpillar (CAT), Komatsu, Volvo, Hyundai, Doosan, Sany, Hitachi, Kobelco, JCB\n" +
        "- Carrier Range: 20 – 32 Ton excavators (CAT 320/330, Komatsu PC200/PC300, Volvo EC210)\n" +
        "- Adapter Brackets: Custom CNC brackets machined to match your carrier's exact pin diameter and spacing\n\n" +
        "[See Specifications](#products) · [Get a Quote](#quote-estimator)";
      return res.json({ success: true, response: specsReply, text: specsReply });
    }

    // 1.3 Quote / RFQ fast heuristic
    const isQuoteQuery = /\b(request\s+a\s+quote|commercial\s+quotation|proforma\s+invoice|how\s+do\s+i\s+request\s+an?\s+official\s+commercial\s+quotation)\b/.test(qLower) ||
      ['request a quote', 'get a quote', 'how do i request an official commercial quotation or proforma invoice?', 'how do i request an official commercial quotation or proforma invoice'].includes(qLower);

    if (isQuoteQuery) {
      const quoteReply = "**Requesting a Commercial Quote (RFQ)**\n\n" +
        "To receive an official proforma invoice with transparent FOB or CIF (Jeddah/Dammam) pricing:\n\n" +
        "1. **Specify Your Machine:** Excavator brand, model, and tonnage.\n" +
        "2. **Confirm Hydraulic Parameters:** Operating pressure and flow rate.\n" +
        "3. **Pin Dimensions:** Quick-coupler pin diameter and stick width.\n" +
        "4. **Receive Formal Proforma:** Dispatched within 24 hours with warranty & delivery terms.\n\n" +
        "[Get a Quote](#quote-estimator) · [Contact DISD](#where-to-buy)";
      return res.json({ success: true, response: quoteReply, text: quoteReply });
    }

    // 1.4 Sales / Contact fast heuristic
    const isSalesQuery = /\b(talk\s+to\s+sales|contact\s+your\s+sales|sales\s+and\s+engineering\s+depot|depot\s+in\s+jeddah)\b/.test(qLower) ||
      ['talk to sales', 'contact sales', 'how can i contact your sales and engineering depot in jeddah?', 'how can i contact your sales and engineering depot in jeddah'].includes(qLower);

    if (isSalesQuery) {
      const salesReply = "**DISD Sales & Engineering Depot — Jeddah**\n\n" +
        "- **Location:** حي، طريق جازان العام, Al Jawharah, Jeddah, Saudi Arabia\n" +
        "- **Phone / WhatsApp:** [+966-543732208](tel:+966543732208)\n" +
        "- **Email:** [shoaib@deepaxis.cn](mailto:shoaib@deepaxis.cn)\n" +
        "- **Working Hours:** Sunday – Thursday, 08:00 – 18:00 (GMT+3)\n" +
        "- **Services:** Immediate inventory, spare chisels, seal kits, and on-site calibration.\n\n" +
        "[Contact DISD](#where-to-buy) · [Get a Quote](#quote-estimator)";
      return res.json({ success: true, response: salesReply, text: salesReply });
    }

    // 2. Knowledge search
    const chunks = loadKnowledgeBase();
    const relevantChunks = searchKnowledge(query, chunks, 3);
    const contextStr = relevantChunks.map(c => `[${c.title} (${c.category})]\n${c.content}`).join('\n\n');

    const systemPrompt = `You are the official, expert industrial sales and product assistant for DISD (Dragon International Services & Development LLC).
Your goal is to communicate concisely, professionally, and helpfully like an experienced equipment sales consultant.

CRITICAL FORMATTING RULES:
1. NEVER output Markdown tables. Absolutely NO pipe-based tables (| Col | Col |).
2. NEVER use pipe characters (|) anywhere in the response, not even as separators between links or text. Put each link on its own line.
3. NEVER dump database rows or long unformatted bullet lists. Keep every response scannable and conversational.
4. Use short bold headings, short paragraphs, and concise bullet points.
5. Keep each product response scannable on desktop and mobile.

RESPONSE TEMPLATES:

[SINGLE PRODUCT TEMPLATE] - When asked about a specific model (e.g. "Tell me about DISD-TB210"):
**[Model Number]**
*[Series Name or Equipment Type]*

[One short sentence explaining what it is and primary excavator/carrier range.]

**Key Specifications**
- Impact Energy: [val]
- Impact Rate: [val]
- Chisel: [val]
- Operating Pressure: [val]
- Excavator Range: [val]

**Compatible Excavators**
[3-4 compatible machines, e.g. CAT 320 / 330 · Komatsu PC200 / PC300 · Volvo EC210]

[View Product Details](#products)
[Contact DISD](#where-to-buy)

[CATEGORY TEMPLATE] - When asked about a category (e.g. "What hydraulic breakers do you have?"):
**[Category Name]**

[1-2 introductory sentences about DISD's offering in this category.]

**Featured Models**

**[Model 1]**
[Carrier ton rating] · [Impact energy / capacity] · [Key spec]
[View Details](#products)

**[Model 2]**
[Carrier ton rating] · [Impact energy / capacity] · [Key spec]
[View Details](#products)

[Explore [Category Name]](#products)

[COMPARISON TEMPLATE] - When comparing models (e.g. "TB210 vs SB151"):
**[Model A] vs [Model B]**

**[Model A]**
- Excavator: [val]
- Key Metric: [val]
- Best For: [val]

**[Model B]**
- Excavator: [val]
- Key Metric: [val]
- Best For: [val]

**Best Choice**
[1-2 sentences summarizing which model suits the user's excavator tonnage or job requirements.]

[View Product Details](#products)
[Get a Quote](#quote-estimator)

[RECOMMENDATION RULE]:
If the user asks "Which breaker is suitable for a 30 ton excavator?", directly recommend the matching model (DISD-TB210 for 20-32 ton excavators) rather than listing the entire portfolio.

VALID WEBSITE NAVIGATION ANCHORS (ONLY USE THESE REAL ROUTES):
- [View Product Details](#products)
- [Explore Hydraulic Breakers](#products)
- [View All Models](#products)
- [See Specifications](#products)
- [Get a Quote](#quote-estimator)
- [Contact DISD](#where-to-buy)
- [Company Profile](#company-profile)
Do NOT invent URLs. Always use clean natural labels in square brackets with the anchor link.

COMPANY KNOWLEDGE BASE:
${contextStr}`;

    const messages = [{ role: 'system', content: systemPrompt }];
    if (Array.isArray(conversation)) {
      for (const turn of conversation.slice(-4)) {
        const role = (turn.sender === 'bot' || turn.role === 'assistant') ? 'assistant' : 'user';
        const content = turn.text || turn.content || '';
        if (content) messages.push({ role, content });
      }
    }
    messages.push({ role: 'user', content: query });

    const groqApiKey = process.env.GROQ_API_KEY?.trim();
    const groqModel = process.env.GROQ_MODEL?.trim() || 'openai/gpt-oss-120b';
    const openRouterApiKey = process.env.OPENROUTER_API_KEY?.trim();
    const openRouterModel = process.env.OPENROUTER_MODEL?.trim() || 'meta-llama/llama-3.3-70b-instruct';

    // 3. Groq API
    if (groqApiKey && groqApiKey !== 'your_groq_api_key_here') {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${groqApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: groqModel,
            messages,
            temperature: 0.1,
            max_tokens: 450
          }),
          signal: AbortSignal.timeout(8000)
        });

        if (response.ok) {
          const data = await response.json();
          const reply = cleanTextFormatting(data.choices?.[0]?.message?.content);
          if (reply) {
            return res.json({ success: true, response: reply, text: reply });
          }
        }
      } catch (err) {
        console.warn('[Chat RAG] Groq API attempt failed, trying fallback:', err.message);
      }
    }

    // 4. OpenRouter Fallback
    if (openRouterApiKey && openRouterApiKey !== 'your_openrouter_api_key_here') {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openRouterApiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://disdmachinery.com',
            'X-Title': 'DISD AI Assistant'
          },
          body: JSON.stringify({
            model: openRouterModel,
            messages,
            temperature: 0.1,
            max_tokens: 450
          }),
          signal: AbortSignal.timeout(10000)
        });

        if (response.ok) {
          const data = await response.json();
          const reply = cleanTextFormatting(data.choices?.[0]?.message?.content);
          if (reply) {
            return res.json({ success: true, response: reply, text: reply });
          }
        }
      } catch (err) {
        console.warn('[Chat RAG] OpenRouter fallback failed:', err.message);
      }
    }

    // 5. Offline Knowledge Synthesis Fallback
    if (relevantChunks.length > 0) {
      const top = relevantChunks[0];
      const reply = cleanTextFormatting(`${top.content}\n\n[View Product Details](#products)\n[Contact DISD](#where-to-buy)`);
      return res.json({ success: true, response: reply, text: reply });
    }

    const defaultReply = 'Thank you for reaching out to DISD. For immediate technical assistance or machinery inquiries, please visit our [Contact Section](#where-to-buy) or email us at [shoaib@deepaxis.cn](mailto:shoaib@deepaxis.cn).';
    return res.json({ success: true, response: defaultReply, text: defaultReply });
  } catch (err) {
    console.error('[Chat RAG] Error processing chat request:', err);
    res.status(500).json({ error: 'Failed to process chat message.' });
  }
});

export default router;
