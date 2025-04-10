export default function NotFound() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column',
      padding: '20px',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist or has been moved.</p>
      <a 
        href="/" 
        style={{ 
          marginTop: '2rem',
          display: 'inline-block',
          padding: '0.5rem 1rem',
          backgroundColor: '#0070f3',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '5px'
        }}
      >
        Return to Home
      </a>
    </div>
  );
} 