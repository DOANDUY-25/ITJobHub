import React, { useState, useEffect } from 'react';
import {
  Plus, Briefcase, Edit2, Trash2, CheckCircle, XCircle,
  Clock, Eye, AlertCircle, RefreshCw, Building2, Globe,
  Phone, MapPin, Tag, Users, FileText, Save, X, ChevronDown
} from 'lucide-react';
import { jobService, profileService } from '../services/api';

const JOB_TYPES = ['FULL_TIME', 'PART_TIME', 'REMOTE', 'FREELANCE'];
const JOB_TYPE_LABELS = { FULL_TIME: 'Full-time', PART_TIME: 'Part-time', REMOTE: 'Remote', FREELANCE: 'Freelance' };
const STATUS_COLORS = {
  PUBLISHED: { bg: 'rgba(16,185,129,0.12)', color: '#10b981', label: 'Published' },
  DRAFT:     { bg: 'rgba(139,92,246,0.12)',  color: '#8b5cf6', label: 'Draft' },
  CLOSED:    { bg: 'rgba(107,114,128,0.12)', color: '#6b7280', label: 'Closed' },
};

const emptyJob = {
  title: '', description: '', requirements: '',
  salaryMin: '', salaryMax: '', currency: 'VND',
  salaryNegotiable: false, status: 'DRAFT',
  location: '', jobType: 'FULL_TIME',
  isFeatured: false, isUrgent: false, expiryDate: '',
};

