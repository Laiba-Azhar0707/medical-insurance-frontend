import { useState } from 'react';

const DOC_CONFIG = {
  prescription: { label: "Doctor's Prescription", icon: '📋', required: false },
  medicine_bill: { label: 'Medicine Bill', icon: '💊', required: false },
  lab_bill: { label: 'Lab Bill', icon: '🧪', required: false },
  consultation_receipt: { label: 'Consultation Receipt', icon: '🩺', required: false },
};

const BILL_TYPES = ['medicine_bill', 'lab_bill', 'consultation_receipt'];

function getFriendlyErrorMessage(status, backendDetail) {
  if (status === 400 && backendDetail) {
    return backendDetail;
  }
  if (status === 401) {
    return 'Your session has expired. Please log out and log back in.';
  }
  if (status === 413) {
    return 'One or more files are too large. Please use smaller images or fewer pages.';
  }
  if (status >= 500) {
    return "Something went wrong while processing your claim. This isn't something you did — please try again in a moment.";
  }
  return 'We couldn\'t submit your claim. Please check your documents and try again.';
}

function Dashboard({ token, user }) {
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
  // Bumped whenever the form resets — used as part of each file input's
  // `key` so React fully remounts them. Clearing filesByType state alone
  // doesn't clear the browser's native <input type="file"> value, so
  // without this a re-selected file with the same name wouldn't fire
  // onChange and the drop zone would look stale.
  const [formKey, setFormKey] = useState(0);
  const [newClaimHover, setNewClaimHover] = useState(false);

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

  const submitClaimRequest = async (formData) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/claims`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!response.ok) {
      let backendDetail = null;
      try {
        const errorBody = await response.json();
        backendDetail = errorBody?.detail;
      } catch {
        // not JSON, friendly fallback handles it
      }
      throw new Error(getFriendlyErrorMessage(response.status, backendDetail));
    }

    return response.json();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    // Matches the backend rule exactly: prescription is optional, but at
    // least one bill type (medicine, lab, or consultation) is required —
    // a claim with nothing billed has nothing for the system to process.
    const hasAnyBill = BILL_TYPES.some((docType) => filesByType[docType].length > 0);
    if (!hasAnyBill) {
      setError('Please upload at least one bill: a medicine bill, lab bill, or consultation receipt.');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('claim_type', claimType);
    Object.entries(filesByType).forEach(([docType, files]) => {
      files.forEach((file) => formData.append(docType, file));
    });

    try {
      const data = await submitClaimRequest(formData);
      setResult(data);
    } catch (err) {
      const isNetworkError = err instanceof TypeError && err.message.includes('fetch');

      if (isNetworkError) {
        try {
          const retryData = await submitClaimRequest(formData);
          setResult(retryData);
        } catch (retryErr) {
          setError(
            retryErr.message.includes('fetch')
              ? 'We couldn\'t reach the server after retrying. Please check your connection and try again.'
              : retryErr.message
          );
        }
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNewClaim = () => {
    setResult(null);
    setError('');
    setClaimType('reimbursement');
    setFilesByType({
      prescription: [],
      medicine_bill: [],
      lab_bill: [],
      consultation_receipt: [],
    });
    setFormKey((prev) => prev + 1);
  };

  return (
    <div style={styles.grid}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h3 style={styles.cardTitle}>Submit a New Claim</h3>
        <p style={styles.cardSubtitle}>Upload the documents you have. A prescription is optional, but at least one bill (medicine, lab, or consultation) is required.</p>

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
              <label style={styles.label}>
                {config.label}
                <span style={styles.optionalTag}>optional</span>
              </label>
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
                      <span style={styles.dropZoneHint}>JPG, PNG, PDF — multiple pages supported</span>
                    </>
                  )}
                </div>
                <input
                  key={`${docType}-${formKey}`}
                  id={`file-${docType}`}
                  type="file"
                  multiple
                  accept="image/*,application/pdf"
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
            <div style={{ ...styles.emptyStateText, fontSize: '0.85em', opacity: 0.7, marginTop: '4px' }}>
              This usually takes 20–45 seconds — please don't close this tab
            </div>
          </div>
        )}

        {result && (
          <div style={styles.card}>
            <div style={styles.resultHeader}>
              <h3 style={styles.cardTitle}>Claim #{result.claim_id}</h3>
              <div style={styles.resultHeaderRight}>
                <div style={{
                  ...styles.stamp,
                  ...(result.status === 'Needs Manual Review' ? styles.stampReview : styles.stampOk),
                }}>
                  {result.status === 'Needs Manual Review' ? 'Review' : 'Processed'}
                </div>
                <button
                  type="button"
                  onClick={handleNewClaim}
                  style={{
                    ...styles.newClaimButton,
                    ...(newClaimHover ? styles.newClaimButtonHover : {}),
                  }}
                  onMouseEnter={() => setNewClaimHover(true)}
                  onMouseLeave={() => setNewClaimHover(false)}
                >
                  + New Claim
                </button>
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
                    <div style={styles.resultError}>
                      {item.error.includes('rate_limit_exceeded') || item.error.includes('429')
                        ? 'This document could not be processed right now due to high demand. Please try again shortly.'
                        : 'This document could not be read clearly. Please try uploading a clearer photo.'}
                    </div>
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
  );
}

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
    gap: '24px',
    alignItems: 'start',
  },
  card: {
    background: '#ffffff',
    borderRadius: '10px',
    padding: '28px',
    boxShadow: '0 1px 3px rgba(22, 50, 61, 0.06), 0 8px 24px rgba(22, 50, 61, 0.06)',
    border: '1px solid #E7EBEE',
  },
  cardTitle: {
    fontFamily: "'Fraunces', serif",
    fontSize: '19px',
    fontWeight: 600,
    color: '#16232E',
    margin: '0 0 6px 0',
  },
  cardSubtitle: {
    fontSize: '13px',
    color: '#667380',
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
    fontSize: '11.5px',
    fontWeight: 600,
    color: '#48545F',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  optionalTag: {
    fontSize: '9.5px',
    fontWeight: 600,
    color: '#9AA5AD',
    background: '#F1F4F5',
    padding: '2px 8px',
    borderRadius: '999px',
    textTransform: 'none',
    letterSpacing: '0.2px',
  },
  select: {
    padding: '11px 12px',
    fontSize: '14px',
    fontFamily: "'IBM Plex Sans', sans-serif",
    border: '1.5px solid #D5DCE1',
    borderRadius: '6px',
    outline: 'none',
    background: '#fff',
  },
  dropZone: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 16px',
    border: '1.5px dashed #C7D0D6',
    borderRadius: '8px',
    background: '#FAFBFC',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  dropZoneActive: {
    borderColor: '#16323D',
    background: '#EEF3F4',
  },
  dropZoneFilled: {
    borderStyle: 'solid',
    borderColor: '#7FA8B0',
    background: '#F0F6F7',
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
    color: '#16232E',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  dropZoneHint: {
    fontSize: '11.5px',
    color: '#9AA5AD',
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
    fontSize: '14px',
    fontWeight: 600,
    letterSpacing: '0.3px',
    background: '#16323D',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    transition: 'background 0.15s, transform 0.1s',
  },
  buttonHover: {
    background: '#0E252E',
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
    border: '3px solid #E7EBEE',
    borderTopColor: '#16323D',
  },
  errorBox: {
    background: '#FDF1EC',
    color: '#9A3F12',
    fontSize: '13px',
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #F3CFB8',
    marginBottom: '16px',
  },
  resultsPanel: {
    display: 'flex',
    flexDirection: 'column',
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
  resultHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '22px',
  },
  resultHeaderRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  newClaimButton: {
    fontSize: '12.5px',
    fontWeight: 600,
    color: '#16323D',
    background: '#fff',
    border: '1.5px solid #C7D0D6',
    borderRadius: '6px',
    padding: '8px 14px',
    cursor: 'pointer',
    transition: 'all 0.15s',
    whiteSpace: 'nowrap',
  },
  newClaimButtonHover: {
    background: '#EEF3F4',
    borderColor: '#16323D',
  },
  stamp: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    padding: '7px 16px',
    borderRadius: '3px',
    border: '2px double currentColor',
    transform: 'rotate(-3deg)',
    display: 'inline-block',
  },
  stampOk: {
    color: '#2F8F6E',
    background: 'rgba(47, 143, 110, 0.07)',
  },
  stampReview: {
    color: '#B45309',
    background: 'rgba(180, 83, 9, 0.07)',
  },
  resultList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  resultRow: {
    padding: '14px 16px',
    borderRadius: '8px',
    background: '#FAFBFC',
    border: '1px solid #EEF1F3',
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
    color: '#16232E',
  },
  reviewTag: {
    fontSize: '10.5px',
    fontWeight: 700,
    color: '#B45309',
    background: '#FEF6EC',
    border: '1px solid #F3D9AE',
    borderRadius: '999px',
    padding: '3px 9px',
  },
  resultDetails: {
    fontSize: '12.5px',
    color: '#667380',
    fontFamily: "'IBM Plex Mono', monospace",
  },
  resultError: {
    fontSize: '12.5px',
    color: '#9A3F12',
  },
  warningNote: {
    marginTop: '6px',
    fontSize: '12px',
    color: '#B45309',
    fontWeight: 500,
    fontFamily: "'IBM Plex Sans', sans-serif",
  },
  deductionSection: {
    marginTop: '24px',
    paddingTop: '20px',
    borderTop: '1px solid #EEF1F3',
  },
  deductionTitle: {
    fontFamily: "'Fraunces', serif",
    fontSize: '15px',
    fontWeight: 600,
    color: '#16232E',
    margin: '0 0 14px 0',
  },
  approvedBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: '#EEF6F4',
    border: '1px solid #C3E0D8',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '16px',
  },
  approvedLabel: {
    fontSize: '11.5px',
    fontWeight: 600,
    color: '#16323D',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '6px',
  },
  approvedAmount: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: '27px',
    fontWeight: 600,
    color: '#16323D',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  summaryLabel: {
    fontSize: '13px',
    color: '#667380',
  },
  summaryAmount: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: '14px',
    fontWeight: 600,
    color: '#9A3F12',
  },
  actionTag: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#16323D',
    background: '#EEF3F4',
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
    background: '#FDF1EC',
    border: '1px solid #F3CFB8',
    borderRadius: '7px',
  },
  deductionItemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deductionItemName: {
    fontSize: '12.5px',
    fontWeight: 600,
    color: '#16232E',
  },
  deductionItemAmount: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: '12.5px',
    fontWeight: 600,
    color: '#9A3F12',
  },
  deductionItemReason: {
    fontSize: '11.5px',
    color: '#9AA5AD',
    marginTop: '2px',
  },
};

export default Dashboard;