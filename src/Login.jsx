import { useState } from 'react';

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitHover, setSubmitHover] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Invalid email or password');
      }

      const data = await response.json();
      onLoginSuccess(data.access_token, { name: data.name, role: data.role });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoCircle}>+</div>
        <h1 style={styles.title}>Medical Insurance Portal</h1>
        <p style={styles.subtitle}>Sign in to submit and track your claims</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          {error && <div style={styles.errorBox}>⚠ {error}</div>}

          <button
            type="submit"
            style={{
              ...styles.button,
              ...(submitHover && !loading ? styles.buttonHover : {}),
              opacity: loading ? 0.75 : 1,
              cursor: loading ? 'default' : 'pointer',
            }}
            disabled={loading}
            onMouseEnter={() => setSubmitHover(true)}
            onMouseLeave={() => setSubmitHover(false)}
          >
            {loading ? (
              <span style={styles.buttonContent}>
                <span style={styles.spinner} />
                Signing in...
              </span>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        <p style={styles.footnote}>Secured with JWT authentication</p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #eef2f7 0%, #dde7f0 100%)',
    padding: '20px',
  },
  card: {
    width: '380px',
    background: '#ffffff',
    borderRadius: '16px',
    padding: '40px 36px',
    boxShadow: '0 10px 40px rgba(23, 43, 77, 0.10)',
    textAlign: 'center',
  },
  logoCircle: {
    width: '52px',
    height: '52px',
    borderRadius: '14px',
    background: '#1f3864',
    color: '#fff',
    fontSize: '26px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
  },
  title: {
    fontSize: '20px',
    fontWeight: 700,
    margin: '0 0 6px 0',
    color: '#111827',
  },
  subtitle: {
    fontSize: '13.5px',
    color: '#6b7280',
    margin: '0 0 28px 0',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    textAlign: 'left',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '12.5px',
    fontWeight: 600,
    color: '#374151',
  },
  input: {
    padding: '11px 13px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '9px',
    outline: 'none',
  },
  button: {
    marginTop: '6px',
    padding: '12px',
    fontSize: '14.5px',
    fontWeight: 600,
    background: '#1f3864',
    color: 'white',
    border: 'none',
    borderRadius: '9px',
    transition: 'background 0.15s',
  },
  buttonHover: {
    background: '#16294d',
  },
  buttonContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
  },
  spinner: {
    width: '15px',
    height: '15px',
    border: '2px solid rgba(255,255,255,0.4)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'spin 0.7s linear infinite',
  },
  errorBox: {
    background: '#fef2f2',
    color: '#b91c1c',
    fontSize: '13px',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #fecaca',
  },
  footnote: {
    marginTop: '22px',
    fontSize: '11px',
    color: '#9ca3af',
  },
};

export default Login;