import { useState } from 'react';

const DOC_CONFIG = {
  prescription: { label: "Doctor's Prescription", icon: '📋' },
  medicine_bill: { label: 'Medicine Bill', icon: '💊' },
  lab_bill: { label: 'Lab Bill', icon: '🧪' },
  consultation_receipt: { label: 'Consultation Receipt', icon: '🩺' },
};

function Dashboard({ token, user, onLogout }) {
  const [claimType, setClaimType] = useState('reimbursement');
  const [filesByType, setFilesByType] = useState({
    prescription: [],
    medicine_bill: [],
    lab_bill: [],
    consultation_receipt: [],
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [submitHover, setSubmitHover] = useState(false);

  const handleFileChange = (docType, fileList) => {
    setFilesByType((prev) => ({ ...prev, [docType]: Array.from(fileList) }));
  };

  const handleDrop = (docType, e) => {
    e.preventDefault();
    setDragOver(null);
    if (e.dataTransfer.files?.length) {
      handleFileChange(docType, e.dataTransfer.files);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    const missing = Object.entries(filesByType).filter(([, files]) => files.length === 0);
    if (missing.length > 0) {
      setError(`Please upload at least one page for: ${missing.map(([k]) => DOC_CONFIG[k].label).join(', ')}`);
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('claim_type', claimType);
    Object.entries(filesByType).forEach(([docType, files]) => {
      files.forEach((file) => formData.append(docType, file));
    });

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/claims`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error('Claim submission failed');

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.logoBadge}>+</div>
          <div>
            <div style={styles.headerEyebrow}>Medical Insurance Portal</div>
            <h2 style={styles.headerTitle}>Welcome, {user.name}</h2>
          </div>
        </div>
        <button onClick={onLogout} style={styles.logoutButton}>Log out</button>
      </div>

      <div style={styles.grid}>
        <form onSubmit={handleSubmit} style={styles.card}>
          <h3 style={styles.cardTitle}>Submit a New Claim</h3>
          <p style={styles.cardSubtitle}>Upload all required documents. Drag and drop or click to browse — multiple pages supported.</p>

          <div style={styles.field}>
            <label style={styles.label}>Claim Type</label>
            <select
              value={claimType}
              onChange={(e) => setClaimType(e.target.value)}
              style={styles.select}
            >
              <option value="reimbursement">Reimbursement</option>
              <option value="pre_paid">Pre-paid</option>
            </select>
          </div>

          {Object.entries(DOC_CONFIG).map(([docType, config]) => {
            const files = filesByType[docType];
            const isDragging = dragOver === docType;
            return (
              <div style={styles.field} key={docType}>
                <label style={styles.label}>{config.label}</label>
                <label
                  htmlFor={`file-${docType}`}
                  style={{
                    ...styles.dropZone,
                    ...(isDragging ? styles.dropZoneActive : {}),
                    ...(files.length > 0 ? styles.dropZoneFilled : {}),
                  }}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(docType); }}
                  onDragLeave={() => setDragOver(null)}
                  onDrop={(e) => handleDrop(docType, e)}
                >
                  <span style={styles.dropZoneIcon}>{config.icon}</span>
                  <div style={styles.dropZoneText}>
                    {files.length > 0 ? (
                      <>
                        <span style={styles.dropZoneFileName}>
                          {files.length} file{files.length > 1 ? 's' : ''} selected
                        </span>
                        <span style={styles.dropZoneHint}>{files.map(f => f.name).join(', ')}</span>
                      </>
                    ) : (
                      <>
                        <span style={styles.dropZoneFileName}>Drop files here or click to browse</span>
                        <span style={styles.dropZoneHint}>JPG, PNG — multiple pages supported</span>
                      </>
                    )}
                  </div>
                  <input
                    id={`file-${docType}`}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFileChange(docType, e.target.files)}
                    style={styles.hiddenInput}
                  />
                </label>
              </div>
            );
          })}

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
                Processing claim...
              </span>
            ) : (
              'Submit Claim'
            )}
          </button>
        </form>

        <div style={styles.resultsPanel}>
          {!result && !loading && (
            <div style={styles.emptyState}>
              <div style={styles.emptyStateIcon}>📄</div>
              <div style={styles.emptyStateText}>Submitted claim results will appear here</div>
            </div>
          )}

          {loading && (
            <div style={styles.emptyState}>
              <span style={{ ...styles.spinner, ...styles.spinnerLarge }} />
              <div style={styles.emptyStateText}>Reading documents and extracting data...</div>
            </div>
          )}

          {result && (
            <div style={styles.card}>
              <div style={styles.resultHeader}>
                <h3 style={styles.cardTitle}>Claim #{result.claim_id}</h3>
                <div style={{
                  ...styles.statusBadge,
                  ...(result.status === 'Needs Manual Review' ? styles.statusReview : styles.statusOk),
                }}>
                  {result.status === 'Needs Manual Review' ? '⚠ ' : '✓ '}
                  {result.status}
                </div>
              </div>

              <div style={styles.resultList}>
                {result.extraction_summary.map((item, idx) => (
                  <div key={idx} style={styles.resultRow}>
                    <div style={styles.resultRowHeader}>
                      <span style={styles.resultDocName}>
                        {DOC_CONFIG[item.doc_type]?.icon} {DOC_CONFIG[item.doc_type]?.label || item.doc_type}
                      </span>
                      {item.needs_review && <span style={styles.reviewTag}>Needs Review</span>}
                    </div>
                    {item.error ? (
                      <div style={styles.resultError}>{item.error}</div>
                    ) : (
                      <div style={styles.resultDetails}>
                        {item.items_found} item{item.items_found !== 1 ? 's' : ''} extracted
                        {item.pages_processed ? ` · ${item.pages_processed} page(s) processed` : ''}
                        {item.identity_flag && (
                          <div style={styles.warningNote}>⚠ Identity fields could not be reliably verified</div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {result.deduction_summary && (
                <div style={styles.deductionSection}>
                  <h4 style={styles.deductionTitle}>Claim Financial Summary</h4>

                  <div style={styles.approvedBox}>
                    <span style={styles.approvedLabel}>
                      {result.deduction_summary.action_type === 'auto_deduct'
                        ? 'Amount Approved for Reimbursement'
                        : 'Amount to Be Returned'}
                    </span>
                    <span style={styles.approvedAmount}>
                      ${result.deduction_summary.total_unprescribed_amount.toFixed(2)}
                    </span>
                  </div>

                  <div style={styles.summaryRow}>
                    <span style={styles.summaryLabel}>Total Flagged (Unprescribed)</span>
                    <span style={styles.summaryAmount}>
                      ${result.deduction_summary.total_unprescribed_amount.toFixed(2)}
                    </span>
                  </div>

                  <div style={styles.summaryRow}>
                    <span style={styles.summaryLabel}>Action</span>
                    <span style={styles.actionTag}>
                      {result.deduction_summary.action_type === 'auto_deduct'
                        ? 'Auto-deducted from reimbursement'
                        : 'Return notice issued'}
                    </span>
                  </div>

                  {result.deduction_summary.deductions.length > 0 && (
                    <div style={styles.deductionList}>
                      {result.deduction_summary.deductions.map((d, idx) => (
                        <div key={idx} style={styles.deductionItem}>
                          <div style={styles.deductionItemHeader}>
                            <span style={styles.deductionItemName}>{d.item_name}</span>
                            {d.has_price && (
                              <span style={styles.deductionItemAmount}>-${d.amount.toFixed(2)}</span>
                            )}
                          </div>
                          <div style={styles.deductionItemReason}>{d.reason}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #f4f6f8 0%, #eef1f5 100%)',
    padding: '32px 24px 60px',
  },
  header: {
    maxWidth: '980px',
    margin: '0 auto 28px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  logoBadge: {
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    background: '#1f3864',
    color: '#fff',
    fontSize: '22px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  headerEyebrow: {
    fontSize: '11.5px',
    fontWeight: 700,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
    marginBottom: '3px',
  },
  headerTitle: {
    fontSize: '21px',
    fontWeight: 700,
    color: '#111827',
    margin: 0,
  },
  logoutButton: {
    padding: '9px 18px',
    fontSize: '13.5px',
    fontWeight: 600,
    background: '#ffffff',
    color: '#374151',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  grid: {
    maxWidth: '980px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
    gap: '24px',
    alignItems: 'start',
  },
  card: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '28px',
    boxShadow: '0 4px 24px rgba(23, 43, 77, 0.07)',
    border: '1px solid #eef0f3',
  },
  cardTitle: {
    fontSize: '17px',
    fontWeight: 700,
    color: '#111827',
    margin: '0 0 6px 0',
  },
  cardSubtitle: {
    fontSize: '13px',
    color: '#6b7280',
    margin: '0 0 22px 0',
    lineHeight: 1.5,
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '7px',
    marginBottom: '16px',
  },
  label: {
    fontSize: '12.5px',
    fontWeight: 600,
    color: '#374151',
  },
  select: {
    padding: '11px 12px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '9px',
    outline: 'none',
    background: '#fff',
  },
  dropZone: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 16px',
    border: '1.5px dashed #cbd5e1',
    borderRadius: '10px',
    background: '#fafbfc',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  dropZoneActive: {
    borderColor: '#1f3864',
    background: '#eef2f8',
  },
  dropZoneFilled: {
    borderStyle: 'solid',
    borderColor: '#93c5fd',
    background: '#f0f7ff',
  },
  dropZoneIcon: {
    fontSize: '22px',
    flexShrink: 0,
  },
  dropZoneText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    minWidth: 0,
  },
  dropZoneFileName: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#1f2937',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  dropZoneHint: {
    fontSize: '11.5px',
    color: '#9ca3af',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  hiddenInput: {
    display: 'none',
  },
  button: {
    width: '100%',
    marginTop: '8px',
    padding: '13px',
    fontSize: '14.5px',
    fontWeight: 600,
    background: '#1f3864',
    color: 'white',
    border: 'none',
    borderRadius: '9px',
    transition: 'background 0.15s, transform 0.1s',
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
  spinnerLarge: {
    width: '32px',
    height: '32px',
    border: '3px solid #e5e7eb',
    borderTopColor: '#1f3864',
  },
  errorBox: {
    background: '#fef2f2',
    color: '#b91c1c',
    fontSize: '13px',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #fecaca',
    marginBottom: '16px',
  },
  resultsPanel: {
    display: 'flex',
    flexDirection: 'column',
  },
  emptyState: {
    background: '#ffffff',
    borderRadius: '16px',
    border: '1px dashed #d1d5db',
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
    opacity: 0.5,
  },
  emptyStateText: {
    fontSize: '13.5px',
    color: '#9ca3af',
  },
  resultHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '12px',
    fontWeight: 700,
    padding: '6px 14px',
    borderRadius: '999px',
  },
  statusOk: {
    background: '#ecfdf5',
    color: '#047857',
    border: '1px solid #a7f3d0',
  },
  statusReview: {
    background: '#fffbeb',
    color: '#b45309',
    border: '1px solid #fde68a',
  },
  resultList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  resultRow: {
    padding: '14px 16px',
    borderRadius: '11px',
    background: '#f9fafb',
    border: '1px solid #eef0f3',
  },
  resultRowHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px',
  },
  resultDocName: {
    fontSize: '13.5px',
    fontWeight: 600,
    color: '#111827',
  },
  reviewTag: {
    fontSize: '10.5px',
    fontWeight: 700,
    color: '#b45309',
    background: '#fffbeb',
    border: '1px solid #fde68a',
    borderRadius: '999px',
    padding: '3px 9px',
  },
  resultDetails: {
    fontSize: '12.5px',
    color: '#6b7280',
  },
  resultError: {
    fontSize: '12.5px',
    color: '#b91c1c',
  },
  warningNote: {
    marginTop: '6px',
    fontSize: '12px',
    color: '#b45309',
    fontWeight: 500,
  },
  deductionSection: {
    marginTop: '24px',
    paddingTop: '20px',
    borderTop: '1px solid #eef0f3',
  },
  deductionTitle: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#111827',
    margin: '0 0 14px 0',
  },
  approvedBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: '#f0f7ff',
    border: '1px solid #bfdbfe',
    borderRadius: '10px',
    padding: '16px',
    marginBottom: '16px',
  },
  approvedLabel: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#1f3864',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
    marginBottom: '4px',
  },
  approvedAmount: {
    fontSize: '26px',
    fontWeight: 700,
    color: '#1f3864',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  summaryLabel: {
    fontSize: '13px',
    color: '#6b7280',
  },
  summaryAmount: {
    fontSize: '15px',
    fontWeight: 700,
    color: '#b91c1c',
  },
  actionTag: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#1f3864',
    background: '#eef2f8',
    padding: '4px 10px',
    borderRadius: '999px',
  },
  deductionList: {
    marginTop: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  deductionItem: {
    padding: '10px 12px',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
  },
  deductionItemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deductionItemName: {
    fontSize: '12.5px',
    fontWeight: 600,
    color: '#111827',
  },
  deductionItemAmount: {
    fontSize: '12.5px',
    fontWeight: 700,
    color: '#b91c1c',
  },
  deductionItemReason: {
    fontSize: '11.5px',
    color: '#9ca3af',
    marginTop: '2px',
  },
};

export default Dashboard;