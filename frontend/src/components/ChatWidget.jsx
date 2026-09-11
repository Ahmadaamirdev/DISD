import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Loader2,
  RotateCcw,
  Check,
  Copy,
  Settings,
  FileText,
  Headphones,
  ArrowRight,
  Paperclip
} from 'lucide-react';
import { Link } from 'react-router-dom';
import chatbotLogoImg from '../assets/chatbot-logo.png';
import '../styles/chat-widget.css';

// Chatbot Logo
function ChatbotLogo({ className = "disd-chatbot-logo", style = {} }) {
  return (
    <img
      src={chatbotLogoImg}
      alt="DISD Assistant"
      className={className}
      style={{
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        objectFit: 'cover',
        display: 'block',
        ...style
      }}
    />
  );
}

// Excavator Machinery Icon matching reference image
function MachineryIcon({ className = "w-4 h-4", style = {} }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ width: '18px', height: '18px', color: '#FF9900', flexShrink: 0, ...style }}
    >
      <path d="M2 17a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-4H2v4z" />
      <path d="M4 13V7a2 2 0 0 1 2-2h4l4 4" />
      <path d="M14 9l4-4 4 3-2 3" />
      <circle cx="5" cy="19" r="1.5" />
      <circle cx="12" cy="19" r="1.5" />
      <path d="M18 11l3 3" />
    </svg>
  );
}

// 4 Quick Action Cards matching the 2x2 grid from the reference image
const QUICK_ACTIONS = [
  {
    id: 'machinery',
    label: 'Our Machinery',
    icon: <MachineryIcon />,
    query: 'What machinery, hydraulic breakers, and attachments do you offer?'
  },
  {
    id: 'specifications',
    label: 'Specifications',
    icon: <Settings size={18} color="#FF9900" style={{ flexShrink: 0 }} />,
    query: 'What are the technical parameters and excavator compatibility specifications?'
  },
  {
    id: 'quote',
    label: 'Request a Quote',
    icon: <FileText size={18} color="#FF9900" style={{ flexShrink: 0 }} />,
    query: 'How do I request an official commercial quotation or proforma invoice?'
  },
  {
    id: 'sales',
    label: 'Talk to Sales',
    icon: <Headphones size={18} color="#FF9900" style={{ flexShrink: 0 }} />,
    query: 'How can I contact your sales and engineering depot in Jeddah?'
  }
];

const INITIAL_MESSAGE = {
  id: 'init-1',
  sender: 'bot',
  isGreetingCard: true,
  title: 'Hi there! 👋',
  text: "I'm your DISD assistant. How can I help you today?",
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
};

