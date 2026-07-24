import { useState, useEffect } from 'react';

function formatDate(isoString) {
  if (!isoString) return '—';
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function ClaimHistory({ token }) {
  const [claims, setClaims] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/claims/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          throw new Error(
            response.status === 401
              ? 'Your session has expired. Please log out and log back in.'
              : 'We couldn\'t load your claim history. Please try again.'
          );
        }
        const data = await response.json();
        setClaims(data.claims);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [token]);

  return (
    <div>
      <div style={styles.pageHeader}>
        <h3 style={styles.pageTitle}>My Claim History</h3>
        <p style={styles.pageSubtitle}>Every claim you've submitted, with its current status and outcome.</p>
      </div>

      {loading && (
        <div style={styles.emptyState}>
          <span style={{ ...styles.spinner, ...styles.spinnerLarge }} />
          <div style={styles.emptyStateText}>Loading your claims...</div>
        </div>
      )}

      {error && <div style={styles.errorBox}>⚠ {error}</div>}

      {!loading && !error && claims?.length === 0 && (
        <div style={styles.emptyState}>
          <div style={styles.emptyStateIcon}>📄</div>
          <div style={styles.emptyStateText}>You haven't submitted any claims yet.</div>
        </div>
      )}

      {!loading && !error && claims?.length > 0 && (
        <div style={styles.list}>
          {claims.map((claim) => (
            <div key={claim.claim_id} style={styles.card}>
              <div style={styles.cardTop}>
                <div>
                  <div style={styles.claimId}>Claim #{claim.claim_id}</div>
                  <div style={styles.claimDate}>{formatDate(claim.submitted_at)}</div>
                </div>
                <div style={{
                  ...styles.stamp,
                  ...(claim.status === 'Needs Manual Review' ? styles.stampReview : styles.stampOk),
                }}>
                  {claim.status === 'Needs Manual Review' ? 'Review' : claim.status === 'In Progress' ? 'Pending' : 'Processed'}
                </div>
              </div>

              <div style={styles.cardBody}>
                <div style={styles.metaRow}>
                  <span style={styles.metaLabel}>Claim Type</span>
                  <span style={styles.metaValue}>{claim.claim_type === 'pre_paid' ? 'Pre-paid' : 'Reimbursement'}</span>
                </div>
                <div style={styles.metaRow}>
                  <span style={styles.metaLabel}>Amount</span>
                  <span style={styles.metaAmount}>
                    {claim.approved_amount != null ? `$${Math.abs(claim.approved_amount).toFixed(2)}` : '—'}
                  </span>
                </div>
                <div style={styles.metaRow}>
                  <span style={styles.metaLabel}>Admin Review</span>
                  <span style={{
                    ...styles.adminTag,
                    ...(claim.admin_status === 'Approved' ? styles.adminApproved : claim.admin_status === 'Rejected' ? styles.adminRejected : styles.adminPending),
                  }}>
                    {claim.admin_status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  pageHeader: {
    marginBottom: '24px',
  },
  pageTitle: {
    fontFamily: "'Fraunces', serif",
    fontSize: '24px',
    fontWeight: 600,
    color: '#16232E',
    margin: '0 0 6px 0',
  },
  pageSubtitle: {
    fontSize: '13.5px',
    color: '#667380',
    margin: 0,
  },
  list: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
  },
  card: {
    background: '#ffffff',
    borderRadius: '10px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(22, 50, 61, 0.06), 0 8px 24px rgba(22, 50, 61, 0.06)',
    border: '1px solid #E7EBEE',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
    paddingBottom: '16px',
    borderBottom: '1px solid #EEF1F3',
  },
  claimId: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: '15px',
    fontWeight: 600,
    color: '#16232E',
  },
  claimDate: {
    fontSize: '11.5px',
    color: '#9AA5AD',
    marginTop: '3px',
  },
  stamp: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: '10px',
    fontWeight: 600,
    letterSpacing: '1.2px',
    textTransform: 'uppercase',
    padding: '5px 12px',
    borderRadius: '3px',
    border: '2px double currentColor',
    transform: 'rotate(-3deg)',
    display: 'inline-block',
    flexShrink: 0,
  },
  stampOk: {
    color: '#2F8F6E',
    background: 'rgba(47, 143, 110, 0.07)',
  },
  stampReview: {
    color: '#B45309',
    background: 'rgba(180, 83, 9, 0.07)',
  },
  cardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  metaRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: '12px',
    color: '#9AA5AD',
  },
  metaValue: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#16232E',
  },
  metaAmount: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: '13.5px',
    fontWeight: 600,
    color: '#16323D',
  },
  adminTag: {
    fontSize: '11px',
    fontWeight: 600,
    padding: '3px 10px',
    borderRadius: '999px',
  },
  adminPending: {
    background: '#F1F4F5',
    color: '#667380',
  },
  adminApproved: {
    background: '#EEF6F4',
    color: '#2F8F6E',
  },
  adminRejected: {
    background: '#FDF1EC',
    color: '#9A3F12',
  },
  emptyState: {
    background: '#ffffff',
    borderRadius: '10px',
    border: '1.5px dashed #D5DCE1',
    padding: '60px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '14px',
    textAlign: 'center',
  },
  emptyStateIcon: {
    fontSize: '36px',
    opacity: 0.4,
  },
  emptyStateText: {
    fontSize: '13.5px',
    color: '#9AA5AD',
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid #E7EBEE',
    borderTopColor: '#16323D',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'spin 0.7s linear infinite',
  },
  errorBox: {
    background: '#FDF1EC',
    color: '#9A3F12',
    fontSize: '13px',
    padding: '12px 14px',
    borderRadius: '8px',
    border: '1px solid #F3CFB8',
  },
};

export default ClaimHistory;