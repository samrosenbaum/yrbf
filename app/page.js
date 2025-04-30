import Link from 'next/link';

export default function Home() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontFamily: 'Arial, sans-serif',
      background: '#f7f7f7',
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>Meet Brad, Your AI Boyfriend 💬❤️</h1>
      <p style={{ fontSize: '1.2rem', maxWidth: '600px', textAlign: 'center', marginBottom: '40px' }}>
        Flirty, supportive, and always here for you. Chat free for 5 messages, then unlock unlimited conversations.
      </p>
      <Link href="/chat">
        <button style={{
          fontSize: '1.2rem',
          padding: '15px 30px',
          borderRadius: '10px',
          border: 'none',
          backgroundColor: '#ff4081',
          color: '#fff',
          cursor: 'pointer',
        }}>
          Start Chatting Now
        </button>
      </Link>
    </div>
  );
}