// Converts pipe-delimited markdown tables into scannable conversational cards
function convertMarkdownTables(text) {
  if (!text || !text.includes('|')) return text;

  const lines = text.split('\n');
  const result = [];
  let tableLines = [];

  function processTable(tableBlock) {
    if (tableBlock.length < 2) return tableBlock.join('\n');
    const parseRow = (row) =>
      row
        .trim()
        .replace(/^\||\|$/g, '')
        .split('|')
        .map((c) => c.trim().replace(/<br\s*\/?>/gi, '\n'));
    const dataRows = tableBlock
      .slice(1)
      .filter((l) => !/^\s*\|?\s*[-:]+[-| :]*\|?\s*$/.test(l))
      .map(parseRow);

    const cards = [];
    for (const row of dataRows) {
      if (!row || row.length === 0 || row.every((c) => !c)) continue;
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

function FormattedMessageText({ text }) {
  if (!text) return null;

  // 1. Defensively convert any Markdown table with pipes to clean cards
  const sanitizedText = convertMarkdownTables(text);

  // 2. Parse lines and separate content into blocks and CTA action buttons
  const lines = sanitizedText.split('\n');
  const renderedBlocks = [];
  const ctaButtons = [];

  // Helper to parse inline bold, italic, links, emails
  const parseInline = (inlineText, keyPrefix) => {
    if (!inlineText) return null;
    const regex = /(\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]\(([^)]+)\)|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|https?:\/\/[^\s]+)/g;
    const parts = [];
    let last = 0;
    let match;

    while ((match = regex.exec(inlineText)) !== null) {
      if (match.index > last) {
        parts.push(inlineText.substring(last, match.index));
      }
      const full = match[0];
      const boldText = match[2];
      const italicText = match[3];
      const linkLabel = match[4];
      const linkHref = match[5];

      if (boldText) {
        parts.push(
          <strong key={`${keyPrefix}-${match.index}`} style={{ color: '#FFFFFF', fontWeight: 600 }}>
            {boldText}
          </strong>
        );
      } else if (italicText) {
        parts.push(
          <em key={`${keyPrefix}-${match.index}`} style={{ color: '#CBD5E1', fontStyle: 'italic', fontSize: '12.5px' }}>
            {italicText}
          </em>
        );
      } else if (linkLabel && linkHref) {
        if (linkHref.startsWith('#')) {
          parts.push(
            <a
              key={`${keyPrefix}-${match.index}`}
              href={linkHref}
              onClick={(e) => {
                const target = document.querySelector(linkHref);
                if (target) {
                  e.preventDefault();
                  target.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="disd-chat-link"
            >
              {linkLabel}
            </a>
          );
        } else if (linkHref.startsWith('/')) {
          parts.push(
            <Link key={`${keyPrefix}-${match.index}`} to={linkHref} className="disd-chat-link">
              {linkLabel}
            </Link>
          );
        } else {
          parts.push(
            <a key={`${keyPrefix}-${match.index}`} href={linkHref} target="_blank" rel="noopener noreferrer" className="disd-chat-link">
              {linkLabel}
            </a>
          );
        }
      } else if (full.includes('@')) {
        parts.push(
          <a key={`${keyPrefix}-${match.index}`} href={`mailto:${full}`} className="disd-chat-link">
            {full}
          </a>
        );
      } else {
        parts.push(full);
      }
      last = match.index + full.length;
    }
    if (last < inlineText.length) {
      parts.push(inlineText.substring(last));
    }
    return parts.length > 0 ? parts : inlineText;
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) {
      renderedBlocks.push(<div key={`empty-${i}`} style={{ height: '6px' }} />);
      continue;
    }

    // Check if line is solely a standalone footer CTA link e.g. [View Products](#products)
    const singleLinkMatch = rawLine.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (singleLinkMatch && (/view|see|quote|contact|where-to-buy|company|explore|more/i.test(singleLinkMatch[1]) || i === lines.length - 1)) {
      ctaButtons.push({ id: `cta-${i}`, label: singleLinkMatch[1], href: singleLinkMatch[2] });
      continue;
    }

    // Check if line is multiple standalone links e.g. [View Products](#products) [Contact DISD](#where-to-buy)
    const multiLinkMatches = [...rawLine.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)];
    if (multiLinkMatches.length > 1 && rawLine.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '').trim() === '') {
      multiLinkMatches.forEach((m, idx) => {
        ctaButtons.push({ id: `cta-${i}-${idx}`, label: m[1], href: m[2] });
      });
      continue;
    }

    // Bullet point (- or • or *)
    if (/^[-*•]\s+/.test(rawLine)) {
      const bulletContent = rawLine.replace(/^[-*•]\s+/, '');
      renderedBlocks.push(
        <div key={`bullet-${i}`} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', margin: '2px 0' }}>
          <span style={{ color: '#FF9900', fontSize: '14px', lineHeight: 1.4, flexShrink: 0 }}>•</span>
          <div style={{ flex: 1, lineHeight: 1.55 }}>{parseInline(bulletContent, `b-${i}`)}</div>
        </div>
      );
      continue;
    }

    // Heading (e.g. ### Title or **Title** alone on a line)
    if (/^###\s+/.test(rawLine) || (/^\*\*[^*]+\*\*$/.test(rawLine) && rawLine.length < 60)) {
      const headingText = rawLine.replace(/^###\s+/, '').replace(/^\*\*|\*\*$/g, '');
      renderedBlocks.push(
        <div
          key={`head-${i}`}
          style={{
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: '14.5px',
            marginTop: '8px',
            marginBottom: '4px',
            letterSpacing: '-0.01em'
          }}
        >
          {headingText}
        </div>
      );
      continue;
    }

    // Regular text line
    renderedBlocks.push(
      <div key={`line-${i}`} style={{ lineHeight: 1.6, wordBreak: 'break-word' }}>
        {parseInline(rawLine, `l-${i}`)}
      </div>
    );
  }

  return (
    <div>
      {renderedBlocks}

      {/* Render navigation links as inline orange underlined text (matching screenshot) */}
      {ctaButtons.length > 0 && (
        <div style={{ marginTop: '10px', fontSize: '13px', lineHeight: 1.6 }}>
          {ctaButtons.map((btn, idx) => (
            <span key={btn.id}>
              {idx > 0 && <span style={{ color: '#64748B', margin: '0 5px' }}>·</span>}
              <a
                href={btn.href}
                onClick={(e) => {
                  if (btn.href.startsWith('#')) {
                    const target = document.querySelector(btn.href);
                    if (target) {
                      e.preventDefault();
                      target.scrollIntoView({ behavior: 'smooth' });
                    }
                  }
                }}
                className="disd-chat-link"
              >
                {btn.label}
              </a>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [isOpen]);

  const sendQuery = async (queryText) => {
    const query = (queryText || inputMessage).trim();
    if (!query || isTyping) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query, conversation: messages })
      }).catch(() => fetch('http://localhost:8085/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query, conversation: messages })
      }));
      const data = await res.json();
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: data.response || data.text || "Thank you for reaching out.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: "I'm having trouble connecting right now. Please visit our [Contact Page](#where-to-buy) or email [shoaib@deepaxis.cn](mailto:shoaib@deepaxis.cn).",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <>
      {/* 1. Floating Trigger Launcher Button with radiant golden-orange glow */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="disd-chat-launcher"
          aria-label="Open DISD Assistant"
          style={{ padding: 0, overflow: 'hidden' }}
        >
          <img
            src={chatbotLogoImg}
            alt="Open DISD Assistant"
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              objectFit: 'cover',
              display: 'block'
            }}
          />
        </button>
      )}

      {/* 2. Chatbot Interface Window with failproof pure CSS */}
      {isOpen && (
        <div className="disd-chat-window">
          {/* Header */}
          <div className="disd-chat-header">
            <div className="disd-chat-header-brand">
              {/* Chatbot Logo */}
              <ChatbotLogo style={{ width: '38px', height: '38px' }} />
              <div>
                <h3 className="disd-chat-header-title">DISD Assistant</h3>
                <div className="disd-chat-header-status">
                  <span className="disd-chat-status-dot"></span>
                  Online
                </div>
              </div>
            </div>
            <div className="disd-chat-header-actions">
              <button
                onClick={() => setMessages([INITIAL_MESSAGE])}
                className="disd-chat-icon-btn"
                title="Reset Chat"
              >
                <RotateCcw size={16} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="disd-chat-icon-btn"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages & Actions Body */}
          <div className="disd-chat-body">
            {messages.map((msg) => {
              if (msg.isGreetingCard) {
                return (
                  <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Greeting Message Bubble */}
                    <div className="disd-chat-row">
                      {/* Avatar with chatbot logo */}
                      <div className="disd-chat-avatar" style={{ padding: '3px', overflow: 'hidden' }}>
                        <ChatbotLogo style={{ width: '100%', height: '100%' }} />
                      </div>
                      {/* Speech Bubble */}
                      <div className="disd-chat-bubble-bot">
                        <div style={{ fontWeight: 600, color: '#FFFFFF', marginBottom: '3px' }}>{msg.title}</div>
                        <div style={{ color: '#CBD5E1' }}>{msg.text}</div>
                      </div>
                    </div>

                    {/* 2x2 Quick Actions Grid directly below the greeting message */}
                    <div className="disd-chat-grid">
                      {QUICK_ACTIONS.map((action) => (
                        <button
                          key={action.id}
                          onClick={() => sendQuery(action.query)}
                          className="disd-chat-action-card"
                        >
                          {action.icon}
                          <span className="disd-chat-action-label">
                            {action.label}
                          </span>
                          <ArrowRight size={13} color="#64748B" style={{ flexShrink: 0 }} />
                        </button>
                      ))}
                    </div>
                  </div>
                );
              }

              if (msg.sender === 'user') {
                return (
                  <div key={msg.id} className="disd-chat-row disd-chat-row-user">
                    <div className="disd-chat-bubble-user">
                      <div>{msg.text}</div>
                      <div style={{ fontSize: '10px', color: 'rgba(0,0,0,0.6)', textAlign: 'right', marginTop: '4px', fontWeight: 'normal' }}>
                        {msg.timestamp}
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={msg.id} className="disd-chat-row">
                  <div className="disd-chat-avatar" style={{ padding: '3px', overflow: 'hidden' }}>
                    <ChatbotLogo style={{ width: '100%', height: '100%' }} />
                  </div>
                  <div className="disd-chat-bubble-bot">
                    <FormattedMessageText text={msg.text} />
                    <div className="disd-chat-bubble-footer">
                      <span>{msg.timestamp}</span>
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        title="Copy message"
                      >
                        {copiedId === msg.id ? (
                          <Check size={14} color="#34D399" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="disd-chat-row" style={{ alignItems: 'center' }}>
                <div className="disd-chat-avatar" style={{ padding: '3px', overflow: 'hidden' }}>
                  <ChatbotLogo style={{ width: '100%', height: '100%' }} />
                </div>
                <div className="disd-chat-bubble-bot" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px' }}>
                  <Loader2 size={14} color="#FF9900" className="animate-spin" />
                  <span style={{ fontSize: '12px', color: '#94A3B8' }}>DISD Assistant is thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Capsule Area */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendQuery();
            }}
            className="disd-chat-footer"
          >
            <div className="disd-chat-input-pill">
              <label
                style={{ cursor: 'pointer', color: '#94A3B8', display: 'flex', alignItems: 'center', padding: '2px' }}
                title="Attach specification file"
              >
                <Paperclip size={16} />
                <input
                  type="file"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      sendQuery(`[Uploaded file: ${e.target.files[0].name}] Can you assist with this equipment file?`);
                    }
                  }}
                />
              </label>
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                className="disd-chat-input"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isTyping}
                className="disd-chat-send-btn"
                aria-label="Send message"
              >
                <Send size={14} style={{ transform: 'rotate(-10deg) translateX(1px)', fill: '#000000' }} />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
