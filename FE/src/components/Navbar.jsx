import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Briefcase, User, LogOut, LogIn, Menu, X, Bell } from 'lucide-react';

function Navbar({ user, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 900,
      background: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-muted)',
      width: '100%'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'between',
        height: '70px',
        padding: '0 1.5rem',
        maxWidth: '1200px',
        margin: '0 auto',
        justifyContent: 'space-between'
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            padding: '0.5rem',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(139, 92, 246, 0.3)'
          }}>
            <Briefcase size={22} color="#fff" />
          </div>
          <span style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.25rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.03em'
          }}>
            IT<span style={{ color: 'var(--primary)' }}>Job</span>Hub
          </span>
        </Link>

        {/* Desktop Links */}
        <div style={{ display: 'none', alignItems: 'center', gap: '2rem' }} className="desktop-menu">
          <Link to="/" style={{
            fontSize: '0.925rem',
            fontWeight: 500,
            color: isActive('/') ? 'var(--primary)' : 'var(--text-secondary)'
          }}>
            Find Jobs
          </Link>
          {user && (
            <Link to="/dashboard" style={{
              fontSize: '0.925rem',
              fontWeight: 500,
              color: isActive('/dashboard') ? 'var(--primary)' : 'var(--text-secondary)'
            }}>
              Dashboard
            </Link>
          )}
        </div>

        {/* Desktop Buttons */}
        <div style={{ display: 'none', alignItems: 'center', gap: '1rem' }} className="desktop-menu">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <button style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}>
                <Bell size={20} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  color: '#fff',
                  fontSize: '0.875rem'
                }}>
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {user.fullName}
                  </span>
                  <span className="badge badge-primary" style={{ fontSize: '0.65rem', padding: '1px 6px', marginTop: '2px' }}>
                    {user.role}
                  </span>
                </div>
              </div>

              <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                <LogOut size={16} />
                Logout
              </button>
            </div>
          ) : (
            <Link to="/auth" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>
              <LogIn size={16} />
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button onClick={() => setIsOpen(!isOpen)} style={{
          display: 'block',
          background: 'transparent',
          border: 'none',
          color: 'var(--text-primary)',
          cursor: 'pointer'
        }} className="mobile-menu-btn">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div style={{
          background: 'var(--bg-dark-sec)',
          borderTop: '1px solid var(--border-muted)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          position: 'absolute',
          top: '70px',
          left: 0,
          right: 0,
          boxShadow: '0 10px 15px rgba(0,0,0,0.05)',
          zIndex: 899
        }}>
          <Link to="/" onClick={() => setIsOpen(false)} style={{
            fontSize: '1rem',
            fontWeight: 500,
            color: isActive('/') ? 'var(--primary)' : 'var(--text-secondary)'
          }}>
            Find Jobs
          </Link>
          {user && (
            <Link to="/dashboard" onClick={() => setIsOpen(false)} style={{
              fontSize: '1rem',
              fontWeight: 500,
              color: isActive('/dashboard') ? 'var(--primary)' : 'var(--text-secondary)'
            }}>
              Dashboard
            </Link>
          )}

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-muted)', margin: '0.5rem 0' }} />

          {user ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  color: '#fff'
                }}>
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', margin: 0 }}>{user.fullName}</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email} • {user.role}</p>
                </div>
              </div>
              <button onClick={() => { handleLogout(); setIsOpen(false); }} className="btn btn-secondary" style={{ width: '100%' }}>
                <LogOut size={16} />
                Logout
              </button>
            </div>
          ) : (
            <Link to="/auth" onClick={() => setIsOpen(false)} className="btn btn-primary" style={{ width: '100%' }}>
              <LogIn size={16} />
              Sign In
            </Link>
          )}
        </div>
      )}

      {/* Mini-hack for showing desktop menus properly */}
      <style>{`
        @media (min-width: 768px) {
          .desktop-menu { display: flex !important; }
          .mobile-menu-btn { display: none !important; }
        }
      `}</style>
    </nav>
  );
}

export default Navbar;
