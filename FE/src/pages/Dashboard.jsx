import React, { useState, useEffect } from 'react';
import { User, Briefcase, Lock, Calendar, FileText, RefreshCw, ExternalLink, Mail, Phone, FileDown } from 'lucide-react';
import ProfileSection from '../components/ProfileSection';
import SecuritySection from '../components/SecuritySection';
import EmployerDashboard from '../components/EmployerDashboard';
import JobFormModal from '../components/JobFormModal';
import { applicationService, jobService } from '../services/api';

const emptyJobForm = {
  title: '', description: '', requirements: '',
  salaryMin: '', salaryMax: '', currency: 'VND',
  salaryNegotiable: false, status: 'DRAFT',
  location: '', jobType: 'FULL_TIME',
  isFeatured: false, isUrgent: false, expiryDate: '',
};

function Dashboard({ user, showToast }) {
  const isEmployer = user?.role === 'EMPLOYER';
  const [activeTab, setActiveTab] = useState('profile');
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);

  // Job form modal state (lifted here for JobFormModal)
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [jobForm, setJobForm] = useState(emptyJobForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (activeTab === 'applications' && user) {
      fetchApps();
    }
  }, [activeTab, user]);

  const fetchApps = async () => {
    try {
      setLoadingApps(true);
      let data = [];
      if (user.role === 'CANDIDATE') {
        data = await applicationService.getMyApplications();
      } else if (user.role === 'EMPLOYER') {
        data = await applicationService.getEmployerApplications();
      }
      setAppliedJobs(data);
    } catch (err) {
      showToast('Không thể tải danh sách ứng tuyển từ server.', 'error');
      console.error(err);
    } finally {
      setLoadingApps(false);
    }
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
      setEditingJob(null);
      setJobForm(emptyJobForm);
    } catch (err) {
      showToast(err.response?.data?.message || 'Lỗi khi lưu tin tuyển dụng.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Build tab list based on role
  const tabs = isEmployer
    ? [
        { id: 'profile',      label: 'Hồ sơ & Doanh nghiệp',    icon: User },
        { id: 'applications', label: 'Hồ sơ ứng viên',           icon: Briefcase },
        { id: 'security',     label: 'Bảo mật tài khoản',         icon: Lock },
      ]
    : [
        { id: 'profile',      label: 'Profile & Digital Resume',  icon: User },
        { id: 'applications', label: `Việc làm đã ứng tuyển`,     icon: Briefcase },
        { id: 'security',     label: 'Account Security & Password', icon: Lock },
      ];

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem 5rem 1.5rem', textAlign: 'left' }}>
      {/* Welcome Banner */}
      <div className="glass-card" style={{
        padding: '2rem 2.5rem', marginBottom: '2rem',
        background: 'linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(6,182,212,0.05) 100%)',
        border: '1px solid var(--border-glow)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <span className="badge badge-primary" style={{ textTransform: 'uppercase', marginBottom: '0.5rem', display: 'inline-block' }}>
              {user?.role || 'Dashboard'}
            </span>
            <h1 style={{ fontSize: '2.25rem', marginBottom: '0.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {isEmployer ? `Xin chào, ${user?.fullName || user?.email?.split('@')[0]}!` : `Welcome, ${user?.fullName || user?.email?.split('@')[0]}!`}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              {isEmployer
                ? 'Quản lý hồ sơ công ty, tin tuyển dụng và hồ sơ ứng viên của bạn.'
                : 'Manage your technical portfolio, track career opportunities, and secure your credentials.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: 'var(--bg-dark)', padding: '6px', borderRadius: '14px', border: '1px solid var(--border-muted)', flexWrap: 'wrap' }}>
            {tabs.map(({ id, label, icon: Icon }) => {
              const isActive = activeTab === id;
              return (
                <button key={id} onClick={() => setActiveTab(id)} style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.65rem 1.25rem', borderRadius: '10px',
                  fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
                  transition: 'all var(--transition-fast)', border: 'none', outline: 'none',
                  backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                  boxShadow: isActive ? '0 4px 15px var(--primary-glow)' : 'none'
                }}>
                  <Icon size={16} />{label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="tab-content-area">
        {activeTab === 'profile' && (
          <div className="animate-fade-in">
            {isEmployer
              ? <EmployerDashboard user={user} showToast={showToast} />
              : <ProfileSection user={user} showToast={showToast} />
            }
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="glass-card animate-fade-in" style={{ padding: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
              <Briefcase size={22} color="var(--primary)" />
              {isEmployer ? 'Hồ sơ ứng viên nhận được' : 'Lịch sử ứng tuyển'} ({appliedJobs.length})
            </h2>

            {loadingApps ? (
              <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <RefreshCw size={36} style={{ color: 'var(--primary)', margin: '0 auto 1rem auto', animation: 'spin 1s linear infinite' }} />
                <p style={{ color: 'var(--text-secondary)' }}>Đang tải dữ liệu ứng tuyển...</p>
              </div>
            ) : appliedJobs.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {appliedJobs.map((app, index) => (
                  <div key={index} style={{
                    padding: '1.5rem', borderRadius: '12px',
                    backgroundColor: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-muted)',
                    display: 'flex', flexDirection: 'column', gap: '1rem'
                  }} className="glass-card-hover">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                      <div>
                        <h4 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: 600, margin: 0 }}>{app.jobTitle}</h4>
                        <p style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 550, marginTop: '0.2rem', marginBottom: 0 }}>
                          {isEmployer ? `Ứng viên: ${app.candidateName}` : app.companyName}
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          <Calendar size={14} />{app.appliedDate}
                        </div>
                        <span className="badge badge-primary" style={{ textTransform: 'uppercase', padding: '0.35rem 0.9rem' }}>
                          {app.status}
                        </span>
                      </div>
                    </div>

                    {isEmployer && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', backgroundColor: 'var(--bg-dark)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-muted)', fontSize: '0.875rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}><Mail size={13} color="var(--primary)" />{app.candidateEmail}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}><Phone size={13} color="var(--primary)" />{app.candidatePhone || 'Chưa cung cấp'}</div>
                      </div>
                    )}

                    {app.coverLetter && (
                      <div style={{ backgroundColor: 'var(--bg-dark)', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid var(--primary)', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        <strong style={{ color: 'var(--text-primary)' }}>Thư xin việc:</strong>
                        <p style={{ marginTop: '0.5rem', whiteSpace: 'pre-line', marginBottom: 0 }}>{app.coverLetter}</p>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid var(--border-muted)', paddingTop: '1rem' }}>
                      <a href={`http://localhost:9999/api${app.cvUrl}`} target="_blank" rel="noopener noreferrer"
                        className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.825rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                        <FileDown size={13} /> Xem / Tải CV <ExternalLink size={11} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', border: '1px dashed var(--border-muted)', borderRadius: '16px' }}>
                <FileText size={48} color="var(--text-muted)" style={{ marginBottom: '1.25rem' }} />
                <h4 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Chưa có dữ liệu ứng tuyển</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '400px', margin: '0 auto' }}>
                  {isEmployer ? 'Chưa có ứng viên nào nộp hồ sơ vào tin tuyển dụng của bạn.' : "Bạn chưa nộp hồ sơ ứng tuyển nào. Hãy khám phá các tin tuyển dụng phù hợp!"}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'security' && (
          <div className="animate-fade-in">
            <SecuritySection user={user} showToast={showToast} />
          </div>
        )}
      </div>

      {/* Job Form Modal */}
      {showJobForm && (
        <JobFormModal
          editingJob={editingJob}
          jobForm={jobForm}
          onChange={handleJobFormChange}
          onSubmit={handleJobSubmit}
          onClose={() => { setShowJobForm(false); setEditingJob(null); setJobForm(emptyJobForm); }}
          submitting={submitting}
        />
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default Dashboard;
