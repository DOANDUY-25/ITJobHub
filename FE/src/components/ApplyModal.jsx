import React, { useState, useEffect } from 'react';
import { X, Upload, CheckCircle2, FileText, Loader2 } from 'lucide-react';
import { applicationService } from '../services/api';

function ApplyModal({ user, job, onClose, onSubmitSuccess, showToast }) {
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    coverLetter: '',
  });
  const [cvFile, setCvFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, submitting, success
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.fullName || prev.fullName,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCvFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setCvFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast('Please log in as a candidate to apply.', 'error');
      return;
    }
    if (!cvFile) {
      showToast('Please upload your CV/Resume.', 'error');
      return;
    }

    setStatus('submitting');

    try {
      const data = new FormData();
      data.append('jobId', job.id);
      data.append('cvFile', cvFile);
      if (formData.coverLetter) data.append('coverLetter', formData.coverLetter);
      if (formData.fullName) data.append('fullName', formData.fullName);
      if (formData.phone) data.append('phone', formData.phone);

      const response = await applicationService.applyJob(data);

      setStatus('success');
      setTimeout(() => {
        onSubmitSuccess({
          jobTitle: job.title,
          company: job.company,
          appliedDate: response.appliedDate,
          status: response.status || 'PENDING',
        });
      }, 1500);
    } catch (err) {
      setStatus('idle');
      const errorMsg = err.response?.data?.message || 'Failed to submit application. Please try again.';
      showToast(errorMsg, 'error');
      console.error(err);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '600px' }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '0.25rem',
            outline: 'none'
          }}
          onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <X size={20} />
        </button>

        {!user ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Sign In Required</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              You must be logged in as a candidate to apply for this job.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>
                Cancel
              </button>
              <a href="/auth" className="btn btn-primary" style={{ flex: 1.5, display: 'inline-flex', textDecoration: 'none' }}>
                Go to Sign In
              </a>
            </div>
          </div>
        ) : user.role !== 'CANDIDATE' ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Action Not Allowed</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              Only candidates can apply to jobs. You are logged in with an <strong>{user.role}</strong> account.
            </p>
            <button onClick={onClose} className="btn btn-secondary" style={{ width: '100%' }}>
              Close
            </button>
          </div>
        ) : status === 'success' ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ display: 'inline-flex', color: 'var(--success)', marginBottom: '1.5rem' }}>
              <CheckCircle2 size={64} />
            </div>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Application Submitted!</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Your application for <strong>{job.title}</strong> at <strong>{job.company}</strong> has been received. 
              The employer has been notified.
            </p>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              Apply for {job.title}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.75rem' }}>
              at <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{job.company}</span> • {job.location}
            </p>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  required
                  className="form-input"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  disabled={status === 'submitting'}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="form-input"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    className="form-input"
                    placeholder="+84 987 654 321"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={status === 'submitting'}
                  />
                </div>
              </div>

              {/* Drag and Drop File Upload */}
              <div className="form-group">
                <label className="form-label">Upload CV / Resume (PDF, DOCX)</label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  style={{
                    border: dragOver ? '2px dashed var(--primary)' : '2px dashed var(--border-muted)',
                    borderRadius: '8px',
                    padding: '2rem 1.5rem',
                    textAlign: 'center',
                    backgroundColor: dragOver ? 'rgba(139, 92, 246, 0.05)' : 'var(--bg-dark)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                >
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc"
                    onChange={handleFileChange}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      opacity: 0,
                      cursor: 'pointer'
                    }}
                    disabled={status === 'submitting'}
                  />

                  {cvFile ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <FileText size={36} color="var(--primary)" />
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                        {cvFile.name}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {(cvFile.size / 1024 / 1024).toFixed(2)} MB • Click or drag to replace
                      </span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <Upload size={36} color="var(--text-muted)" />
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                        Drag & drop your resume here, or <span style={{ color: 'var(--primary)', fontWeight: 600 }}>browse</span>
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Supports PDF, DOC, DOCX up to 10MB
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Cover Letter */}
              <div className="form-group">
                <label className="form-label">Cover Letter (Optional)</label>
                <textarea
                  name="coverLetter"
                  className="form-input"
                  rows="4"
                  placeholder="Introduce yourself to the hiring team..."
                  value={formData.coverLetter}
                  onChange={handleInputChange}
                  style={{ resize: 'vertical' }}
                  disabled={status === 'submitting'}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  disabled={status === 'submitting'}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1.5, display: 'flex', gap: '0.5rem', justifyContent: 'center' }}
                  disabled={status === 'submitting'}
                >
                  {status === 'submitting' ? (
                    <>
                      <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                      Submitting...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default ApplyModal;
