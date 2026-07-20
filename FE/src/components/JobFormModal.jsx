import React from 'react';
import { X, Loader2, Briefcase } from 'lucide-react';

const JOB_TYPES = [
  { value: 'FULL_TIME', label: 'Full-time' },
  { value: 'PART_TIME', label: 'Part-time' },
  { value: 'REMOTE',    label: 'Remote' },
  { value: 'FREELANCE', label: 'Freelance' },
];

const STATUS_OPTIONS = [
  { value: 'DRAFT',     label: 'Lưu nháp' },
  { value: 'PUBLISHED', label: 'Đăng ngay' },
];

function JobFormModal({ editingJob, jobForm, onChange, onSubmit, onClose, submitting }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '760px', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Close */}
        <button onClick={onClose} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', outline: 'none' }}
          onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}>
          <X size={20} />
        </button>

        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.4rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Briefcase size={22} color="var(--primary)" />
          {editingJob ? 'Chỉnh sửa tin tuyển dụng' : 'Đăng tin tuyển dụng mới'}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.75rem' }}>
          {editingJob ? `Đang chỉnh sửa: ${editingJob.title}` : 'Điền đầy đủ thông tin để thu hút ứng viên tốt nhất.'}
        </p>

        <form onSubmit={onSubmit}>
          {/* Title */}
          <div className="form-group">
            <label className="form-label">Tiêu đề công việc *</label>
            <input className="form-input" name="title" value={jobForm.title} onChange={onChange} placeholder="VD: Senior Backend Engineer (Java/Spring Boot)" required />
          </div>

          {/* Row: type + location */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Hình thức làm việc *</label>
              <select className="form-input" name="jobType" value={jobForm.jobType} onChange={onChange}>
                {JOB_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Địa điểm *</label>
              <input className="form-input" name="location" value={jobForm.location} onChange={onChange} placeholder="Hà Nội, Hồ Chí Minh, Remote..." required />
            </div>
          </div>

          {/* Row: salary */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Lương tối thiểu</label>
              <input className="form-input" type="number" name="salaryMin" value={jobForm.salaryMin} onChange={onChange} placeholder="VD: 20000000" min="0" />
            </div>
            <div className="form-group">
              <label className="form-label">Lương tối đa</label>
              <input className="form-input" type="number" name="salaryMax" value={jobForm.salaryMax} onChange={onChange} placeholder="VD: 35000000" min="0" />
            </div>
            <div className="form-group">
              <label className="form-label">Đơn vị tiền tệ</label>
              <select className="form-input" name="currency" value={jobForm.currency} onChange={onChange}>
                <option value="VND">VND</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>

          {/* Checkboxes */}
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <input type="checkbox" name="salaryNegotiable" checked={jobForm.salaryNegotiable} onChange={onChange} />
              Thỏa thuận lương
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <input type="checkbox" name="isFeatured" checked={jobForm.isFeatured} onChange={onChange} />
              ⭐ Tin nổi bật
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <input type="checkbox" name="isUrgent" checked={jobForm.isUrgent} onChange={onChange} />
              🔴 Tuyển gấp
            </label>
          </div>

          {/* Expiry date */}
          <div className="form-group">
            <label className="form-label">Hạn nộp hồ sơ</label>
            <input className="form-input" type="date" name="expiryDate" value={jobForm.expiryDate} onChange={onChange} min={new Date().toISOString().split('T')[0]} />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Mô tả công việc (Job Description) *</label>
            <textarea className="form-input" name="description" rows={5} value={jobForm.description} onChange={onChange}
              placeholder="Mô tả chi tiết về công việc, trách nhiệm chính và môi trường làm việc..."
              required style={{ resize: 'vertical' }} />
          </div>

          {/* Requirements */}
          <div className="form-group">
            <label className="form-label">Yêu cầu ứng viên</label>
            <textarea className="form-input" name="requirements" rows={4} value={jobForm.requirements} onChange={onChange}
              placeholder="- 3+ năm kinh nghiệm với Java / Spring Boot&#10;- Hiểu biết sâu về RESTful API&#10;- Có kinh nghiệm với Docker / Kubernetes là lợi thế"
              style={{ resize: 'vertical' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mỗi yêu cầu trên 1 dòng.</span>
          </div>

          {/* Status */}
          <div className="form-group">
            <label className="form-label">Trạng thái đăng tin</label>
            <select className="form-input" name="status" value={jobForm.status} onChange={onChange}>
              {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }} disabled={submitting}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2, display: 'flex', gap: '0.5rem', justifyContent: 'center' }} disabled={submitting}>
              {submitting
                ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Đang lưu...</>
                : editingJob ? 'Cập nhật tin' : 'Đăng tin tuyển dụng'
              }
            </button>
          </div>
        </form>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default JobFormModal;