function EmployerDashboard({ user, showToast }) {
  const [activeTab, setActiveTab] = useState('jobs');
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [jobForm, setJobForm] = useState(emptyJob);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Company profile state
  const [companyProfile, setCompanyProfile] = useState(null);
  const [companyForm, setCompanyForm] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    if (activeTab === 'jobs') fetchJobs();
    if (activeTab === 'profile') fetchProfile();
  }, [activeTab]);

  const fetchJobs = async () => {
    try {
      setLoadingJobs(true);
      const data = await jobService.getMyJobs();
      setJobs(data);
    } catch (err) {
      showToast('Không thể tải danh sách tin tuyển dụng.', 'error');
    } finally {
      setLoadingJobs(false);
    }
  };

  const fetchProfile = async () => {
    try {
      setLoadingProfile(true);
      const data = await profileService.getProfile();
      const cp = data.companyProfile || {};
      setCompanyProfile(cp);
      setCompanyForm({
        companyName: cp.companyName || '',
        logoUrl: cp.logoUrl || '',
        bannerUrl: cp.bannerUrl || '',
        location: cp.location || '',
        address: cp.address || '',
        companyPhone: cp.phone || '',
        website: cp.website || '',
        taxCode: cp.taxCode || '',
        industry: cp.industry || '',
        size: cp.size || '',
        description: cp.description || '',
        culture: cp.culture || '',
      });
    } catch (err) {
      showToast('Không thể tải thông tin công ty.', 'error');
    } finally {
      setLoadingProfile(false);
    }
  };

  const openCreate = () => {
    setEditingJob(null);
    setJobForm(emptyJob);
    setShowJobForm(true);
  };

  const openEdit = (job) => {
    setEditingJob(job);
    setJobForm({
      title: job.title || '',
      description: job.description || '',
      requirements: (job.requirements || []).join('\n'),
      salaryMin: '', salaryMax: '',
      currency: 'VND', salaryNegotiable: false,
      status: job.status || 'DRAFT',
      location: job.location || '',
      jobType: (job.type || 'FULL_TIME').toUpperCase().replace('-', '_').replace('TIME', '_TIME').replace('FULL_TIME', 'FULL_TIME').replace('PART_TIME', 'PART_TIME'),
      isFeatured: job.isFeatured || false,
      isUrgent: job.isUrgent || false,
      expiryDate: '',
    });
    setShowJobForm(true);
  };

  const handleJobFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setJobForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleJobSubmit = async (e) => {
    e.preventDefault();
    if (!jobForm.title.trim() || !jobForm.description.trim()) {
      showToast('Vui lòng nhập tiêu đề và mô tả công việc.', 'error');
      return;
    }
    try {
      setSubmitting(true);
      const payload = {
        ...jobForm,
        salaryMin: jobForm.salaryMin ? Number(jobForm.salaryMin) : null,
        salaryMax: jobForm.salaryMax ? Number(jobForm.salaryMax) : null,
      };
      if (editingJob) {
        await jobService.updateJob(editingJob.id, payload);
        showToast('Cập nhật tin tuyển dụng thành công!', 'success');
      } else {
        await jobService.createJob(payload);
        showToast('Đăng tin tuyển dụng thành công!', 'success');
      }
      setShowJobForm(false);
      fetchJobs();
    } catch (err) {
      showToast(err.response?.data?.message || 'Lỗi khi lưu tin tuyển dụng.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm('Bạn có chắc muốn xóa tin tuyển dụng này không?')) return;
    try {
      setDeletingId(jobId);
      await jobService.deleteJob(jobId);
      showToast('Đã xóa tin tuyển dụng.', 'success');
      setJobs(prev => prev.filter(j => j.id !== jobId));
    } catch (err) {
      showToast('Không thể xóa tin tuyển dụng này.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleStatusChange = async (jobId, status) => {
    try {
      const updated = await jobService.changeJobStatus(jobId, status);
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: updated.status } : j));
      showToast(`Đã chuyển trạng thái sang "${STATUS_COLORS[status]?.label || status}".`, 'success');
    } catch (err) {
      showToast('Không thể thay đổi trạng thái.', 'error');
    }
  };

  const handleCompanyFormChange = (e) => {
    const { name, value } = e.target;
    setCompanyForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCompanySave = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      await profileService.updateProfile(companyForm);
      showToast('Cập nhật hồ sơ công ty thành công!', 'success');
      fetchProfile();
    } catch (err) {
      showToast(err.response?.data?.message || 'Lỗi khi cập nhật hồ sơ.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const tabs = [
    { id: 'jobs',    label: `Tin tuyển dụng (${jobs.length})`, icon: Briefcase },
    { id: 'profile', label: 'Hồ sơ công ty',                    icon: Building2 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Tab Nav */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-muted)', paddingBottom: '0' }}>
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)} style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.75rem 1.5rem', border: 'none', cursor: 'pointer',
            fontWeight: 600, fontSize: '0.9rem',
            backgroundColor: 'transparent',
            color: activeTab === id ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: activeTab === id ? '2px solid var(--primary)' : '2px solid transparent',
            transition: 'all 0.2s', outline: 'none', marginBottom: '-1px'
          }}>
            <Icon size={16} />{label}
          </button>
        ))}
      </div>

      {/* ============ JOBS TAB ============ */}
      {activeTab === 'jobs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Header row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Quản lý tin tuyển dụng</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Tạo, chỉnh sửa và quản lý trạng thái tất cả tin tuyển dụng của bạn.
              </p>
            </div>
            <button onClick={openCreate} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={16} /> Đăng tin mới
            </button>
          </div>

          {/* Job list */}
          {loadingJobs ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <RefreshCw size={32} style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
              <p style={{ color: 'var(--text-secondary)' }}>Đang tải danh sách tin...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem', border: '1px dashed var(--border-muted)' }}>
              <Briefcase size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
              <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Chưa có tin tuyển dụng nào</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Bắt đầu đăng tin tuyển dụng để thu hút ứng viên phù hợp.
              </p>
              <button onClick={openCreate} className="btn btn-primary">
                <Plus size={16} /> Đăng tin đầu tiên
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {jobs.map(job => {
                const st = STATUS_COLORS[job.status] || STATUS_COLORS.DRAFT;
                return (
                  <div key={job.id} className="glass-card" style={{
                    padding: '1.25rem 1.5rem', display: 'flex',
                    justifyContent: 'space-between', alignItems: 'flex-start',
                    flexWrap: 'wrap', gap: '1rem', border: '1px solid var(--border-muted)'
                  }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{job.title}</h4>
                        <span style={{ padding: '0.2rem 0.7rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: st.bg, color: st.color }}>
                          {st.label}
                        </span>
                        {job.isUrgent && <span style={{ padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 700, backgroundColor: 'rgba(239,68,68,0.12)', color: '#ef4444' }}>Gấp</span>}
                        {job.isFeatured && <span style={{ padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 700, backgroundColor: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>Nổi bật</span>}
                      </div>
                      <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={12} />{job.location || 'Chưa có'}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Tag size={12} />{job.type}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={12} />Đăng: {job.postedDate || 'Chưa đăng'}</span>
                        {job.expiryDate && <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><AlertCircle size={12} />Hết hạn: {job.expiryDate}</span>}
                      </div>
                      <div style={{ marginTop: '0.5rem', fontSize: '0.82rem', color: '#10b981', fontWeight: 600 }}>{job.salary}</div>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                      {/* Status switcher */}
                      {job.status !== 'PUBLISHED' && (
                        <button onClick={() => handleStatusChange(job.id, 'PUBLISHED')}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.85rem', borderRadius: '8px', border: '1px solid #10b981', background: 'rgba(16,185,129,0.08)', color: '#10b981', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                          <CheckCircle size={13} /> Đăng
                        </button>
                      )}
                      {job.status === 'PUBLISHED' && (
                        <button onClick={() => handleStatusChange(job.id, 'CLOSED')}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.85rem', borderRadius: '8px', border: '1px solid #6b7280', background: 'rgba(107,114,128,0.08)', color: '#6b7280', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                          <XCircle size={13} /> Đóng
                        </button>
                      )}
                      <button onClick={() => openEdit(job)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-muted)', background: 'var(--bg-dark)', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                        <Edit2 size={13} /> Sửa
                      </button>
                      <button onClick={() => handleDelete(job.id)} disabled={deletingId === job.id}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.08)', color: '#ef4444', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                        <Trash2 size={13} /> {deletingId === job.id ? '...' : 'Xóa'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============ PROFILE TAB ============ */}
      {activeTab === 'profile' && (
        <div>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Hồ sơ doanh nghiệp</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Thông tin đầy đủ sẽ giúp ứng viên tin tưởng và ứng tuyển nhiều hơn.
            </p>
          </div>

          {loadingProfile ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <RefreshCw size={32} style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
            </div>
          ) : (
            <form onSubmit={handleCompanySave}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>

                {/* Basic Info */}
                <div className="glass-card" style={{ padding: '1.5rem', gridColumn: '1 / -1' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Building2 size={16} color="var(--primary)" /> Thông tin cơ bản
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Tên công ty *</label>
                      <input className="form-input" name="companyName" value={companyForm.companyName || ''} onChange={handleCompanyFormChange} placeholder="Công ty ABC" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Ngành nghề</label>
                      <input className="form-input" name="industry" value={companyForm.industry || ''} onChange={handleCompanyFormChange} placeholder="Công nghệ thông tin" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Quy mô nhân sự</label>
                      <select className="form-input" name="size" value={companyForm.size || ''} onChange={handleCompanyFormChange}>
                        <option value="">Chọn quy mô</option>
                        {['1-10','11-50','51-200','201-500','500+'].map(s => <option key={s} value={s}>{s} nhân viên</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Mã số thuế</label>
                      <input className="form-input" name="taxCode" value={companyForm.taxCode || ''} onChange={handleCompanyFormChange} placeholder="0123456789" />
                    </div>
                  </div>
                </div>

                {/* Contact & Location */}
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={16} color="var(--primary)" /> Liên hệ & Vị trí
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Thành phố / Tỉnh</label>
                      <input className="form-input" name="location" value={companyForm.location || ''} onChange={handleCompanyFormChange} placeholder="Hà Nội" />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Địa chỉ chi tiết</label>
                      <input className="form-input" name="address" value={companyForm.address || ''} onChange={handleCompanyFormChange} placeholder="123 Nguyễn Trãi, Q.1" />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Số điện thoại</label>
                      <input className="form-input" name="companyPhone" value={companyForm.companyPhone || ''} onChange={handleCompanyFormChange} placeholder="024 xxxx xxxx" />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Globe size={13} /> Website</label>
                      <input className="form-input" name="website" value={companyForm.website || ''} onChange={handleCompanyFormChange} placeholder="https://company.com" />
                    </div>
                  </div>
                </div>

                {/* Media */}
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileText size={16} color="var(--primary)" /> Hình ảnh & Thương hiệu
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">URL Logo công ty</label>
                      <input className="form-input" name="logoUrl" value={companyForm.logoUrl || ''} onChange={handleCompanyFormChange} placeholder="https://cdn.example.com/logo.png" />
                      {companyForm.logoUrl && <img src={companyForm.logoUrl} alt="Logo preview" style={{ width: '64px', height: '64px', objectFit: 'contain', borderRadius: '12px', marginTop: '0.5rem', border: '1px solid var(--border-muted)' }} onError={(e) => e.target.style.display='none'} />}
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">URL Banner công ty</label>
                      <input className="form-input" name="bannerUrl" value={companyForm.bannerUrl || ''} onChange={handleCompanyFormChange} placeholder="https://cdn.example.com/banner.jpg" />
                      {companyForm.bannerUrl && <img src={companyForm.bannerUrl} alt="Banner preview" style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '8px', marginTop: '0.5rem', border: '1px solid var(--border-muted)' }} onError={(e) => e.target.style.display='none'} />}
                    </div>
                  </div>
                </div>

                {/* Description + Culture */}
                <div className="glass-card" style={{ padding: '1.5rem', gridColumn: '1 / -1' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Users size={16} color="var(--primary)" /> Giới thiệu & Văn hóa
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Giới thiệu công ty</label>
                      <textarea className="form-input" name="description" rows={5} value={companyForm.description || ''} onChange={handleCompanyFormChange} placeholder="Mô tả lịch sử, lĩnh vực hoạt động và sứ mệnh của công ty..." style={{ resize: 'vertical' }} />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Văn hóa doanh nghiệp</label>
                      <textarea className="form-input" name="culture" rows={5} value={companyForm.culture || ''} onChange={handleCompanyFormChange} placeholder="Mô tả môi trường làm việc, giá trị cốt lõi, phúc lợi đặc biệt..." style={{ resize: 'vertical' }} />
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary" disabled={savingProfile} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '160px', justifyContent: 'center' }}>
                  {savingProfile ? <><RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} /> Đang lưu...</> : <><Save size={15} /> Lưu hồ sơ</>}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default EmployerDashboard;
