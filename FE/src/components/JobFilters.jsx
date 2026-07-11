import React from 'react';
import { Search, MapPin, Briefcase, Award, RotateCcw } from 'lucide-react';

function JobFilters({ filters, onFilterChange, onReset }) {
  const locations = ['All Locations', 'Ha Noi', 'Ho Chi Minh', 'Da Nang', 'Remote'];
  const jobTypes = ['All Types', 'Full-time', 'Part-time', 'Contract', 'Internship'];
  const experienceLevels = ['All Experience', 'Junior', 'Mid-level', 'Senior', 'Lead/Principal'];

  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div className="glass-card" style={{
      padding: '1.5rem',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1.25rem',
      alignItems: 'end',
      width: '100%',
      marginBottom: '2rem',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
    }}>
      {/* Search Query */}
      <div className="form-group" style={{ margin: 0 }}>
        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Search size={14} color="var(--primary)" />
          Search Job Title or Skills
        </label>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. React, Spring Boot, DevOps..."
            value={filters.query}
            onChange={(e) => handleChange('query', e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
          <Search size={18} color="var(--text-muted)" style={{
            position: 'absolute',
            left: '0.85rem',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none'
          }} />
        </div>
      </div>

      {/* Location */}
      <div className="form-group" style={{ margin: 0 }}>
        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <MapPin size={14} color="var(--primary)" />
          Location
        </label>
        <select
          className="form-input"
          value={filters.location}
          onChange={(e) => handleChange('location', e.target.value)}
          style={{ cursor: 'pointer', appearance: 'none' }}
        >
          {locations.map((loc) => (
            <option key={loc} value={loc} style={{ background: '#0e111a', color: '#fff' }}>
              {loc}
            </option>
          ))}
        </select>
      </div>

      {/* Job Type */}
      <div className="form-group" style={{ margin: 0 }}>
        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Briefcase size={14} color="var(--primary)" />
          Employment Type
        </label>
        <select
          className="form-input"
          value={filters.type}
          onChange={(e) => handleChange('type', e.target.value)}
          style={{ cursor: 'pointer', appearance: 'none' }}
        >
          {jobTypes.map((t) => (
            <option key={t} value={t} style={{ background: '#0e111a', color: '#fff' }}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* Experience Level */}
      <div className="form-group" style={{ margin: 0 }}>
        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Award size={14} color="var(--primary)" />
          Experience Level
        </label>
        <select
          className="form-input"
          value={filters.experience}
          onChange={(e) => handleChange('experience', e.target.value)}
          style={{ cursor: 'pointer', appearance: 'none' }}
        >
          {experienceLevels.map((exp) => (
            <option key={exp} value={exp} style={{ background: '#0e111a', color: '#fff' }}>
              {exp}
            </option>
          ))}
        </select>
      </div>

      {/* Reset Button */}
      <div style={{ display: 'flex', justifyContent: 'stretch' }}>
        <button
          onClick={onReset}
          className="btn btn-secondary"
          style={{
            width: '100%',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0 1rem'
          }}
        >
          <RotateCcw size={16} />
          Reset Filters
        </button>
      </div>
    </div>
  );
}

export default JobFilters;
