import { useState } from 'react';

function Dashboard({ token, user, onLogout }) {
  const [claimType, setClaimType] = useState('reimbursement');
  const [prescription, setPrescription] = useState(null);
  const [medicineBill, setMedicineBill] = useState(null);
  const [labBill, setLabBill] = useState(null);
  const [consultationReceipt, setConsultationReceipt] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!prescription || !medicineBill || !labBill || !consultationReceipt) {
      setError('Please upload all four documents.');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('claim_type', claimType);
    formData.append('prescription', prescription);
    formData.append('medicine_bill', medicineBill);
    formData.append('lab_bill', labBill);
    formData.append('consultation_receipt', consultationReceipt);

    try {
      const response = await fetch('http://127.0.0.1:8000/claims', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Claim submission failed');
      }

      const data = await response.json();
      setMessage(`Claim #${data.claim_id} submitted successfully. Status: ${data.status}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h2>Welcome, {user.name}</h2>
        <button onClick={onLogout} style={styles.logoutButton}>Log out</button>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        <h3>Submit a new claim</h3>

        <label style={styles.label}>Claim type</label>
        <select
          value={claimType}
          onChange={(e) => setClaimType(e.target.value)}
          style={styles.input}
        >
          <option value="reimbursement">Reimbursement</option>
          <option value="pre_paid">Pre-paid</option>
        </select>

        <label style={styles.label}>Doctor's prescription</label>
        <input type="file" onChange={(e) => setPrescription(e.target.files[0])} style={styles.input} />

        <label style={styles.label}>Medicine bill</label>
        <input type="file" onChange={(e) => setMedicineBill(e.target.files[0])} style={styles.input} />

        <label style={styles.label}>Lab bill</label>
        <input type="file" onChange={(e) => setLabBill(e.target.files[0])} style={styles.input} />

        <label style={styles.label}>Consultation receipt</label>
        <input type="file" onChange={(e) => setConsultationReceipt(e.target.files[0])} style={styles.input} />

        {error && <p style={styles.error}>{error}</p>}
        {message && <p style={styles.success}>{message}</p>}

        <button type="submit" style={styles.submitButton} disabled={loading}>
          {loading ? 'Submitting...' : 'Submit claim'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  page: {
    maxWidth: '480px',
    margin: '40px auto',
    padding: '0 16px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  logoutButton: {
    padding: '8px 14px',
    cursor: 'pointer',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    background: 'white',
    padding: '24px',
    borderRadius: '8px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
  },
  label: {
    fontSize: '13px',
    fontWeight: 'bold',
    marginTop: '8px',
  },
  input: {
    padding: '8px',
    fontSize: '14px',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
  submitButton: {
    marginTop: '16px',
    padding: '10px',
    fontSize: '14px',
    background: '#1f3864',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  error: {
    color: 'red',
    fontSize: '13px',
    margin: '8px 0 0 0',
  },
  success: {
    color: 'green',
    fontSize: '13px',
    margin: '8px 0 0 0',
  },
};

export default Dashboard;