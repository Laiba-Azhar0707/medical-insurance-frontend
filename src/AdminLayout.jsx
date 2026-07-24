import { Outlet } from 'react-router-dom';

function AdminLayout({ user, onLogout }) {
  return (
    <div style={styles.page}>
      <div style={styles.topbar}>
        <div style={styles.topbarInner}>
          <div style={styles.headerLeft}>
            <div style={styles.crest}>
              <span style={styles.crestPlus}>+</span>
            </div>
            <div>
              <div style={styles.headerEyebrow}>Admin Console</div>
              <h2 style={styles.headerTitle}>{user?.name}</h2>
            </div>
          </div>

          <div style={styles.rightGroup}>
            <span style={styles.adminBadge}>ADMIN</span>
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
    background: '#F7F5F1',
  },
  topbar: {
    background: '#ffffff',
    borderBottom: '3px solid #16323D',
  },
  topbarInner: {
    maxWidth: '1100px',
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
    background: '#16323D',
    color: '#fff',
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
    color: '#B45309',
    textTransform: 'uppercase',
    letterSpacing: '0.7px',
    marginBottom: '2px',
  },
  headerTitle: {
    fontFamily: "'Fraunces', serif",
    fontSize: '18px',
    fontWeight: 600,
    color: '#16232E',
    margin: 0,
  },
  rightGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  adminBadge: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: '10.5px',
    fontWeight: 700,
    letterSpacing: '1.5px',
    color: '#B45309',
    background: '#FEF6EC',
    border: '1.5px solid #F3D9AE',
    padding: '6px 14px',
    borderRadius: '999px',
  },
  logoutButton: {
    padding: '9px 18px',
    fontSize: '13px',
    fontWeight: 600,
    background: 'transparent',
    color: '#16323D',
    border: '1.5px solid #D5DCE1',
    borderRadius: '999px',
    cursor: 'pointer',
    fontFamily: "'IBM Plex Sans', sans-serif",
  },
  content: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '32px 24px 60px',
  },
};

export default AdminLayout;