'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function ChatPageWrapper() {
  return (
    <Suspense fallback={<div>Loading Brad...</div>}>
      <ChatPage />
    </Suspense>
  );
}

function ChatPage() {
  const searchParams = useSearchParams();
  const [isPaidUser, setIsPaidUser] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [limitReached, setLimitReached] = useState(false);

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setIsPaidUser(true);
      setLimitReached(false); // reset limit
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

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();

      if (!data.reply) {
        throw new Error('No reply from AI.');
      }

      setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      console.error('Error talking to Brad:', err);
      setMessages([...newMessages, { role: 'assistant', content: 'Sorry, something went wrong!' }]);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ fontSize: '2rem' }}>Chat with Brad 💬</h1>
      <div style={{
        border: '1px solid #ccc',
        borderRadius: '10px',
        padding: '20px',
        margin: '20px 0',
        height: '400px',
        overflowY: 'auto'
      }}>
        {messages.map((msg, i) => (
          <p key={i}><strong>{msg.role === 'user' ? 'You' : 'Brad'}:</strong> {msg.content}</p>
        ))}
      </div>
      {limitReached ? (
        <div>
          <p>You've reached your free message limit.</p>
          <button
            onClick={async () => {
              const res = await fetch('/api/checkout', { method: 'POST' });
              const data = await res.json();
              window.location = data.url;
            }}
            style={{ background: '#ff4081', color: '#fff', padding: '10px 20px', borderRadius: '5px', border: 'none' }}
          >
            Unlock Unlimited Chat with Brad – just $3/week
          </button>
        </div>
      ) : (
        <>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Say something to Brad..."
            style={{ padding: '10px', width: '70%' }}
          />
          <button onClick={handleSend} style={{ padding: '10px 20px', marginLeft: '10px' }}>
            Send
          </button>
        </>
      )}
    </div>
  );
}
