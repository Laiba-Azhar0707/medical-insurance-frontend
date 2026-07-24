import { useState } from 'react';

// A small repeating tile of subtle medical-themed line-art doodles,
// same idea as WhatsApp's chat wallpaper — scattered icons at low
// opacity so it reads as texture, not decoration.
const DOODLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320">
<g fill="none" stroke="#8FE0C9" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.5">
<g transform="translate(30,25) rotate(-18)"><path d="M0 -12 L0 12 M-12 0 L12 0" /></g>
<g transform="translate(110,15) rotate(24)"><rect x="-10" y="-13" width="20" height="26" rx="2" /><rect x="-4" y="-17" width="8" height="6" rx="1" /><path d="M-6 -6 L6 -6 M-6 0 L6 0" /></g>
<g transform="translate(200,40) rotate(-35)"><rect x="-12" y="-6" width="24" height="12" rx="6" /><path d="M-4 -6 L4 6" /></g>
<g transform="translate(270,20) rotate(12)"><path d="M0 -9 C0 -15 -7 -15 -7 -9 C-7 -3 0 1 0 5 C0 1 7 -3 7 -9 C7 -15 0 -15 0 -9 Z" /></g>
<g transform="translate(15,110) rotate(40)"><path d="M-14 -10 C-14 2 -4 8 6 2 C11 -1 11 -10 6 -10" /><circle cx="6" cy="-12" r="4" /></g>
<g transform="translate(95,130) rotate(-12)"><rect x="-11" y="-14" width="22" height="28" rx="2" /><path d="M-6 -6 L6 -6 M-6 0 L6 0 M-6 6 L2 6" /></g>
<g transform="translate(180,105) rotate(55)"><path d="M0 -8 L0 8 M-8 0 L8 0" /></g>
<g transform="translate(255,125) rotate(-8)"><path d="M-9 -13 L9 -13 L9 13 L4 9 L0 13 L-4 9 L-9 13 Z" /><path d="M-5 -7 L5 -7 M-5 -1 L5 -1" /></g>
<g transform="translate(40,215) rotate(-28)"><rect x="-12" y="-6" width="24" height="12" rx="6" /><path d="M-4 -6 L4 6" /></g>
<g transform="translate(120,235) rotate(20)"><path d="M0 -6 C0 -10 -5 -10 -5 -6 C-5 -2 0 1 0 4 C0 1 5 -2 5 -6 C5 -10 0 -10 0 -6 Z" /></g>
<g transform="translate(205,215) rotate(-50)"><rect x="-9" y="-12" width="18" height="24" rx="2" /><rect x="-4" y="-16" width="8" height="6" rx="1" /><path d="M-5 -6 L5 -6 M-5 0 L5 0" /></g>
<g transform="translate(280,235) rotate(15)"><path d="M0 -9 L0 9 M-9 0 L9 0" /></g>
<g transform="translate(70,290) rotate(-15)"><path d="M-11 -9 C-11 1 -3 6 4 1 C8 -1 8 -9 4 -9" /><circle cx="4" cy="-11" r="3.5" /></g>
<g transform="translate(160,275) rotate(33)"><rect x="-10" y="-13" width="20" height="26" rx="2" /><rect x="-4" y="-17" width="8" height="6" rx="1" /><path d="M-6 -6 L6 -6 M-6 0 L6 0" /></g>
<g transform="translate(245,290) rotate(-22)"><path d="M0 -7 C0 -11 -5.5 -11 -5.5 -7 C-5.5 -3 0 0 0 3 C0 0 5.5 -3 5.5 -7 C5.5 -11 0 -11 0 -7 Z" /></g>
</g>
</svg>`;;

const doodleDataUrl = `data:image/svg+xml,${encodeURIComponent(DOODLE_SVG)}`;

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
      <div style={styles.doodleLayer} />

      <div style={styles.card}>
        <div style={styles.crestRow}>
          <div style={styles.crest}>
            <span style={styles.crestPlus}>+</span>
          </div>
        </div>
        <h1 style={styles.title}>Medical Insurance Portal</h1>
        <p style={styles.subtitle}>Sign in to submit and track your claims 💙</p>

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
              'Sign in →'
            )}
          </button>
        </form>

        <div style={styles.divider} />
        <p style={styles.footnote}>🔒 secured with JWT authentication</p>
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
    background: 'radial-gradient(circle at 20% 20%, #1D4552 0%, #16323D 45%, #101F27 100%)',
    padding: '20px',
    position: 'relative',
    overflow: 'hidden',
  },
  doodleLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `url("${doodleDataUrl}")`,
    backgroundRepeat: 'repeat',
    backgroundSize: '200px 200px',
    zIndex: 0,
  },
  card: {
    width: '400px',
    background: '#ffffff',
    borderRadius: '28px',
    padding: '48px 40px 36px',
    boxShadow: '0 30px 70px rgba(9, 25, 32, 0.4)',
    textAlign: 'center',
    position: 'relative',
    zIndex: 1,
  },
  crestRow: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  crest: {
    width: '58px',
    height: '58px',
    borderRadius: '18px',
    background: 'linear-gradient(145deg, #1D4552 0%, #16323D 100%)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 18px rgba(22, 50, 61, 0.35)',
    transform: 'rotate(-4deg)',
  },
  crestPlus: {
    fontFamily: "'Fraunces', serif",
    fontSize: '26px',
    fontWeight: 600,
    lineHeight: 1,
    transform: 'rotate(4deg)',
    display: 'inline-block',
  },
  title: {
    fontFamily: "'Fraunces', serif",
    fontSize: '23px',
    fontWeight: 600,
    margin: '0 0 8px 0',
    color: '#16232E',
    letterSpacing: '-0.2px',
  },
  subtitle: {
    fontSize: '13.5px',
    color: '#667380',
    margin: '0 0 30px 0',
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
    fontSize: '11.5px',
    fontWeight: 600,
    color: '#48545F',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  input: {
    padding: '13px 15px',
    fontSize: '14px',
    fontFamily: "'IBM Plex Sans', sans-serif",
    border: '1.5px solid #E3E8EB',
    borderRadius: '14px',
    outline: 'none',
    background: '#FAFBFC',
    transition: 'border-color 0.15s, background 0.15s',
  },
  button: {
    marginTop: '8px',
    padding: '14px',
    fontSize: '14.5px',
    fontWeight: 600,
    letterSpacing: '0.2px',
    background: '#16323D',
    color: 'white',
    border: 'none',
    borderRadius: '999px',
    transition: 'transform 0.15s, box-shadow 0.15s, background 0.15s',
  },
  buttonHover: {
    background: '#0E252E',
    transform: 'translateY(-2px)',
    boxShadow: '0 10px 24px rgba(22, 50, 61, 0.3)',
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
    background: '#FDF1EC',
    color: '#9A3F12',
    fontSize: '13px',
    padding: '11px 13px',
    borderRadius: '12px',
    border: '1px solid #F3CFB8',
  },
  divider: {
    height: '1px',
    background: '#EEF1F3',
    margin: '28px 0 16px',
  },
  footnote: {
    fontSize: '11px',
    fontWeight: 500,
    color: '#9AA5AD',
    margin: 0,
  },
};

export default Login;