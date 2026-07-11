import React, { useState } from 'react';
import { User, Mail, Calendar, Briefcase, FileText, CheckCircle2, ChevronRight, Plus, Trash2 } from 'lucide-react';

function Dashboard({ user, appliedJobs, showToast }) {
  const [profile, setProfile] = useState({
    title: 'Senior Frontend Developer',
    experience: '5 years',
    skills: ['React', 'JavaScript', 'HTML/CSS', 'Webpack', 'TypeScript'],
    bio: 'Dedicated software engineer focusing on building highly performant, accessible web user interfaces with clean styling architecture.'
  });

  const [newSkill, setNewSkill] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ ...profile });

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    if (editForm.skills.includes(newSkill.trim())) {
      showToast('Skill already added.', 'info');
      return;
    }
    setEditForm({
      ...editForm,
      skills: [...editForm.skills, newSkill.trim()]
    });
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setEditForm({
      ...editForm,
      skills: editForm.skills.filter(s => s !== skillToRemove)
    });
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setProfile({ ...editForm });
    setIsEditing(false);
    showToast('Professional profile updated successfully!', 'success');
  };

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem 5rem 1.5rem', textAlign: 'left' }}>
      {/* Welcome banner */}
      <div className="glass-card" style={{
        padding: '2.5rem',
        marginBottom: '2rem',
        background: 'linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(6,182,212,0.05) 100%)',
        border: '1px solid var(--border-glow)'
      }}>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem', fontWeight: 800 }}>
          Welcome back, {user ? user.fullName : 'Developer'}!
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Manage your job applications, edit your digital resume, and discover matching opportunities.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }} className="dashboard-layout">
        {/* Left Column: Applications Tracker */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Briefcase size={20} color="var(--primary)" />
              Applied Positions ({appliedJobs.length})
            </h2>

            {appliedJobs.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {appliedJobs.map((app, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1.25rem',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-muted)',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}>
                    <div>
                      <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 600 }}>{app.jobTitle}</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 550, marginTop: '0.15rem' }}>{app.company}</p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <Calendar size={14} />
                        Applied: {app.appliedDate}
                      </div>
                      <span className="badge badge-primary" style={{ textTransform: 'capitalize' }}>
                        {app.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '3rem 1.5rem',
                backgroundColor: 'rgba(255, 255, 255, 0.01)',
                border: '1px dashed var(--border-muted)',
                borderRadius: '12px'
              }}>
                <FileText size={40} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                  You haven't applied to any jobs yet. Browse our job boards to get started.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Professional Profile Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="glass-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={20} color="var(--primary)" />
                Developer Profile
              </h2>
              {!isEditing && (
                <button onClick={() => { setEditForm({ ...profile }); setIsEditing(true); }} className="btn btn-secondary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}>
                  Edit Profile
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSaveProfile}>
                <div className="form-group">
                  <label className="form-label">Professional Title</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={editForm.title}
                    onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Years of Experience</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={editForm.experience}
                    onChange={e => setEditForm({ ...editForm, experience: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">About / Biography</label>
                  <textarea
                    required
                    className="form-input"
                    rows="4"
                    value={editForm.bio}
                    onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Technical Skills</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
                    {editForm.skills.map((skill, index) => (
                      <span key={index} className="badge badge-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        {skill}
                        <button type="button" onClick={() => handleRemoveSkill(skill)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', padding: 0 }}>
                          <Trash2 size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Add another skill..."
                      value={newSkill}
                      onChange={e => setNewSkill(e.target.value)}
                    />
                    <button type="button" onClick={handleAddSkill} className="btn btn-secondary" style={{ padding: '0 1rem' }}>
                      <Plus size={18} />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem' }}>
                  <button type="button" onClick={() => setIsEditing(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
                    Save Profile
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Position Title</span>
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: 600 }}>{profile.title}</h3>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Years of Experience</span>
                    <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>{profile.experience}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Biography</span>
                    <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{profile.bio}</p>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Skills Inventory</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {profile.skills.map((skill, index) => (
                      <span key={index} className="badge badge-primary">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid var(--border-muted)', margin: '1.5rem 0' }} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Mail size={16} color="var(--primary)" />
                    <span style={{ color: 'var(--text-primary)' }}>{user ? user.email : 'not-authenticated@itjobhub.com'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={16} color="var(--success)" />
                    <span style={{ color: 'var(--text-muted)' }}>Account Verification Status: </span>
                    <span className="badge badge-success" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>Verified</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 992px) {
          .dashboard-layout {
            grid-template-columns: 1.6fr 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

export default Dashboard;
