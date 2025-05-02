'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function ChatPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChatPage />
    </Suspense>
  );
}

function ChatPage() {
  const searchParams = useSearchParams();
  const personality = searchParams.get('personality') || 'default';
  const displayName = personality.charAt(0).toUpperCase() + personality.slice(1);
  
  const [isPaidUser, setIsPaidUser] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [limitReached, setLimitReached] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Paid user check
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setIsPaidUser(true);
      setLimitReached(false);
    }
  }, [searchParams]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    
    if (!isPaidUser && newMessages.filter(msg => msg.role === 'user').length >= 5) {
      setLimitReached(true);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();

      setMessages([
        ...newMessages,
        { role: 'assistant', content: data.reply || 'Sorry, something went wrong.' },
      ]);
    } catch (err) {
      console.error('Error:', err);
      setMessages([
        ...newMessages,
        { role: 'assistant', content: 'Sorry, something went wrong!' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Personality Styles
  const personalityColors = {
    dimitri: { background: '#1f1f1f', bubble: '#333333', text: '#fff' },
    nico: { background: '#f7f7f7', bubble: '#111111', text: '#fff' },
    cole: { background: '#e6f0e6', bubble: '#5c7a5c', text: '#fff' },
    default: { background: '#f5f5f5', bubble: '#ccc', text: '#000' },
  };

  const colors = personalityColors[personality] || personalityColors.default;

  return (
    <div style={{ 
      backgroundColor: colors.background, 
      minHeight: '100vh', 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif' 
    }}>
      <h1 style={{ fontSize: '2rem', color: colors.text, textAlign: 'center', marginBottom: '20px' }}>
        Chat with {displayName} 💬
      </h1>

      <div style={{ 
        background: '#fff', 
        padding: '20px', 
        borderRadius: '10px', 
        maxWidth: '600px', 
        margin: '0 auto',
        minHeight: '400px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
            background: msg.role === 'user' ? '#eee' : colors.bubble,
            color: msg.role === 'user' ? '#000' : '#fff',
            padding: '10px 15px',
            borderRadius: '20px',
            maxWidth: '70%',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            opacity: 1,
            transform: 'translateY(0)',
            transition: 'opacity 0.3s ease, transform 0.3s ease',
          }}>
            {msg.role !== 'user' && (
              <img 
                src={`/avatars/${personality}.png`} 
                alt={displayName}
                style={{ width: '30px', height: '30px', borderRadius: '50%' }}
              />
            )}
            <span>{msg.content}</span>
          </div>
        ))}

        {loading && (
          <div style={{
            alignSelf: 'flex-start',
            background: colors.bubble,
            color: '#fff',
            padding: '10px 15px',
            borderRadius: '20px',
            maxWidth: '70%',
            fontStyle: 'italic'
          }}>
            {displayName} is typing...
          </div>
        )}

        <div ref={messagesEndRef}></div>
      </div>

      {limitReached ? (
        <div style={{ marginTop: '20px', textAlign: 'center', color: colors.text }}>
          <p>You've reached your free message limit.</p>
          <button
            onClick={async () => {
              const res = await fetch('/api/checkout', { method: 'POST' });
              const data = await res.json();
              window.location = data.url;
            }}
            style={{
              background: '#ff4081',
              color: '#fff',
              padding: '10px 20px',
              borderRadius: '5px',
              border: 'none'
            }}
          >
            Unlock Unlimited Chat with {displayName} – $3/week
          </button>
        </div>
      ) : (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '10px', 
          marginTop: '20px' 
        }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Say something to ${displayName}...`}
            style={{
              padding: '10px',
              flex: 1,
              borderRadius: '5px',
              border: '1px solid #ccc'
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
          />
          <button 
            onClick={handleSend}
            style={{
              padding: '10px 20px',
              background: colors.bubble,
              color: '#fff',
              borderRadius: '5px',
              border: 'none'
            }}
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
}
