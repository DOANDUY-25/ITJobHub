import React, { useState, useEffect } from 'react';
import { User, Briefcase, Lock, Calendar, FileText, RefreshCw, ExternalLink, Mail, Phone, FileDown } from 'lucide-react';
import ProfileSection from '../components/ProfileSection';
import SecuritySection from '../components/SecuritySection';
import { applicationService } from '../services/api';

function Dashboard({ user, showToast }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);

  useEffect(() => {
    if (activeTab === 'applications' && user) {
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
          showToast('Failed to load applications from server.', 'error');
          console.error(err);
        } finally {
          setLoadingApps(false);
        }
      };
      fetchApps();
    }
  }, [activeTab, user]);

  const tabs = [
    { id: 'profile', label: 'Profile & Digital Resume', icon: User },
    { 
      id: 'applications', 
      label: user?.role === 'EMPLOYER' ? 'Received Applications' : 'Job Applications', 
      icon: Briefcase 
    },
    { id: 'security', label: 'Account Security & Password', icon: Lock },
  ];

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem 5rem 1.5rem', textAlign: 'left' }}>
      {/* Welcome & Navigation Banner */}
      <div className="glass-card" style={{
        padding: '2rem 2.5rem',
        marginBottom: '2rem',
        background: 'linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(6,182,212,0.05) 100%)',
        border: '1px solid var(--border-glow)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <span className="badge badge-primary" style={{ textTransform: 'uppercase', marginBottom: '0.5rem', display: 'inline-block' }}>
              {user?.role || 'User Dashboard'}
            </span>
            <h1 style={{ fontSize: '2.25rem', marginBottom: '0.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Welcome, {user?.fullName || user?.email?.split('@')[0] || 'Developer'}!
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              {user?.role === 'EMPLOYER' 
                ? 'Manage your corporate profile, job postings, and screen candidate job applications.'
                : 'Manage your technical portfolio, track career opportunities, and secure your account credentials.'}
            </p>
          </div>

          {/* Tab Navigation Chips */}
          <div style={{ 
            display: 'flex', 
            gap: '0.5rem', 
            backgroundColor: 'var(--bg-dark)', 
            padding: '6px', 
            borderRadius: '14px', 
            border: '1px solid var(--border-muted)',
            flexWrap: 'wrap'
          }}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.65rem 1.25rem',
                    borderRadius: '10px',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    border: 'none',
                    backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                    color: isActive ? '#fff' : 'var(--text-secondary)',
                    boxShadow: isActive ? '0 4px 15px var(--primary-glow)' : 'none',
                    outline: 'none'
                  }}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Contents */}
      <div className="tab-content-area">
        {activeTab === 'profile' && (
          <div className="animate-fade-in">
            <ProfileSection user={user} showToast={showToast} />
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="glass-card animate-fade-in" style={{ padding: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
              <Briefcase size={22} color="var(--primary)" />
              {user?.role === 'EMPLOYER' ? 'Received Job Applications' : 'Applied Job Applications History'} ({appliedJobs.length})
            </h2>

            {loadingApps ? (
              <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <RefreshCw size={36} className="animate-spin" style={{ color: 'var(--primary)', margin: '0 auto 1rem auto', animation: 'spin 1s linear infinite' }} />
                <p style={{ color: 'var(--text-secondary)' }}>Retrieving application records...</p>
              </div>
            ) : appliedJobs && appliedJobs.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {appliedJobs.map((app, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-muted)',
                    gap: '1rem',
                    transition: 'all var(--transition-fast)'
                  }} className="glass-card-hover">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                      <div>
                        <h4 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 600, margin: 0 }}>
                          {app.jobTitle}
                        </h4>
                        <p style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 550, marginTop: '0.2rem', marginBottom: 0 }}>
                          {user.role === 'EMPLOYER' ? `Applicant: ${app.candidateName}` : app.companyName}
                        </p>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          <Calendar size={15} />
                          {app.appliedDate}
                        </div>
                        <span className="badge badge-primary" style={{ textTransform: 'uppercase', padding: '0.35rem 0.9rem' }}>
                          {app.status}
                        </span>
                      </div>
                    </div>

                    {user.role === 'EMPLOYER' && (
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                        gap: '0.75rem',
                        backgroundColor: 'var(--bg-dark)',
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        border: '1px solid var(--border-muted)',
                        fontSize: '0.875rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                          <Mail size={14} color="var(--primary)" />
                          <span>{app.candidateEmail}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                          <Phone size={14} color="var(--primary)" />
                          <span>{app.candidatePhone || 'No Phone provided'}</span>
                        </div>
                      </div>
                    )}

                    {app.coverLetter && (
                      <div style={{ 
                        backgroundColor: 'var(--bg-dark)', 
                        padding: '1rem', 
                        borderRadius: '8px',
                        borderLeft: '3px solid var(--primary)',
                        fontSize: '0.9rem',
                        color: 'var(--text-secondary)'
                      }}>
                        <strong>Cover Letter:</strong>
                        <p style={{ marginTop: '0.5rem', whiteSpace: 'pre-line', marginBottom: 0 }}>{app.coverLetter}</p>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid var(--border-muted)', paddingTop: '1rem' }}>
                      <a 
                        href={`http://localhost:9999/api${app.cvUrl}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="btn btn-secondary" 
                        style={{ padding: '0.5rem 1rem', fontSize: '0.825rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                      >
                        <FileDown size={14} />
                        Download/View CV
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '4rem 2rem',
                backgroundColor: 'rgba(255, 255, 255, 0.01)',
                border: '1px dashed var(--border-muted)',
                borderRadius: '16px'
              }}>
                <FileText size={48} color="var(--text-muted)" style={{ marginBottom: '1.25rem' }} />
                <h4 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No active applications found</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '400px', margin: '0 auto' }}>
                  {user?.role === 'EMPLOYER' 
                    ? 'No candidates have applied to your job postings yet. Make sure your postings are active.'
                    : "You haven't applied to any job positions yet. Explore our curated job board to discover openings matching your profile."}
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

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default Dashboard;
