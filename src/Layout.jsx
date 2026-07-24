import { NavLink, Outlet } from 'react-router-dom';

// Same doodle family as the login screen, but recolored for the light
// app background and kept very faint — a consistent thread through
// the whole app without competing with actual content.
const DOODLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320">
<g fill="none" stroke="#16323D" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.06">
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
</svg>`;

const doodleDataUrl = `data:image/svg+xml,${encodeURIComponent(DOODLE_SVG)}`;

function Layout({ user, onLogout }) {
  return (
    <div style={styles.page}>
      <div style={styles.doodleLayer} />

      <div style={styles.topbar}>
        <div style={styles.topbarInner}>
          <div style={styles.headerLeft}>
            <div style={styles.crest}>
              <span style={styles.crestPlus}>+</span>
            </div>
            <div>
              <div style={styles.headerEyebrow}>Medical Insurance Portal</div>
              <h2 style={styles.headerTitle}>Welcome, {user?.name}</h2>
            </div>
          </div>

          <div style={styles.rightGroup}>
            <nav style={styles.nav}>
              <NavLink to="/dashboard" style={({ isActive }) => ({ ...styles.navLink, ...(isActive ? styles.navLinkActive : {}) })}>
                Submit Claim
              </NavLink>
              <NavLink to="/history" style={({ isActive }) => ({ ...styles.navLink, ...(isActive ? styles.navLinkActive : {}) })}>
                My History
              </NavLink>
            </nav>

            <button onClick={onLogout} style={styles.logoutButton}>Log out</button>
          </div>
        </div>
      </div>

      <div style={styles.content}>
        <Outlet />
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#F4F6F8',
    position: 'relative',
  },
  doodleLayer: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `url("${doodleDataUrl}")`,
    backgroundRepeat: 'repeat',
    backgroundSize: '320px 320px',
    zIndex: 0,
    pointerEvents: 'none',
  },
  topbar: {
    background: '#16323D',
    borderBottom: '3px solid #0E252E',
    position: 'relative',
    zIndex: 1,
  },
  topbarInner: {
    maxWidth: '1040px',
    margin: '0 auto',
    padding: '18px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  crest: {
    width: '38px',
    height: '38px',
    borderRadius: '11px',
    background: '#ffffff',
    color: '#16323D',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transform: 'rotate(-4deg)',
  },
  crestPlus: {
    fontFamily: "'Fraunces', serif",
    fontSize: '19px',
    fontWeight: 700,
    lineHeight: 1,
    transform: 'rotate(4deg)',
    display: 'inline-block',
  },
  headerEyebrow: {
    fontSize: '10.5px',
    fontWeight: 600,
    color: '#9BC2CC',
    textTransform: 'uppercase',
    letterSpacing: '0.7px',
    marginBottom: '2px',
  },
  headerTitle: {
    fontFamily: "'Fraunces', serif",
    fontSize: '18px',
    fontWeight: 600,
    color: '#ffffff',
    margin: 0,
  },
  rightGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  nav: {
    display: 'flex',
    gap: '2px',
    background: 'rgba(255,255,255,0.08)',
    padding: '4px',
    borderRadius: '999px',
  },
  navLink: {
    padding: '8px 15px',
    fontSize: '13px',
    fontWeight: 600,
    color: '#B9CDD3',
    textDecoration: 'none',
    borderRadius: '999px',
  },
  navLinkActive: {
    background: '#ffffff',
    color: '#16323D',
  },
  logoutButton: {
    padding: '9px 18px',
    fontSize: '13px',
    fontWeight: 600,
    background: 'transparent',
    color: '#E4ECEF',
    border: '1.5px solid rgba(255,255,255,0.3)',
    borderRadius: '999px',
    cursor: 'pointer',
  },
  content: {
    maxWidth: '1040px',
    margin: '0 auto',
    padding: '32px 24px 60px',
    position: 'relative',
    zIndex: 1,
  },
};

export default Layout;