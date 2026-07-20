import React, { useState } from 'react';
import { Lock, Key, ShieldCheck, CheckCircle2, Eye, EyeOff, RefreshCw, Globe } from 'lucide-react';
import { profileService } from '../services/api';

// Xác định tài khoản Google dựa trên user object từ localStorage
// authProvider được lưu vào localStorage ngay khi đăng nhập/đăng ký thành công
function SecuritySection({ user, showToast }) {
  const isGoogleAccount = user?.authProvider === 'GOOGLE';

  const [loading, setLoading] = useState(false);
  const [showOldPw, setShowOldPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const [form, setForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const hasMinLength = form.newPassword.length >= 6;
  const passwordsMatch = form.newPassword !== '' && form.newPassword === form.confirmPassword;

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!hasMinLength) {
      showToast('Mật khẩu mới phải có ít nhất 6 ký tự.', 'error');
      return;
    }
    if (!passwordsMatch) {
      showToast('Xác nhận mật khẩu không khớp.', 'error');
      return;
    }

    try {
      setLoading(true);
      await profileService.changePassword({
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
      });
      showToast('Đổi mật khẩu thành công! Hãy dùng mật khẩu mới lần sau khi đăng nhập.', 'success');
      setForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      const msg = error.response?.data?.message || 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu cũ.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* Header banner */}
      <div className="glass-card" style={{
        padding: '2rem 2.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        flexWrap: 'wrap',
        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(139, 92, 246, 0.06) 100%)',
        border: '1px solid var(--border-glow)'
      }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '16px', flexShrink: 0,
          backgroundColor: 'rgba(139, 92, 246, 0.15)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {isGoogleAccount
            ? <Globe size={32} color="var(--secondary)" />
            : <ShieldCheck size={32} color="var(--primary)" />
          }
        </div>
        <div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Account Security & Protection</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginTop: '0.25rem' }}>
            Phương thức đăng nhập:{' '}
            <span style={{ color: isGoogleAccount ? 'var(--secondary)' : 'var(--text-primary)', fontWeight: 700 }}>
              {isGoogleAccount
                ? 'Google Sign-In (Gmail / OAuth 2.0)'
                : 'Email & Password (Bcrypt Encrypted)'}
            </span>
          </p>
        </div>
      </div>

      {/* Google account — ẩn hoàn toàn form đổi mật khẩu */}
      {isGoogleAccount ? (
        <div className="glass-card animate-fade-in" style={{
          padding: '3.5rem 2.5rem',
          textAlign: 'center',
          maxWidth: '650px',
          margin: '0 auto',
          width: '100%',
          border: '1px solid rgba(6, 182, 212, 0.3)'
        }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            backgroundColor: 'rgba(6, 182, 212, 0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem auto',
            boxShadow: '0 0 30px rgba(6, 182, 212, 0.25)'
          }}>
            <Globe size={42} color="var(--secondary)" />
          </div>

          <h3 style={{ fontSize: '1.6rem', marginBottom: '0.75rem', fontWeight: 700 }}>
            Tài khoản đăng nhập qua Google
          </h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto', lineHeight: 1.7, fontSize: '1rem' }}>
            Bạn đang dùng <strong style={{ color: 'var(--text-primary)' }}>{user?.email}</strong> để đăng nhập qua Google OAuth 2.0.
            Mật khẩu và bảo mật tài khoản được quản lý hoàn toàn bởi Google.
          </p>

          <div style={{
            marginTop: '2rem',
            padding: '0.85rem 1.5rem',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: '10px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.6rem',
            color: '#34d399',
            fontSize: '0.95rem',
            fontWeight: 600
          }}>
            <CheckCircle2 size={18} />
            Không cần và không thể đổi mật khẩu tại đây.
          </div>
        </div>
      ) : (
        /* Local account — hiện form đổi mật khẩu */
        <div className="glass-card animate-fade-in" style={{
          padding: '2.5rem',
          maxWidth: '650px',
          margin: '0 auto',
          width: '100%'
        }}>
          <h3 style={{
            fontSize: '1.35rem', marginBottom: '1.5rem',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            borderBottom: '1px solid var(--border-muted)', paddingBottom: '1rem'
          }}>
            <Key size={20} color="var(--primary)" />
            Đổi mật khẩu tài khoản
          </h3>

          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>

            {/* Mật khẩu cũ */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Mật khẩu hiện tại</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showOldPw ? 'text' : 'password'}
                  required
                  className="form-input"
                  placeholder="Nhập mật khẩu hiện tại"
                  value={form.oldPassword}
                  onChange={e => setForm({ ...form, oldPassword: e.target.value })}
                  style={{ paddingRight: '2.75rem' }}
                />
                <button type="button" onClick={() => setShowOldPw(!showOldPw)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  {showOldPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Mật khẩu mới */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Mật khẩu mới</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNewPw ? 'text' : 'password'}
                  required
                  className="form-input"
                  placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                  value={form.newPassword}
                  onChange={e => setForm({ ...form, newPassword: e.target.value })}
                  style={{ paddingRight: '2.75rem' }}
                />
                <button type="button" onClick={() => setShowNewPw(!showNewPw)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  {showNewPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Xác nhận mật khẩu */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Xác nhận mật khẩu mới</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPw ? 'text' : 'password'}
                  required
                  className="form-input"
                  placeholder="Nhập lại mật khẩu mới"
                  value={form.confirmPassword}
                  onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                  style={{ paddingRight: '2.75rem' }}
                />
                <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  {showConfirmPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Live checklist */}
            {form.newPassword && (
              <div style={{
                padding: '0.9rem 1rem', borderRadius: '8px',
                backgroundColor: 'rgba(0,0,0,0.25)',
                border: '1px solid var(--border-muted)',
                display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.85rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: hasMinLength ? 'var(--success)' : 'var(--text-muted)' }}>
                  <CheckCircle2 size={15} /> Tối thiểu 6 ký tự
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: passwordsMatch ? 'var(--success)' : 'var(--text-muted)' }}>
                  <CheckCircle2 size={15} /> Mật khẩu xác nhận khớp
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !hasMinLength || !passwordsMatch}
              className="btn btn-primary"
              style={{ marginTop: '0.5rem', padding: '0.85rem' }}
            >
              {loading
                ? <><RefreshCw size={18} className="animate-spin" /> Đang cập nhật...</>
                : <><Lock size={18} /> Đổi mật khẩu ngay</>
              }
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default SecuritySection;
