import React, { useState, useEffect } from 'react';
import { 
  User, Building2, Phone, MapPin, Award, BookOpen, Briefcase, 
  Plus, Trash2, Save, Edit3, RefreshCw, CheckCircle2, Globe, Image as ImageIcon 
} from 'lucide-react';
import { profileService } from '../services/api';

function ProfileSection({ user, showToast }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [newSkill, setNewSkill] = useState('');

  const isCandidate = user?.role === 'CANDIDATE';
  const isEmployer = user?.role === 'EMPLOYER';

  // Form states
  const [formData, setFormData] = useState({
    phone: '',
    // Candidate fields
    fullName: '',
    avatarUrl: '',
    bio: '',
    skills: '',
    experience: '',
    education: '',
    preferredLocation: '',
    // Company fields
    companyName: '',
    logoUrl: '',
    location: '',
    industry: '',
    size: '',
    description: '',
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await profileService.getProfile();
      setProfileData(data);

      const candidate = data.candidateProfile || {};
      const company = data.companyProfile || {};

      setFormData({
        phone: data.phone || '',
        fullName: candidate.fullName || data.fullName || user?.fullName || '',
        avatarUrl: candidate.avatarUrl || '',
        bio: candidate.bio || '',
        skills: candidate.skills || 'React, JavaScript, TypeScript, CSS Architecture',
        experience: candidate.experience || '',
        education: candidate.education || '',
        preferredLocation: candidate.preferredLocation || '',
        companyName: company.companyName || data.fullName || user?.fullName || '',
        logoUrl: company.logoUrl || '',
        location: company.location || '',
        industry: company.industry || 'Information Technology & Software',
        size: company.size || '11-50',
        description: company.description || '',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Fallback if token expired or not loaded yet
      setFormData(prev => ({
        ...prev,
        fullName: user?.fullName || 'Developer',
        companyName: user?.fullName || 'Tech Company Ltd.',
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const parseSkills = (skillsStr) => {
    if (!skillsStr) return [];
    return skillsStr.split(',').map(s => s.trim()).filter(Boolean);
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    const currentSkills = parseSkills(formData.skills);
    if (currentSkills.includes(newSkill.trim())) {
      showToast('Skill already exists in your list', 'info');
      return;
    }
    const updated = [...currentSkills, newSkill.trim()].join(', ');
    setFormData({ ...formData, skills: updated });
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    const currentSkills = parseSkills(formData.skills);
    const updated = currentSkills.filter(s => s !== skillToRemove).join(', ');
    setFormData({ ...formData, skills: updated });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        phone: formData.phone || null,
        ...(isCandidate ? {
          fullName: formData.fullName || null,
          avatarUrl: formData.avatarUrl || null,
          bio: formData.bio || null,
          skills: formData.skills || null,
          experience: formData.experience || null,
          education: formData.education || null,
          preferredLocation: formData.preferredLocation || null,
        } : {
          companyName: formData.companyName || null,
          logoUrl: formData.logoUrl || null,
          location: formData.location || null,
          industry: formData.industry || null,
          size: formData.size || null,
          description: formData.description || null,
        })
      };

      const res = await profileService.updateProfile(payload);
      setProfileData(res);
      setIsEditing(false);
      showToast('Cập nhật hồ sơ thành công!', 'success');

      // Cập nhật tên trong localStorage
      const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (isCandidate && formData.fullName) savedUser.fullName = formData.fullName;
      if (isEmployer && formData.companyName) savedUser.fullName = formData.companyName;
      localStorage.setItem('user', JSON.stringify(savedUser));
    } catch (error) {
      const status = error.response?.status;
      if (status === 401) {
        showToast('Phiên đăng nhập hết hạn. Đang chuyển về trang đăng nhập...', 'error');
        // Interceptor sẽ xử lý redirect sau 1.5s
      } else if (status === 403) {
        showToast('Không có quyền thực hiện thao tác này. Vui lòng đăng nhập lại.', 'error');
      } else if (status === 400) {
        const msg = error.response?.data?.message || 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.';
        showToast(msg, 'error');
      } else {
        showToast('Lỗi kết nối đến máy chủ. Vui lòng thử lại.', 'error');
      }
      console.error('Save profile error:', status, error.response?.data);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-card" style={{ padding: '4rem', textAlign: 'center', borderRadius: '16px' }}>
        <RefreshCw size={36} className="animate-spin" style={{ color: 'var(--primary)', margin: '0 auto 1rem auto' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Loading your digital profile data from server...</p>
      </div>
    );
  }

  const currentSkillsList = parseSkills(formData.skills);
  const avatarImage = isCandidate ? formData.avatarUrl : formData.logoUrl;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Profile Header Banner */}
      <div className="glass-card" style={{ 
        padding: '2rem 2.5rem', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem',
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(6, 182, 212, 0.08) 100%)',
        border: '1px solid var(--border-hover)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{
            width: '85px',
            height: '85px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            padding: '3px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 25px rgba(139, 92, 246, 0.35)'
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              borderRadius: '17px',
              backgroundColor: 'var(--bg-dark)',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {avatarImage ? (
                <img src={avatarImage} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
              ) : isEmployer ? (
                <Building2 size={40} color="var(--secondary)" />
              ) : (
                <User size={40} color="var(--primary)" />
              )}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
                {isCandidate ? formData.fullName || 'Candidate Profile' : formData.companyName || 'Company Profile'}
              </h2>
              <span className={`badge ${isCandidate ? 'badge-primary' : 'badge-cyan'}`} style={{ textTransform: 'uppercase' }}>
                {user?.role || 'USER'}
              </span>
              {profileData?.accountStatus === 'ACTIVE' && (
                <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={12} /> Verified
                </span>
              )}
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '1.2rem', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Phone size={14} color="var(--primary)" /> {formData.phone || 'No phone set'}
              </span>
              {(formData.preferredLocation || formData.location) && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MapPin size={14} color="var(--secondary)" /> {formData.preferredLocation || formData.location}
                </span>
              )}
            </p>
          </div>
        </div>

        <div>
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="btn btn-primary" style={{ padding: '0.7rem 1.4rem' }}>
              <Edit3 size={16} /> Edit Profile Data
            </button>
          ) : (
            <button onClick={() => setIsEditing(false)} className="btn btn-secondary" style={{ padding: '0.7rem 1.4rem' }}>
              Cancel Editing
            </button>
          )}
        </div>
      </div>

      {/* Main Profile Content or Edit Form */}
      {isEditing ? (
        <form onSubmit={handleSave} className="glass-card animate-fade-in" style={{ padding: '2.5rem' }}>
          <h3 style={{ fontSize: '1.35rem', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-muted)', paddingBottom: '1rem' }}>
            <Edit3 size={20} color="var(--primary)" />
            {isCandidate ? 'Edit Candidate Details' : 'Edit Company Details'}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {/* Common field */}
            <div className="form-group">
              <label className="form-label">Contact Phone Number</label>
              <input 
                type="tel" 
                className="form-input" 
                placeholder="+84 912 345 678" 
                value={formData.phone} 
                onChange={e => setFormData({ ...formData, phone: e.target.value })} 
              />
            </div>

            {isCandidate ? (
              <>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input 
                    type="text" 
                    required 
                    className="form-input" 
                    placeholder="John Doe" 
                    value={formData.fullName} 
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })} 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Avatar URL (Image Link)</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input 
                      type="url" 
                      className="form-input" 
                      placeholder="https://example.com/photo.jpg" 
                      value={formData.avatarUrl} 
                      onChange={e => setFormData({ ...formData, avatarUrl: e.target.value })} 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Preferred Work Location</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Ho Chi Minh City, Remote, Hanoi" 
                    value={formData.preferredLocation} 
                    onChange={e => setFormData({ ...formData, preferredLocation: e.target.value })} 
                  />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Professional Summary & Bio</label>
                  <textarea 
                    className="form-input" 
                    rows="4" 
                    placeholder="Write a brief professional summary describing your core competencies, career goals, and passion..." 
                    value={formData.bio} 
                    onChange={e => setFormData({ ...formData, bio: e.target.value })} 
                  />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Technical & Professional Skills</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.85rem', minHeight: '32px', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px dashed var(--border-muted)' }}>
                    {currentSkillsList.length > 0 ? currentSkillsList.map((skill, index) => (
                      <span key={index} className="badge badge-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '0.4rem 0.8rem' }}>
                        {skill}
                        <button type="button" onClick={() => handleRemoveSkill(skill)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex' }}>
                          <Trash2 size={13} />
                        </button>
                      </span>
                    )) : <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No skills added yet. Type below and press enter/plus.</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Type skill (e.g. React, Docker, Spring Boot) and press Add..." 
                      value={newSkill} 
                      onChange={e => setNewSkill(e.target.value)} 
                      onKeyDown={e => { if (e.key === 'Enter') handleAddSkill(e); }}
                    />
                    <button type="button" onClick={handleAddSkill} className="btn btn-secondary" style={{ padding: '0 1.25rem' }}>
                      <Plus size={18} /> Add Skill
                    </button>
                  </div>
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Work Experience Summary</label>
                  <textarea 
                    className="form-input" 
                    rows="3" 
                    placeholder="Describe your previous work experience, companies worked for, or notable projects..." 
                    value={formData.experience} 
                    onChange={e => setFormData({ ...formData, experience: e.target.value })} 
                  />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Education Background</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Bachelor of Information Technology - ABC University (2021-2025)" 
                    value={formData.education} 
                    onChange={e => setFormData({ ...formData, education: e.target.value })} 
                  />
                </div>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label">Company / Organization Name</label>
                  <input 
                    type="text" 
                    required 
                    className="form-input" 
                    placeholder="Acme Tech Solutions Corp." 
                    value={formData.companyName} 
                    onChange={e => setFormData({ ...formData, companyName: e.target.value })} 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Logo URL (Image Link)</label>
                  <input 
                    type="url" 
                    className="form-input" 
                    placeholder="https://example.com/logo.png" 
                    value={formData.logoUrl} 
                    onChange={e => setFormData({ ...formData, logoUrl: e.target.value })} 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Headquarters Location</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="District 1, Ho Chi Minh City, Vietnam" 
                    value={formData.location} 
                    onChange={e => setFormData({ ...formData, location: e.target.value })} 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Industry Domain</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Fintech, AI & Machine Learning, E-Commerce" 
                    value={formData.industry} 
                    onChange={e => setFormData({ ...formData, industry: e.target.value })} 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Company Size</label>
                  <select 
                    className="form-input" 
                    value={formData.size} 
                    onChange={e => setFormData({ ...formData, size: e.target.value })}
                    style={{ backgroundColor: 'var(--bg-dark-sec)' }}
                  >
                    <option value="1-10">1 - 10 Employees (Startup)</option>
                    <option value="11-50">11 - 50 Employees (Small)</option>
                    <option value="51-200">51 - 200 Employees (Medium)</option>
                    <option value="200+">200+ Employees (Enterprise)</option>
                  </select>
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Company Description & Mission</label>
                  <textarea 
                    className="form-input" 
                    rows="5" 
                    placeholder="Share your company history, culture, core products, and vision to attract top technical talent..." 
                    value={formData.description} 
                    onChange={e => setFormData({ ...formData, description: e.target.value })} 
                  />
                </div>
              </>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2.5rem', borderTop: '1px solid var(--border-muted)', paddingTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsEditing(false)} className="btn btn-secondary" style={{ padding: '0.75rem 1.75rem' }}>
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
              {saving ? (
                <>
                  <RefreshCw size={18} className="animate-spin" /> Saving Changes...
                </>
              ) : (
                <>
                  <Save size={18} /> Save Profile Data
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        /* Read-only Display Mode */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
          <div className="glass-card" style={{ padding: '2.5rem' }}>
            <h3 style={{ fontSize: '1.35rem', marginBottom: '1.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {isCandidate ? <BookOpen size={20} color="var(--primary)" /> : <Building2 size={20} color="var(--secondary)" />}
              {isCandidate ? 'Professional Summary & Skills' : 'Company Overview'}
            </h3>

            {isCandidate ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.5rem' }}>
                    About & Biography
                  </span>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                    {formData.bio || 'No biographical overview written yet. Click Edit Profile Data above to add one!'}
                  </p>
                </div>

                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.65rem' }}>
                    Core Technical Skills ({currentSkillsList.length})
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                    {currentSkillsList.length > 0 ? currentSkillsList.map((skill, idx) => (
                      <span key={idx} className="badge badge-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                        {skill}
                      </span>
                    )) : <span style={{ color: 'var(--text-muted)' }}>No skills listed.</span>}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', borderTop: '1px solid var(--border-muted)', paddingTop: '1.5rem' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem' }}>
                      <Briefcase size={16} color="var(--primary)" /> Experience Highlights
                    </span>
                    <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem', whiteSpace: 'pre-line' }}>
                      {formData.experience || 'No experience details specified.'}
                    </p>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem' }}>
                      <Award size={16} color="var(--secondary)" /> Education Background
                    </span>
                    <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                      {formData.education || 'No education records specified.'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Employer / Company read-only */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-muted)' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Industry Domain</span>
                    <span className="badge badge-cyan" style={{ fontSize: '0.9rem', padding: '0.4rem 0.85rem' }}>{formData.industry || 'Not specified'}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Company Scale</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '1.05rem' }}>{formData.size || '11-50'} Employees</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Profile Verification</span>
                    <span className="badge badge-primary">{profileData?.companyProfile?.profileStatus || 'ACTIVE'}</span>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.5rem' }}>
                    Company Description & Culture
                  </span>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                    {formData.description || 'No company overview written yet. Click Edit Profile Data above to add details about your company culture and mission.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileSection;
