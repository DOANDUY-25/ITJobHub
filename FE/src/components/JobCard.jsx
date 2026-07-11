import React from 'react';
import { MapPin, DollarSign, Calendar, ArrowUpRight } from 'lucide-react';

function JobCard({ job, onViewDetails, onApply }) {
  const getBadgeClass = (type) => {
    switch (type.toLowerCase()) {
      case 'full-time': return 'badge-primary';
      case 'internship': return 'badge-cyan';
      case 'contract': return 'badge-warning';
      default: return 'badge-success';
    }
  };

  return (
    <div className="glass-card glass-card-hover" style={{
      padding: '1.75rem',
      textAlign: 'left',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100%',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Header Info */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {/* Mock Company Logo */}
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: job.logoColor || 'linear-gradient(135deg, var(--primary), var(--secondary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '1.2rem',
              color: '#fff',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
            }}>
              {job.company.charAt(0).toUpperCase()}
            </div>
            <div>
              <h4 style={{ fontSize: '0.925rem', color: 'var(--text-muted)', fontWeight: 500, margin: 0 }}>
                {job.company}
              </h4>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '0.15rem', color: 'var(--text-primary)', cursor: 'pointer' }} onClick={() => onViewDetails(job)}>
                {job.title}
              </h3>
            </div>
          </div>

          <button onClick={() => onViewDetails(job)} style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '0.25rem',
            transition: 'color 0.2s'
          }} onMouseOver={e => e.currentTarget.style.color = 'var(--primary)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}>
            <ArrowUpRight size={20} />
          </button>
        </div>

        {/* Info Badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <span className={`badge ${getBadgeClass(job.type)}`}>
            {job.type}
          </span>
          <span className="badge badge-success" style={{ background: 'rgba(16, 185, 129, 0.08)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
            {job.experience}
          </span>
        </div>

        {/* Job Details Meta */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <MapPin size={14} color="var(--primary)" />
            {job.location}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontWeight: 600 }}>
            <DollarSign size={14} />
            {job.salary}
          </div>
        </div>

        {/* Tech tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
          {job.skills.map((skill, index) => (
            <span key={index} style={{
              fontSize: '0.75rem',
              padding: '0.15rem 0.5rem',
              borderRadius: '4px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-muted)'
            }}>
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Action Footer */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTop: '1px solid var(--border-muted)',
        paddingTop: '1.25rem',
        marginTop: 'auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <Calendar size={12} />
          <span>{job.postedDate}</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => onViewDetails(job)} className="btn btn-secondary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', borderRadius: '6px' }}>
            Details
          </button>
          <button onClick={() => onApply(job)} className="btn btn-primary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', borderRadius: '6px' }}>
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

export default JobCard;
