import React, { useState } from 'react';
import JobFilters from '../components/JobFilters';
import JobCard from '../components/JobCard';
import ApplyModal from '../components/ApplyModal';
import { Sparkles, Calendar, DollarSign, MapPin, Award, CheckCircle, ArrowRight } from 'lucide-react';

const MOCK_JOBS = [
  {
    id: 1,
    title: 'Senior Frontend Architect (React)',
    company: 'Vortex Labs',
    location: 'Remote',
    type: 'Full-time',
    experience: 'Senior',
    salary: '$3,500 - $5,000',
    skills: ['React', 'TypeScript', 'Next.js', 'Web3'],
    postedDate: '2 hours ago',
    logoColor: 'linear-gradient(135deg, #a78bfa, #7c3aed)',
    description: 'We are seeking a Frontend Architect to spearhead our next-generation SaaS product. You will design core rendering architectures, establish design systems, and lead a stellar team of React developers.',
    requirements: [
      '5+ years of software development experience specializing in React.',
      'Proficiency in TypeScript, build tools (Vite, Webpack), and modern state management.',
      'Experience optimizing Core Web Vitals and SEO optimization.',
      'Excellent leadership and architecture design skills.'
    ]
  },
  {
    id: 2,
    title: 'Backend Engineer (Spring Boot & Cloud)',
    company: 'Nexus Financials',
    location: 'Ha Noi',
    type: 'Full-time',
    experience: 'Mid-level',
    salary: '25,000,000 - 35,000,000 VND',
    skills: ['Java', 'Spring Boot', 'MySQL', 'Docker', 'Redis'],
    postedDate: '1 day ago',
    logoColor: 'linear-gradient(135deg, #34d399, #059669)',
    description: 'Join our backend banking system scaling team. You will create secure, performant REST APIs, manage database scaling (MySQL), and configure microservice communication in Kubernetes.',
    requirements: [
      '3+ years of experience with Java and Spring Framework (Boot, Security, Data).',
      'Solid understanding of database systems (SQL queries optimization, indexing).',
      'Familiarity with containerization (Docker, Kubernetes) and caching (Redis).',
      'Experience building auth schemas and integrating OAuth2.'
    ]
  },
  {
    id: 3,
    title: 'AI & Data Science Specialist',
    company: 'Cerebrum Systems',
    location: 'Ho Chi Minh',
    type: 'Full-time',
    experience: 'Senior',
    salary: '$4,000 - $6,000',
    skills: ['Python', 'PyTorch', 'FastAPI', 'MLOps'],
    postedDate: '3 days ago',
    logoColor: 'linear-gradient(135deg, #60a5fa, #2563eb)',
    description: 'Create and deploy intelligence. Work directly with our data engines to implement custom LLM integrations, train computer vision pipelines, and package endpoints using FastAPI.',
    requirements: [
      'Strong Python foundations and machine learning frameworks (PyTorch, TensorFlow).',
      'Experience deployment models on cloud architectures (AWS, GCP).',
      'Solid command of linear algebra, calculus, and statistics.',
      'PhD or MS in Computer Science, Math, or related field is a plus.'
    ]
  },
  {
    id: 4,
    title: 'DevOps & Infrastructure Engineer',
    company: 'Skyward Inc.',
    location: 'Da Nang',
    type: 'Contract',
    experience: 'Senior',
    salary: '$2,800 - $4,200',
    skills: ['AWS', 'Terraform', 'CI/CD', 'Kubernetes'],
    postedDate: '4 days ago',
    logoColor: 'linear-gradient(135deg, #f472b6, #db2777)',
    description: 'Automate all things! We need a seasoned DevOps professional to maintain our AWS infrastructure via Terraform, establish robust GitHub Action workflows, and manage multi-stage Kubernetes pipelines.',
    requirements: [
      '4+ years working in Cloud Infrastructures (AWS preferred).',
      'Strong expertise writing Infrastructure as Code using Terraform.',
      'Solid Shell scripting (Bash/Python) and Linux system administration.',
      'Proficiency setting up monitoring suites (Prometheus, Grafana, ELK).'
    ]
  },
  {
    id: 5,
    title: 'React Native Developer',
    company: 'MobyApps',
    location: 'Ho Chi Minh',
    type: 'Full-time',
    experience: 'Mid-level',
    salary: '20,000,000 - 30,000,000 VND',
    skills: ['React Native', 'JavaScript', 'Redux', 'iOS/Android'],
    postedDate: '5 days ago',
    logoColor: 'linear-gradient(135deg, #fb7185, #e11d48)',
    description: 'We are seeking a React Native Developer to maintain and introduce new feature updates for our core iOS and Android e-commerce mobile applications.',
    requirements: [
      '2+ years developing mobile apps with React Native.',
      'Familiarity with native modules bridge configurations.',
      'Proven experience releasing apps to Apple App Store or Google Play Store.',
      'Understanding of offline storage, state management, and push notification services.'
    ]
  },
  {
    id: 6,
    title: 'Internship Software Engineer (Java/Web)',
    company: 'ITJobHub Academy',
    location: 'Ha Noi',
    type: 'Internship',
    experience: 'Junior',
    salary: 'Negotiable',
    skills: ['Java', 'SQL', 'HTML/CSS', 'Git'],
    postedDate: '1 week ago',
    logoColor: 'linear-gradient(135deg, #fbbf24, #d97706)',
    description: 'Learn from senior engineers. As an intern, you will undergo structured training, assist in bug fixes, write automated tests, and gain hands-on experience building full-stack web architectures.',
    requirements: [
      'Final year student or self-taught developer in Computer Science.',
      'Basic knowledge of object-oriented programming (OOP) in Java.',
      'Familiarity with git workflow and SQL database engines.',
      'Eager to learn, proactive, and positive attitude.'
    ]
  }
];

function Home({ addAppliedJob, showToast }) {
  const [filters, setFilters] = useState({
    query: '',
    location: 'All Locations',
    type: 'All Types',
    experience: 'All Experience',
  });
  const [selectedJob, setSelectedJob] = useState(null);
  const [applyingJob, setApplyingJob] = useState(null);

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

  const filteredJobs = MOCK_JOBS.filter((job) => {
    const matchesQuery =
      job.title.toLowerCase().includes(filters.query.toLowerCase()) ||
      job.company.toLowerCase().includes(filters.query.toLowerCase()) ||
      job.skills.some((s) => s.toLowerCase().includes(filters.query.toLowerCase()));

    const matchesLocation =
      filters.location === 'All Locations' || job.location === filters.location;

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
        {filteredJobs.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem'
          }}>
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onViewDetails={setSelectedJob}
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
          job={applyingJob}
          onClose={() => setApplyingJob(null)}
          onSubmitSuccess={handleApplySuccess}
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
