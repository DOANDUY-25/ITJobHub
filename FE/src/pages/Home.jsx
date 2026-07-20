import React, { useState, useEffect } from 'react';
import JobFilters from '../components/JobFilters';
import JobCard from '../components/JobCard';
import ApplyModal from '../components/ApplyModal';
import { Sparkles, Calendar, DollarSign, MapPin, Award, CheckCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { jobService } from '../services/api';

function Home({ user, addAppliedJob, showToast }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    query: '',
    location: 'All Locations',
    type: 'All Types',
    experience: 'All Experience',
  });
  const [selectedJob, setSelectedJob] = useState(null);
  const [applyingJob, setApplyingJob] = useState(null);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoading(true);
        const data = await jobService.getPublishedJobs();
        setJobs(data);
      } catch (err) {
        showToast('Failed to load jobs from backend server.', 'error');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadJobs();
  }, []);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({
      query: '',
      location: 'All Locations',
      type: 'All Types',
      experience: 'All Experience',
    });
  };

  const handleViewDetails = async (job) => {
    try {
      const details = await jobService.getJobDetails(job.id);
      setSelectedJob(details);
    } catch (err) {
      showToast('Failed to fetch job details from server.', 'error');
      console.error(err);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesQuery =
      job.title.toLowerCase().includes(filters.query.toLowerCase()) ||
      job.company.toLowerCase().includes(filters.query.toLowerCase()) ||
      job.skills.some((s) => s.toLowerCase().includes(filters.query.toLowerCase()));

    const matchesLocation =
      filters.location === 'All Locations' || 
      job.location.toLowerCase().includes(filters.location.toLowerCase());

    const matchesType = filters.type === 'All Types' || job.type === filters.type;

    const matchesExperience =
      filters.experience === 'All Experience' || job.experience === filters.experience;

    return matchesQuery && matchesLocation && matchesType && matchesExperience;
  });

  const handleApplySuccess = (applicationData) => {
    addAppliedJob(applicationData);
    setApplyingJob(null);
    setSelectedJob(null);
    showToast('Application submitted successfully!', 'success');
  };

  return (
    <div style={{ flex: 1, paddingBottom: '4rem' }}>
      {/* Hero Section */}
      <section style={{
        position: 'relative',
        padding: '5rem 1.5rem',
        textAlign: 'center',
        background: 'linear-gradient(180deg, rgba(139, 92, 246, 0.05) 0%, transparent 100%)',
        overflow: 'hidden'
      }}>
        <div className="hero-glow" style={{ top: '-10%', left: '50%', transform: 'translateX(-50%)' }} />
        
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 1rem',
            borderRadius: '9999px',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            color: '#c084fc',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '1.5rem',
            animation: 'fadeIn 0.5s ease-out'
          }}>
            <Sparkles size={14} />
            The High-Tech Career Gateway
          </div>

          <h1 style={{
            fontSize: '3.25rem',
            lineHeight: 1.15,
            marginBottom: '1.25rem',
            fontWeight: 800,
            letterSpacing: '-0.03em'
          }}>
            Engineered for <br />
            <span style={{
              background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              High-Tech Talent
            </span>
          </h1>

          <p style={{
            fontSize: '1.1rem',
            color: 'var(--text-secondary)',
            marginBottom: '2.5rem',
            lineHeight: 1.6,
            maxWidth: '600px',
            margin: '0 auto 2.5rem auto'
          }}>
            Discover elite technical roles in software engineering, cloud architecture, AI algorithms, and modern operations. 
          </p>
        </div>
      </section>

      {/* Stats Counter Row */}
      <section style={{ padding: '0 1.5rem 3rem 1.5rem' }}>
        <div className="container">
          <div className="glass-card" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            padding: '2rem 1rem',
            gap: '2rem',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}>
            <div>
              <h2 style={{ color: 'var(--primary)', fontSize: '2rem', fontWeight: 800 }}>650+</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.25rem' }}>Active Job Openings</p>
            </div>
            <div style={{ borderLeft: '1px solid var(--border-muted)', borderRight: '1px solid var(--border-muted)' }} className="stat-border">
              <h2 style={{ color: 'var(--secondary)', fontSize: '2rem', fontWeight: 800 }}>180+</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.25rem' }}>Verified Employers</p>
            </div>
            <div>
              <h2 style={{ color: 'var(--success)', fontSize: '2rem', fontWeight: 800 }}>$150k+</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.25rem' }}>Max Salary Offered</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Board */}
      <section className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', textAlign: 'left', fontWeight: 700 }}>
          Search Jobs
        </h2>
        
        {/* Job Filters */}
        <JobFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
        />

        {/* Listings Counter */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          fontSize: '0.9rem',
          color: 'var(--text-muted)'
        }}>
          <span>Showing <strong>{filteredJobs.length}</strong> jobs based on search criteria</span>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center', borderRadius: '16px' }}>
            <RefreshCw size={36} className="animate-spin" style={{ color: 'var(--primary)', margin: '0 auto 1rem auto' }} />
            <p style={{ color: 'var(--text-secondary)' }}>Loading job postings from server...</p>
          </div>
        ) : filteredJobs.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem'
          }}>
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onViewDetails={handleViewDetails}
                onApply={setApplyingJob}
              />
            ))}
          </div>
        ) : (
          <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              No job postings found matching your search.
            </p>
            <button onClick={handleResetFilters} className="btn btn-primary" style={{ padding: '0.5rem 1.25rem' }}>
              Reset Filters
            </button>
          </div>
        )}
      </section>

      {/* Details Drawer / Modal */}
      {selectedJob && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '700px', textAlign: 'left' }}>
            {/* Close Button */}
            <button onClick={() => setSelectedJob(null)} style={{
              position: 'absolute',
              top: '1.25rem',
              right: '1.25rem',
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.25rem'
            }}>
              <X size={20} />
            </button>

            {/* Job Header */}
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '16px',
                background: selectedJob.logoColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.5rem',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}>
                {selectedJob.company.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  {selectedJob.title}
                </h3>
                <p style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '1rem', marginTop: '0.15rem' }}>
                  {selectedJob.company}
                </p>
              </div>
            </div>

            {/* Badges and Details Panel */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '1rem',
              backgroundColor: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--border-muted)',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '1.5rem'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Location</span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.15rem' }}>
                  <MapPin size={14} color="var(--primary)" />
                  {selectedJob.location}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Salary Offer</span>
                <span style={{ fontSize: '0.9rem', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.15rem' }}>
                  <DollarSign size={14} />
                  {selectedJob.salary}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Job Type</span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.15rem' }}>
                  <Award size={14} color="var(--primary)" />
                  {selectedJob.type}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Experience</span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.15rem' }}>
                  <CheckCircle size={14} color="var(--success)" />
                  {selectedJob.experience}
                </span>
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: 600 }}>Job Description</h4>
              <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{selectedJob.description}</p>
            </div>

            {/* Requirements */}
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.75rem', fontWeight: 600 }}>Requirements</h4>
              <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {selectedJob.requirements.map((req, index) => (
                  <li key={index} style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{req}</li>
                ))}
              </ul>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid var(--border-muted)', paddingTop: '1.5rem' }}>
              <button onClick={() => setSelectedJob(null)} className="btn btn-secondary" style={{ flex: 1 }}>
                Close Details
              </button>
              <button onClick={() => { setApplyingJob(selectedJob); }} className="btn btn-primary" style={{ flex: 2 }}>
                Apply for this Position
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Apply Modal */}
      {applyingJob && (
        <ApplyModal
          user={user}
          job={applyingJob}
          onClose={() => setApplyingJob(null)}
          onSubmitSuccess={handleApplySuccess}
          showToast={showToast}
        />
      )}

      <style>{`
        @media (max-width: 768px) {
          .stat-border {
            border-left: none !important;
            border-right: none !important;
            border-top: 1px solid var(--border-muted);
            border-bottom: 1px solid var(--border-muted);
            padding: 1.5rem 0;
          }
        }
      `}</style>
    </div>
  );
}

// Simple absolute close SVG button icon replacement
const X = ({ size, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export default Home;
