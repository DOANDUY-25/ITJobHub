import React, { useState, useEffect } from 'react';
import {
  CheckCircle, XCircle, EyeOff, Eye, Building2,
  Briefcase, RefreshCw, AlertTriangle, ChevronDown, X
} from 'lucide-react';
import { adminService } from '../../services/api';

const JOB_STATUS_META = {
  PENDING:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  label: 'Chờ duyệt' },
  PUBLISHED: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   label: 'Đã duyệt' },
  REJECTED:  { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   label: 'Từ chối' },
  DRAFT:     { color: '#6b7280', bg: 'rgba(107,114,128,0.1)', label: 'Nháp' },
  HIDDEN:    { color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)',   label: 'Ẩn' },
  CLOSED:    { color: '#475569', bg: 'rgba(71,85,105,0.1)',    label: 'Đóng' },
};

const CO_STATUS_META = {
  PENDING:  { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  label: 'Chờ duyệt' },
  APPROVED: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   label: 'Đã duyệt' },
  REJECTED: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   label: 'Từ chối' },
  HIDDEN:   { color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)',   label: 'Ẩn' },
  DELETED:  { color: '#6b7280', bg: 'rgba(107,114,128,0.1)', label: 'Xóa' },
};

export default function ContentModeration({ showToast }) {
  const [activeTab, setActiveTab] = useState('jobs');
  const [jobs, setJobs]           = useState([]);
  const [companies, setCompanies] = useState([]);
  const [jobFilter, setJobFilter]  = useState('PENDING');
  const [coFilter, setCoFilter]    = useState('PENDING');
  const [loading, setLoading]     = useState(false);
  const [reviewModal, setReviewModal] = useState(null); // { type: 'job'|'company', item, action }
  const [reason, setReason]         = useState('');
  const [submitting, setSubmitting]  = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllJobs(jobFilter || undefined);
      setJobs(data);
    } catch { showToast('Lỗi tải danh sách job.', 'error'); }
    finally { setLoading(false); }
  };

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllCompanies(coFilter || undefined);
      setCompanies(data);
    } catch { showToast('Lỗi tải danh sách công ty.', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (activeTab === 'jobs') fetchJobs(); }, [activeTab, jobFilter]);
  useEffect(() => { if (activeTab === 'companies') fetchCompanies(); }, [activeTab, coFilter]);

  const openReview = (type, item, action) => {
    setReviewModal({ type, item, action });
    setReason('');
  };

  const confirmReview = async () => {
    const { type, item, action } = reviewModal;
    try {
      setSubmitting(true);
      if (type === 'job') {
        await adminService.reviewJob(item.jobId, action, reason);
        showToast(`Job đã được ${action === 'PUBLISHED' ? 'duyệt' : action === 'REJECTED' ? 'từ chối' : 'ẩn'}.`, 'success');
        fetchJobs();
      } else {
        await adminService.reviewCompany(item.companyId, action, reason);
        showToast(`Công ty đã được ${action === 'APPROVED' ? 'duyệt' : action === 'REJECTED' ? 'từ chối' : 'ẩn'}.`, 'success');
        fetchCompanies();
      }
      setReviewModal(null);
    } catch (e) {
      showToast(e?.response?.data?.message || 'Lỗi thực hiện thao tác.', 'error');
    } finally { setSubmitting(false); }
  };

  const ActionButtons = ({ item, type }) => {
    if (type === 'job') {
      return (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {item.status !== 'PUBLISHED' && (
            <ReviewBtn color="#22c55e" onClick={() => openReview('job', item, 'PUBLISHED')}>
              <CheckCircle size={13} /> Duyệt
            </ReviewBtn>
          )}
          {item.status !== 'REJECTED' && (
            <ReviewBtn color="#ef4444" onClick={() => openReview('job', item, 'REJECTED')}>
              <XCircle size={13} /> Từ chối
            </ReviewBtn>
          )}
          {item.status !== 'HIDDEN' && (
            <ReviewBtn color="#8b5cf6" onClick={() => openReview('job', item, 'HIDDEN')}>
              <EyeOff size={13} /> Ẩn
            </ReviewBtn>
          )}
        </div>
      );
    }
    return (
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {item.profileStatus !== 'APPROVED' && (
          <ReviewBtn color="#22c55e" onClick={() => openReview('company', item, 'APPROVED')}>
            <CheckCircle size={13} /> Duyệt
          </ReviewBtn>
        )}
        {item.profileStatus !== 'REJECTED' && (
          <ReviewBtn color="#ef4444" onClick={() => openReview('company', item, 'REJECTED')}>
            <XCircle size={13} /> Từ chối
          </ReviewBtn>
        )}
        {item.profileStatus !== 'HIDDEN' && (
          <ReviewBtn color="#8b5cf6" onClick={() => openReview('company', item, 'HIDDEN')}>
            <EyeOff size={13} /> Ẩn
          </ReviewBtn>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'rgba(99,102,241,0.06)', padding: 4, borderRadius: 12, width: 'fit-content' }}>
        {[
          { id: 'jobs',      icon: Briefcase, label: `Tin tuyển dụng${jobs.length ? ` (${jobs.length})` : ''}` },
          { id: 'companies', icon: Building2, label: `Công ty${companies.length ? ` (${companies.length})` : ''}` },
        ].map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => setActiveTab(id)} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '9px 18px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
            background: activeTab === id ? 'linear-gradient(135deg,rgba(99,102,241,0.3),rgba(139,92,246,0.25))' : 'transparent',
            color: activeTab === id ? '#a5b4fc' : '#64748b',
            border: activeTab === id ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
          }}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* Filter row */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        {activeTab === 'jobs' ? (
          <select value={jobFilter} onChange={e => setJobFilter(e.target.value)} style={selectStyle}>
            <option value="">Tất cả trạng thái</option>
            {Object.entries(JOB_STATUS_META).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        ) : (
          <select value={coFilter} onChange={e => setCoFilter(e.target.value)} style={selectStyle}>
            <option value="">Tất cả trạng thái</option>
            {Object.entries(CO_STATUS_META).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        )}
        <button onClick={() => activeTab === 'jobs' ? fetchJobs() : fetchCompanies()} style={btnRefresh}>
          <RefreshCw size={14} /> Làm mới
        </button>
      </div>

      {/* Content */}
      <div style={{
        background: 'linear-gradient(135deg,#0d1530,#0f1b38)',
        border: '1px solid rgba(99,102,241,0.15)', borderRadius: 14, overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#6366f1' }}>
            <RefreshCw size={28} style={{ animation: 'spin 1s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : activeTab === 'jobs' ? (
          /* ── Job list ── */
          jobs.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#475569' }}>Không có tin tuyển dụng</div>
          ) : jobs.map(job => {
            const sm = JOB_STATUS_META[job.status] || { color: '#fff', bg: 'rgba(255,255,255,0.1)', label: job.status };
            const expanded = expandedId === `job-${job.jobId}`;
            return (
              <div key={job.jobId} style={{ borderBottom: '1px solid rgba(99,102,241,0.07)', padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                      <span style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 14 }}>{job.title}</span>
                      <span style={{ background: sm.bg, color: sm.color, padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                        {sm.label}
                      </span>
                      {job.isFeatured && <span style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', padding: '2px 8px', borderRadius: 20, fontSize: 11 }}>⭐ Nổi bật</span>}
                      {job.isUrgent  && <span style={{ background: 'rgba(239,68,68,0.1)',  color: '#ef4444', padding: '2px 8px', borderRadius: 20, fontSize: 11 }}>🔥 Gấp</span>}
                    </div>
                    <div style={{ color: '#64748b', fontSize: 12, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                      <span>🏢 {job.companyName}</span>
                      <span>📍 {job.location || '–'}</span>
                      <span>💼 {job.jobType || '–'}</span>
                      <span>🗓️ {job.createdAt ? new Date(job.createdAt).toLocaleDateString('vi-VN') : '–'}</span>
                    </div>
                    {expanded && (
                      <div style={{
                        marginTop: 12, padding: '12px', background: 'rgba(99,102,241,0.04)',
                        borderRadius: 8, color: '#94a3b8', fontSize: 13, lineHeight: 1.7,
                        maxHeight: 150, overflowY: 'auto',
                      }}>
                        {job.description}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end', flexShrink: 0 }}>
                    <ActionButtons item={job} type="job" />
                    <button
                      onClick={() => setExpandedId(expanded ? null : `job-${job.jobId}`)}
                      style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      <Eye size={13} /> {expanded ? 'Thu gọn' : 'Xem mô tả'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          /* ── Company list ── */
          companies.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#475569' }}>Không có công ty</div>
          ) : companies.map(co => {
            const sm = CO_STATUS_META[co.profileStatus] || { color: '#fff', bg: 'rgba(255,255,255,0.1)', label: co.profileStatus };
            return (
              <div key={co.companyId} style={{ borderBottom: '1px solid rgba(99,102,241,0.07)', padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                  {/* Logo */}
                  <div style={{
                    width: 44, height: 44, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden',
                  }}>
                    {co.logoUrl
                      ? <img src={co.logoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <Building2 size={20} color="#fff" />}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                      <span style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 14 }}>{co.companyName}</span>
                      <span style={{ background: sm.bg, color: sm.color, padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                        {sm.label}
                      </span>
                    </div>
                    <div style={{ color: '#64748b', fontSize: 12, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                      <span>📧 {co.ownerEmail}</span>
                      <span>🏭 {co.industry || '–'}</span>
                      <span>👥 {co.size || '–'}</span>
                      {co.taxCode && <span>🧾 MST: {co.taxCode}</span>}
                      {co.website && <span>🌐 {co.website}</span>}
                    </div>
                  </div>

                  <div style={{ flexShrink: 0 }}>
                    <ActionButtons item={co} type="company" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Review Modal ── */}
      {reviewModal && (
        <div style={modalOverlay} onClick={() => setReviewModal(null)}>
          <div style={modalBox} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ color: '#e2e8f0', margin: 0, fontSize: 17 }}>
                {reviewModal.action === 'PUBLISHED' || reviewModal.action === 'APPROVED' ? '✅ Xác nhận duyệt' :
                 reviewModal.action === 'REJECTED' ? '❌ Xác nhận từ chối' : '🔒 Xác nhận ẩn'}
              </h3>
              <button onClick={() => setReviewModal(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 16 }}>
              {reviewModal.type === 'job'
                ? <>Job: <strong style={{ color: '#e2e8f0' }}>{reviewModal.item.title}</strong> — {reviewModal.item.companyName}</>
                : <>Công ty: <strong style={{ color: '#e2e8f0' }}>{reviewModal.item.companyName}</strong></>
              }
            </div>

            {(reviewModal.action === 'REJECTED' || reviewModal.action === 'HIDDEN') && (
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Lý do (tuỳ chọn)</label>
                <textarea
                  value={reason} onChange={e => setReason(e.target.value)}
                  placeholder="Nhập lý do từ chối hoặc ẩn..."
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setReviewModal(null)} style={btnSecondary}>Hủy</button>
              <button onClick={confirmReview} disabled={submitting} style={btnPrimary(
                reviewModal.action === 'PUBLISHED' || reviewModal.action === 'APPROVED' ? '#22c55e' :
                reviewModal.action === 'REJECTED' ? '#ef4444' : '#8b5cf6'
              )}>
                {submitting ? 'Đang xử lý...' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Shared styles ──
const ReviewBtn = ({ children, onClick, color }) => (
  <button onClick={onClick} style={{
    display: 'inline-flex', alignItems: 'center', gap: 5,
    background: `${color}12`, border: `1px solid ${color}30`,
    color: color, padding: '5px 10px', borderRadius: 7,
    cursor: 'pointer', fontSize: 12, fontWeight: 600, transition: 'all 0.15s',
  }}
    onMouseEnter={e => e.currentTarget.style.background = `${color}22`}
    onMouseLeave={e => e.currentTarget.style.background = `${color}12`}
  >{children}</button>
);

const selectStyle = {
  background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.2)',
  color: '#94a3b8', padding: '9px 14px', borderRadius: 9, fontSize: 13, outline: 'none', cursor: 'pointer',
};

const btnRefresh = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
  color: '#a5b4fc', padding: '9px 16px', borderRadius: 9, cursor: 'pointer', fontSize: 13,
};

const inputStyle = {
  width: '100%', padding: '10px 14px', background: 'rgba(99,102,241,0.07)',
  border: '1px solid rgba(99,102,241,0.2)', borderRadius: 9,
  color: '#e2e8f0', fontSize: 13, outline: 'none', boxSizing: 'border-box',
};

const labelStyle = { display: 'block', color: '#94a3b8', fontSize: 12, marginBottom: 8, fontWeight: 500 };

const btnSecondary = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
  color: '#a5b4fc', padding: '8px 16px', borderRadius: 9, cursor: 'pointer', fontSize: 13,
};

const btnPrimary = (color) => ({
  background: `linear-gradient(135deg, ${color}, ${color}cc)`,
  border: 'none', color: '#fff', padding: '8px 18px',
  borderRadius: 9, cursor: 'pointer', fontSize: 13, fontWeight: 600,
});

const modalOverlay = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 9999, backdropFilter: 'blur(4px)',
};

const modalBox = {
  background: 'linear-gradient(135deg,#0d1530,#111827)', width: '90%', maxWidth: 480,
  borderRadius: 16, padding: '28px', border: '1px solid rgba(99,102,241,0.2)',
  boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
};
