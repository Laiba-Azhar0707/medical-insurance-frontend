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
                  <div key={u.id} style={{ ...styles.userRow, ...(u.is_active ===