import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { Lock, Mail, User, ShieldCheck, ArrowLeft, Loader2, KeyRound } from 'lucide-react';

// Google Sign-In SVG Icon
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

function AuthPage({ onLogin, showToast }) {
  // Views: 'login' | 'register' | 'verify-otp' | 'forgot-password' | 'reset-password'
  const [view, setView] = useState('login');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const googleBtnLoginRef = useRef(null);
  const googleBtnRegisterRef = useRef(null);
  const [googleReady, setGoogleReady] = useState(false);

  // Shared state
  const [email, setEmail] = useState('');
  
  // Login fields
  const [loginPassword, setLoginPassword] = useState('');

  // Registration fields
  const [fullName, setFullName] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [role, setRole] = useState('CANDIDATE'); // CANDIDATE or EMPLOYER

  // OTP fields
  const [otp, setOtp] = useState('');

  // Reset password fields
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // =================== Google Sign-In Setup ===================
  const handleGoogleCallback = useCallback(async (response) => {
    setGoogleLoading(true);
    try {
      const result = await authService.loginWithGoogle(response.credential);
      showToast(`Welcome, ${result.fullName}!`, 'success');
      onLogin(result);
      navigate('/dashboard');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Google login failed. Please try again.';
      showToast(errorMsg, 'error');
    } finally {
      setGoogleLoading(false);
    }
  }, [onLogin, navigate, showToast]);

  // Load Google Identity Services script
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleCallback,
          ux_mode: 'popup',
        });
        setGoogleReady(true);
      }
    };

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [handleGoogleCallback]);

  // Render Google button when the view changes or Google SDK becomes ready
  useEffect(() => {
    if (!googleReady || !window.google) return;

    const renderTarget = view === 'login' ? googleBtnLoginRef.current : view === 'register' ? googleBtnRegisterRef.current : null;
    if (renderTarget) {
      renderTarget.innerHTML = '';
      window.google.accounts.id.renderButton(renderTarget, {
        type: 'standard',
        theme: 'filled_black',
        size: 'large',
        text: view === 'login' ? 'signin_with' : 'signup_with',
        shape: 'rectangular',
        width: renderTarget.offsetWidth || 370,
      });
    }
  }, [view, googleReady]);

  // =================== Handle Login ===================
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authService.login({ email, password: loginPassword });
      // response: AuthResponse { accessToken, refreshToken, tokenType, userId, email, fullName, role }
      showToast(`Welcome back, ${response.fullName}!`, 'success');
      onLogin(response);
      navigate('/dashboard');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      showToast(errorMsg, 'error');
      
      // If backend says account is unverified, navigate to OTP verification
      if (err.response?.data?.message?.toLowerCase().includes('otp') || err.response?.data?.message?.toLowerCase().includes('verify')) {
        setView('verify-otp');
      }
    } finally {
      setLoading(false);
    }
  };

  // =================== Handle Registration ===================
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation matching backend @Size(min = 8)
    if (regPassword.length < 8) {
      showToast('Password must be at least 8 characters.', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.register({
        email,
        password: regPassword,
        fullName,
        role
      });
      // response: MessageResponse { message }
      showToast(response.message || 'Registration successful! Verification OTP sent to your email.', 'success');
      setView('verify-otp');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Registration failed. Try a different email.';
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // =================== Handle OTP Verification ===================
  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Backend expects field name "otpCode", NOT "otp"
      const response = await authService.verifyOtp({ email, otpCode: otp });
      // response: AuthResponse
      showToast('OTP verified successfully! Logged in.', 'success');
      onLogin(response);
      navigate('/dashboard');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Invalid OTP. Please check and try again.';
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // =================== Handle Resend OTP ===================
  const handleResendOtp = async () => {
    if (!email) {
      showToast('Email address is missing.', 'error');
      return;
    }
    setLoading(true);
    try {
      const response = await authService.resendOtp(email);
      showToast(response.message || 'Verification OTP resent to your email.', 'success');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to resend OTP.';
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // =================== Handle Forgot Password ===================
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authService.forgotPassword(email);
      showToast(response.message || 'Reset password OTP sent to your email.', 'success');
      setView('reset-password');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Forgot password request failed.';
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // =================== Handle Reset Password ===================
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      showToast('New password must be at least 8 characters.', 'error');
      return;
    }

    setLoading(true);
    try {
      // Backend expects field name "otpCode", NOT "otp"
      const response = await authService.resetPassword({
        email,
        otpCode: resetOtp,
        newPassword
      });
      showToast(response.message || 'Password reset successfully! You can now log in.', 'success');
      setView('login');
      setLoginPassword('');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to reset password.';
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // =================== Divider Component ===================
  const OrDivider = () => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      margin: '1.25rem 0'
    }}>
      <div style={{ flex: 1, height: '1px', background: 'var(--border-muted)' }} />
      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>OR</span>
      <div style={{ flex: 1, height: '1px', background: 'var(--border-muted)' }} />
    </div>
  );

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem 1.5rem',
      position: 'relative'
    }}>
      <div className="hero-glow" style={{ top: '20%', left: '50%', transform: 'translateX(-50%)' }} />

      <div className="glass-card animate-fade-in" style={{
        maxWidth: '450px',
        width: '100%',
        padding: '2.5rem',
        boxShadow: '0 15px 35px rgba(0,0,0,0.5)',
        border: '1px solid var(--border-muted)',
      }}>
        {/* BRAND */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
            IT<span style={{ color: 'var(--primary)' }}>Job</span>Hub
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {view === 'login' && 'Sign in to access your tech profile'}
            {view === 'register' && 'Create your account to start applying'}
            {view === 'verify-otp' && 'Verify your account using OTP'}
            {view === 'forgot-password' && 'Enter your email to request an OTP'}
            {view === 'reset-password' && 'Reset your login password'}
          </p>
        </div>

        {/* ================= LOGIN VIEW ================= */}
        {view === 'login' && (
          <>
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    required
                    className="form-input"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                    disabled={loading}
                  />
                  <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>Password</label>
                  <button
                    type="button"
                    onClick={() => setView('forgot-password')}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 500 }}
                  >
                    Forgot Password?
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    required
                    className="form-input"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                    disabled={loading}
                  />
                  <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', display: 'flex', justifyContent: 'center' }} disabled={loading}>
                {loading ? <Loader2 style={{ animation: 'spin 1s linear infinite' }} size={18} /> : 'Sign In'}
              </button>
            </form>

            {/* Google Login */}
            <OrDivider />
            {googleLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '0.75rem' }}>
                <Loader2 style={{ animation: 'spin 1s linear infinite' }} size={18} />
              </div>
            ) : (
              <div
                ref={googleBtnLoginRef}
                style={{ display: 'flex', justifyContent: 'center', width: '100%' }}
              />
            )}

            <p style={{ textAlign: 'center', fontSize: '0.875rem', marginTop: '1.5rem', color: 'var(--text-muted)' }}>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setView('register')}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, fontSize: 'inherit' }}
              >
                Sign Up
              </button>
            </p>
          </>
        )}

        {/* ================= REGISTER VIEW ================= */}
        {view === 'register' && (
          <>
            <form onSubmit={handleRegisterSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="Jane Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                    disabled={loading}
                  />
                  <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    required
                    className="form-input"
                    placeholder="jane@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                    disabled={loading}
                  />
                  <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    required
                    minLength={8}
                    className="form-input"
                    placeholder="Minimum 8 characters"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                    disabled={loading}
                  />
                  <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Account Role</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setRole('CANDIDATE')}
                    className="btn"
                    style={{
                      backgroundColor: role === 'CANDIDATE' ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                      border: role === 'CANDIDATE' ? '1px solid var(--primary)' : '1px solid var(--border-muted)',
                      color: role === 'CANDIDATE' ? 'var(--primary)' : 'var(--text-secondary)'
                    }}
                    disabled={loading}
                  >
                    Candidate
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('EMPLOYER')}
                    className="btn"
                    style={{
                      backgroundColor: role === 'EMPLOYER' ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                      border: role === 'EMPLOYER' ? '1px solid var(--primary)' : '1px solid var(--border-muted)',
                      color: role === 'EMPLOYER' ? 'var(--primary)' : 'var(--text-secondary)'
                    }}
                    disabled={loading}
                  >
                    Employer
                  </button>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', display: 'flex', justifyContent: 'center' }} disabled={loading}>
                {loading ? <Loader2 style={{ animation: 'spin 1s linear infinite' }} size={18} /> : 'Create Account'}
              </button>
            </form>

            {/* Google Sign Up */}
            <OrDivider />
            {googleLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '0.75rem' }}>
                <Loader2 style={{ animation: 'spin 1s linear infinite' }} size={18} />
              </div>
            ) : (
              <div
                ref={googleBtnRegisterRef}
                style={{ display: 'flex', justifyContent: 'center', width: '100%' }}
              />
            )}

            <p style={{ textAlign: 'center', fontSize: '0.875rem', marginTop: '1.5rem', color: 'var(--text-muted)' }}>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setView('login')}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, fontSize: 'inherit' }}
              >
                Sign In
              </button>
            </p>
          </>
        )}

        {/* ================= VERIFY OTP VIEW ================= */}
        {view === 'verify-otp' && (
          <form onSubmit={handleVerifyOtpSubmit}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', textAlign: 'center' }}>
              We sent a verification code to <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>. Enter it below.
            </p>

            <div className="form-group">
              <label className="form-label">One-Time Password (OTP)</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  maxLength={6}
                  className="form-input"
                  placeholder="e.g. 123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  style={{ paddingLeft: '2.5rem', letterSpacing: '0.25em', textAlign: 'center' }}
                  disabled={loading}
                />
                <ShieldCheck size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', display: 'flex', justifyContent: 'center' }} disabled={loading}>
              {loading ? <Loader2 style={{ animation: 'spin 1s linear infinite' }} size={18} /> : 'Verify & Log In'}
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', fontSize: '0.85rem' }}>
              <button
                type="button"
                onClick={() => setView('login')}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              >
                <ArrowLeft size={14} /> Back to Sign In
              </button>
              <button
                type="button"
                onClick={handleResendOtp}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}
                disabled={loading}
              >
                Resend OTP
              </button>
            </div>
          </form>
        )}

        {/* ================= FORGOT PASSWORD VIEW ================= */}
        {view === 'forgot-password' && (
          <form onSubmit={handleForgotPasswordSubmit}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', textAlign: 'center' }}>
              Enter your registered email address. We will send you an OTP to reset your password.
            </p>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  required
                  className="form-input"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                  disabled={loading}
                />
                <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', display: 'flex', justifyContent: 'center' }} disabled={loading}>
              {loading ? <Loader2 style={{ animation: 'spin 1s linear infinite' }} size={18} /> : 'Request Reset OTP'}
            </button>

            <button
              type="button"
              onClick={() => setView('login')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                margin: '1.5rem auto 0 auto',
                fontSize: '0.85rem'
              }}
            >
              <ArrowLeft size={14} /> Back to Sign In
            </button>
          </form>
        )}

        {/* ================= RESET PASSWORD VIEW ================= */}
        {view === 'reset-password' && (
          <form onSubmit={handleResetPasswordSubmit}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', textAlign: 'center' }}>
              Enter the OTP code received and configure a new password for your account.
            </p>

            <div className="form-group">
              <label className="form-label">Verification OTP</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  maxLength={6}
                  className="form-input"
                  placeholder="e.g. 123456"
                  value={resetOtp}
                  onChange={(e) => setResetOtp(e.target.value)}
                  style={{ paddingLeft: '2.5rem', textAlign: 'center', letterSpacing: '0.15em' }}
                  disabled={loading}
                />
                <ShieldCheck size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  required
                  minLength={8}
                  className="form-input"
                  placeholder="Minimum 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                  disabled={loading}
                />
                <KeyRound size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', display: 'flex', justifyContent: 'center' }} disabled={loading}>
              {loading ? <Loader2 style={{ animation: 'spin 1s linear infinite' }} size={18} /> : 'Reset Password'}
            </button>

            <button
              type="button"
              onClick={() => setView('login')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                margin: '1.5rem auto 0 auto',
                fontSize: '0.85rem'
              }}
            >
              <ArrowLeft size={14} /> Back to Sign In
            </button>
          </form>
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

export default AuthPage;
