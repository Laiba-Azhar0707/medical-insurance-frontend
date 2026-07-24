import { useState, useEffect } from 'react';

function formatDate(isoString) {
  if (!isoString) return '—';
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function AdminPanel({ token }) {
  const [tab, setTab] = useState('claims');

  const [claims, setClaims] = useState(null);
  const [claimsError, setClaimsError] = useState('');
  const [claimsLoading, setClaimsLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState(null);

  const [users, setUsers] = useState(null);
  const [usersError, setUsersError] = useState('');
  const [usersLoading, setUsersLoading] = useState(true);
  const [userActionId, setUserActionId] = useState(null);
  const [userActionError, setUserActionError] = useState('');

  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'user' });
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');
  const [creating, setCreating] = useState(false);

  const authHeaders = { Authorization: `Bearer ${token}` };

  const fetchClaims = async () => {
    setClaimsLoading(true);
    setClaimsError('');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/claims`, { headers: authHeaders });
      if (!response.ok) throw new Error('We couldn\'t load claims. Please try again.');
      const data = await response.json();
      setClaims(data.claims);
    } catch (err) {
      setClaimsError(err.message);
    } finally {
      setClaimsLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    setUsersError('');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/users`, { headers: authHeaders });
      if (!response.ok) throw new Error('We couldn\'t load users. Please try again.');
      const data = await response.json();
      setUsers(data.users);
    } catch (err) {
      setUsersError(err.message);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
    fetchUsers();
  }, [token]);

  const handleReview = async (claimId, decision) => {
    setReviewingId(claimId);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/claims/${claimId}/review`, {
        method: 'POST',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision }),
      });
      if (!response.ok) throw new Error('Review failed');
      const updated = await response.json();
      setClaims((prev) => prev.map((c) => (c.claim_id === updated.claim_id ? updated : c)));
    } catch (err) {
      setClaimsError('We couldn\'t update that claim. Please try again.');
    } finally {
      setReviewingId(null);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreateSuccess('');
    setCreating(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/users`, {
        method: 'POST',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.detail || 'We couldn\'t create that user. Please check the details and try again.');
      }
      setCreateSuccess(`${newUser.name} was added successfully.`);
      setNewUser({ name: '', email: '', password: '', role: 'user' });
      fetchUsers();
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (userId) => {
    setUserActionId(userId);
    setUserActionError('');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/users/${userId}/toggle-active`, {
        method: 'PATCH',
        headers: authHeaders,
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.detail || 'We couldn\'t update that user. Please try again.');
      }
      const updated = await response.json();
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? { ...u, is_active: updated.is_active } : u)));
    } catch (err) {
      setUserActionError(err.message);
    } finally {
      setUserActionId(null);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Delete ${userName}? This can't be undone.`)) return;

    setUserActionId(userId);
    setUserActionError('');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.detail || 'We couldn\'t delete that user. Please try again.');
      }
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      setUserActionError(err.message);
    } finally {
      setUserActionId(null);
    }
  };

  return (
    <div>
      <div style={styles.pageHeader}>
        <h3 style={styles.pageTitle}>Admin Panel</h3>
        <p style={styles.pageSubtitle}>Review claims and manage user accounts.</p>
      </div>

      <div style={styles.tabs}>
        <button
          onClick={() => setTab('claims')}
          style={{ ...styles.tabButton, ...(tab === 'claims' ? styles.tabButtonActive : {}) }}
        >
          Claim Review
        </button>
        <button
          onClick={() => setTab('users')}
          style={{ ...styles.tabButton, ...(tab === 'users' ? styles.tabButtonActive : {}) }}
        >
          Manage Users
        </button>
      </div>

      {tab === 'claims' && (
        <div>
          {claimsLoading && (
            <div style={styles.emptyState}>
              <span style={{ ...styles.spinner, ...styles.spinnerLarge }} />
              <div style={styles.emptyStateText}>Loading claims...</div>
            </div>
          )}

          {claimsError && <div style={styles.errorBox}>⚠ {claimsError}</div>}

          {!claimsLoading && !claimsError && claims?.length === 0 && (
            <div style={styles.emptyState}>
              <div style={styles.emptyStateIcon}>📄</div>
              <div style={styles.emptyStateText}>No claims have been submitted yet.</div>
            </div>
          )}

          {!claimsLoading && !claimsError && claims?.length > 0 && (
            <div style={styles.list}>
              {claims.map((claim) => (
                <div key={claim.claim_id} style={styles.card}>
                  <div style={styles.cardTop}>
                    <div>
                      <div style={styles.claimId}>Claim #{claim.claim_id}</div>
                      <div style={styles.claimDate}>{formatDate(claim.submitted_at)} · {claim.user_name} ({claim.user_email})</div>
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
                  </div>

                  <div style={styles.reviewRow}>
                    {claim.admin_status === 'Pending Review' ? (
                      <>
                        <button
                          onClick={() => handleReview(claim.claim_id, 'approved')}
                          disabled={reviewingId === claim.claim_id}
                          style={styles.approveButton}
                        >
                          {reviewingId === claim.claim_id ? 'Saving...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleReview(claim.claim_id, 'rejected')}
                          disabled={reviewingId === claim.claim_id}
                          style={styles.rejectButton}
                        >
                          {reviewingId === claim.claim_id ? 'Saving...' : 'Reject'}
                        </button>
                      </>
                    ) : (
                      <span style={{
                        ...styles.adminTag,
                        ...(claim.admin_status === 'Approved' ? styles.adminApproved : styles.adminRejected),
                      }}>
                        {claim.admin_status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'users' && (
        <div style={styles.usersGrid}>
          <div style={styles.card}>
            <h4 style={styles.cardTitle}>Add a New User</h4>
            <form onSubmit={handleCreateUser} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>Name</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Password</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  style={styles.input}
                  required
                  minLength={6}
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  style={styles.input}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {createError && <div style={styles.errorBox}>⚠ {createError}</div>}
              {createSuccess && <div style={styles.successBox}>✓ {createSuccess}</div>}

              <button type="submit" disabled={creating} style={styles.submitButton}>
                {creating ? 'Adding...' : 'Add User'}
              </button>
            </form>
          </div>

          <div style={styles.card}>
            <h4 style={styles.cardTitle}>All Users</h4>
            {usersLoading && <div style={styles.emptyStateText}>Loading...</div>}
            {usersError && <div style={styles.errorBox}>⚠ {usersError}</div>}
            {userActionError && <div style={styles.errorBox}>⚠ {userActionError}</div>}
            {!usersLoading && !usersError && (
              <div style={styles.userList}>
                {users?.map((u) => (
                  <div key={u.id} style={{ ...styles.userRow, ...(u.is_active === false ? styles.userRowInactive : {}) }}>
                    <div style={styles.userRowTop}>
                      <div>
                        <div style={styles.userName}>{u.name}</div>
                        <div style={styles.userEmail}>{u.email}</div>
                      </div>
                      <div style={styles.userTags}>
                        <span style={{ ...styles.roleTag, ...(u.role === 'admin' ? styles.roleAdmin : styles.roleUser) }}>
                          {u.role}
                        </span>
                        {u.is_active === false && <span style={styles.inactiveTag}>Deactivated</span>}
                      </div>
                    </div>
                    <div style={styles.userActions}>
                      <button
                        onClick={() => handleToggleActive(u.id)}
                        disabled={userActionId === u.id}
                        style={u.is_active === false ? styles.reactivateButton : styles.deactivateButton}
                      >
                        {userActionId === u.id ? 'Saving...' : u.is_active === false ? 'Reactivate' : 'Deactivate'}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.id, u.name)}
                        disabled={userActionId === u.id}
                        style={styles.deleteButton}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  pageHeader: {
    marginBottom: '20px',
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
  tabs: {
    display: 'inline-flex',
    gap: '2px',
    background: '#ffffff',
    padding: '4px',
    borderRadius: '999px',
    border: '1px solid #E7EBEE',
    marginBottom: '24px',
  },
  tabButton: {
    padding: '9px 20px',
    fontSize: '13px',
    fontWeight: 600,
    color: '#667380',
    background: 'transparent',
    border: 'none',
    borderRadius: '999px',
    cursor: 'pointer',
    fontFamily: "'IBM Plex Sans', sans-serif",
  },
  tabButtonActive: {
    background: '#16323D',
    color: '#ffffff',
  },
  list: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
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
    gap: '10px',
  },
  claimId: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: '15px',
    fontWeight: 600,
    color: '#16232E',
  },
  claimDate: {
    fontSize: '11px',
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
    marginBottom: '16px',
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
  reviewRow: {
    display: 'flex',
    gap: '8px',
    paddingTop: '14px',
    borderTop: '1px solid #EEF1F3',
  },
  approveButton: {
    flex: 1,
    padding: '9px',
    fontSize: '12.5px',
    fontWeight: 600,
    background: '#EEF6F4',
    color: '#2F8F6E',
    border: '1px solid #C3E0D8',
    borderRadius: '999px',
    cursor: 'pointer',
    fontFamily: "'IBM Plex Sans', sans-serif",
  },
  rejectButton: {
    flex: 1,
    padding: '9px',
    fontSize: '12.5px',
    fontWeight: 600,
    background: '#FDF1EC',
    color: '#9A3F12',
    border: '1px solid #F3CFB8',
    borderRadius: '999px',
    cursor: 'pointer',
    fontFamily: "'IBM Plex Sans', sans-serif",
  },
  adminTag: {
    fontSize: '11.5px',
    fontWeight: 600,
    padding: '5px 14px',
    borderRadius: '999px',
  },
  adminApproved: {
    background: '#EEF6F4',
    color: '#2F8F6E',
  },
  adminRejected: {
    background: '#FDF1EC',
    color: '#9A3F12',
  },
  usersGrid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.2fr)',
    gap: '20px',
    alignItems: 'start',
  },
  cardTitle: {
    fontFamily: "'Fraunces', serif",
    fontSize: '17px',
    fontWeight: 600,
    color: '#16232E',
    margin: '0 0 18px 0',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
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
    padding: '11px 13px',
    fontSize: '14px',
    fontFamily: "'IBM Plex Sans', sans-serif",
    border: '1.5px solid #E3E8EB',
    borderRadius: '10px',
    outline: 'none',
    background: '#FAFBFC',
  },
  submitButton: {
    marginTop: '4px',
    padding: '12px',
    fontSize: '14px',
    fontWeight: 600,
    background: '#16323D',
    color: 'white',
    border: 'none',
    borderRadius: '999px',
    cursor: 'pointer',
    fontFamily: "'IBM Plex Sans', sans-serif",
  },
  userList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  userRow: {
    padding: '14px',
    background: '#FAFBFC',
    borderRadius: '8px',
    border: '1px solid #EEF1F3',
  },
  userRowInactive: {
    background: '#F7F5F1',
    opacity: 0.75,
  },
  userRowTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '10px',
  },
  userTags: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    alignItems: 'flex-end',
  },
  userName: {
    fontSize: '13.5px',
    fontWeight: 600,
    color: '#16232E',
  },
  userEmail: {
    fontSize: '11.5px',
    color: '#9AA5AD',
    marginTop: '2px',
  },
  roleTag: {
    fontSize: '10.5px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    padding: '4px 11px',
    borderRadius: '999px',
  },
  roleUser: {
    background: '#EEF3F4',
    color: '#16323D',
  },
  roleAdmin: {
    background: '#FEF6EC',
    color: '#B45309',
  },
  inactiveTag: {
    fontSize: '10px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    padding: '3px 9px',
    borderRadius: '999px',
    background: '#F1F4F5',
    color: '#9AA5AD',
  },
  userActions: {
    display: 'flex',
    gap: '8px',
    paddingTop: '10px',
    borderTop: '1px solid #EEF1F3',
  },
  deactivateButton: {
    flex: 1,
    padding: '7px',
    fontSize: '11.5px',
    fontWeight: 600,
    background: '#FEF6EC',
    color: '#B45309',
    border: '1px solid #F3D9AE',
    borderRadius: '999px',
    cursor: 'pointer',
    fontFamily: "'IBM Plex Sans', sans-serif",
  },
  reactivateButton: {
    flex: 1,
    padding: '7px',
    fontSize: '11.5px',
    fontWeight: 600,
    background: '#EEF6F4',
    color: '#2F8F6E',
    border: '1px solid #C3E0D8',
    borderRadius: '999px',
    cursor: 'pointer',
    fontFamily: "'IBM Plex Sans', sans-serif",
  },
  deleteButton: {
    flex: 1,
    padding: '7px',
    fontSize: '11.5px',
    fontWeight: 600,
    background: '#FDF1EC',
    color: '#9A3F12',
    border: '1px solid #F3CFB8',
    borderRadius: '999px',
    cursor: 'pointer',
    fontFamily: "'IBM Plex Sans', sans-serif",
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
    padding: '11px 13px',
    borderRadius: '8px',
    border: '1px solid #F3CFB8',
    marginBottom: '12px',
  },
  successBox: {
    background: '#EEF6F4',
    color: '#2F8F6E',
    fontSize: '13px',
    padding: '11px 13px',
    borderRadius: '8px',
    border: '1px solid #C3E0D8',
    marginBottom: '12px',
  },
};

export default AdminPanel;