import React, { useState, useEffect } from 'react';
import {
  Search, Filter, Lock, Unlock, Trash2, Key,
  User, Briefcase, Shield, RefreshCw, ChevronDown, X, Check
} from 'lucide-react';
import { adminService } from '../../services/api';

const ROLES    = ['', 'CANDIDATE', 'EMPLOYER', 'ADMIN'];
const STATUSES = ['', 'ACTIVE', 'LOCKED', 'DELETED', 'PENDING_VERIFICATION'];

const STATUS_META = {
  ACTIVE:               { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',  label: 'Hoạt động' },
  LOCKED:               { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  label: 'Bị khóa' },
  DELETED:              { color: '#6b7280', bg: 'rgba(107,114,128,0.1)',label: 'Đã xóa' },
  PENDING_VERIFICATION: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'Chờ xác thực' },
};

const ROLE_META = {
  CANDIDATE: { color: '#6366f1', icon: User },
  EMPLOYER:  { color: '#22c55e', icon: Briefcase },
  ADMIN:     { color: '#f59e0b', icon: Shield },
};

export default function UserManagement({ showToast }) {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(false);
  const [roleFilter, setRoleFilter]     = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch]     = useState('');
  const [modal, setModal]       = useState(null); // { type: 'reset'|'status'|'delete', user }
  const [newPwd, setNewPwd]     = useState('');
  const [newStatus, setNewStatus]   = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllUsers(roleFilter || undefined, statusFilter || undefined);
      setUsers(data);
    } catch {
      showToast('Không thể tải danh sách người dùng.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [roleFilter, statusFilter]);

  const filteredUsers = users.filter(u =>
    !search || u.email?.toLowerCase().includes(search.toLowerCase())
      || u.fullName?.toLowerCase().includes(search.toLowerCase())
      || u.companyName?.toLowerCase().includes(search.toLowerCase())
  );

  const handleStatusUpdate = async () => {
    if (!newStatus) { showToast('Vui lòng chọn trạng thái.', 'error'); return; }
    try {
      setSubmitting(true);
      await adminService.updateUserStatus(modal.user.userId, newStatus);
      showToast('Cập nhật trạng thái thành công.', 'success');
      setModal(null);
      fetchUsers();
    } catch (e) {
      showToast(e?.response?.data?.message || 'Lỗi cập nhật trạng thái.', 'error');
    } finally { setSubmitting(false); }
  };

  const handleResetPassword = async () => {
    if (!newPwd || newPwd.length < 6) { showToast('Mật khẩu phải ít nhất 6 ký tự.', 'error'); return; }
    try {
      setSubmitting(true);
      await adminService.adminResetPassword(modal.user.userId, newPwd);
      showToast('Đặt lại mật khẩu thành công.', 'success');
      setModal(null);
      setNewPwd('');
    } catch (e) {
      showToast(e?.response?.data?.message || 'Lỗi đặt lại mật khẩu.', 'error');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    try {
      setSubmitting(true);
      await adminService.deleteUser(modal.user.userId);
      showToast('Đã đánh dấu xóa tài khoản.', 'success');
      setModal(null);
      fetchUsers();
    } catch (e) {
      showToast(e?.response?.data?.message || 'Lỗi xóa tài khoản.', 'error');
    } finally { setSubmitting(false); }
  };

  const s = (style) => ({ ...style });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Filter bar ── */}
      <div style={{
        background: 'linear-gradient(135deg,#0d1530,#0f1b38)',
        border: '1px solid rgba(99,102,241,0.15)', borderRadius: 14, padding: '18px 20px',
        display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center',
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
          <input
            placeholder="Tìm theo email, tên..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '9px 12px 9px 36px', background: 'rgba(99,102,241,0.07)',
              border: '1px solid rgba(99,102,241,0.15)', borderRadius: 9, color: '#e2e8f0',
              fontSize: 13, outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Role filter */}
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={selectStyle}>
          <option value="">Tất cả vai trò</option>
          {ROLES.filter(Boolean).map(r => <option key={r} value={r}>{r}</option>)}
        </select>

        {/* Status filter */}
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={selectStyle}>
          <option value="">Tất cả trạng thái</option>
          {STATUSES.filter(Boolean).map(s => <option key={s} value={s}>{STATUS_META[s]?.label || s}</option>)}
        </select>

        <button onClick={fetchUsers} style={btnSecondary}>
          <RefreshCw size={14} /> Làm mới
        </button>
      </div>

      {/* ── Summary bar ── */}
      <div style={{ color: '#64748b', fontSize: 13 }}>
        Hiển thị <strong style={{ color: '#a5b4fc' }}>{filteredUsers.length}</strong> / {users.length} người dùng
      </div>

      {/* ── Table ── */}
      <div style={{
        background: 'linear-gradient(135deg,#0d1530,#0f1b38)',
        border: '1px solid rgba(99,102,241,0.15)', borderRadius: 14, overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#6366f1' }}>
            <RefreshCw size={28} style={{ animation: 'spin 1s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.15)', background: 'rgba(99,102,241,0.05)' }}>
                  {['ID', 'Email', 'Tên / Công ty', 'Vai trò', 'Trạng thái', 'Ngày đăng ký', 'Thao tác'].map(h => (
                    <th key={h} style={{ color: '#64748b', padding: '12px 16px', textAlign: 'left', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#475569' }}>Không tìm thấy người dùng</td>
                  </tr>
                ) : filteredUsers.map(u => {
                  const st = STATUS_META[u.accountStatus] || { color: '#fff', bg: 'rgba(255,255,255,0.1)', label: u.accountStatus };
                  const rm = ROLE_META[u.role] || { color: '#a5b4fc', icon: User };
                  const RIcon = rm.icon;
                  return (
                    <tr key={u.userId} style={{ borderBottom: '1px solid rgba(99,102,241,0.07)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.04)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '12px 16px', color: '#475569' }}>#{u.userId}</td>
                      <td style={{ padding: '12px 16px', color: '#cbd5e1', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {u.email}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#94a3b8' }}>
                        {u.fullName || u.companyName || <span style={{ color: '#475569', fontStyle: 'italic' }}>–</span>}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          background: `${rm.color}15`, color: rm.color,
                          padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                        }}>
                          <RIcon size={11} /> {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          background: st.bg, color: st.color,
                          padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                        }}>
                          {st.label}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#475569', whiteSpace: 'nowrap' }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : '–'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <ActionBtn onClick={() => { setModal({ type: 'status', user: u }); setNewStatus(u.accountStatus); }}
                            title="Đổi trạng thái" color="#6366f1">
                            {u.accountStatus === 'LOCKED' ? <Unlock size={14} /> : <Lock size={14} />}
                          </ActionBtn>
                          <ActionBtn onClick={() => { setModal({ type: 'reset', user: u }); setNewPwd(''); }}
                            title="Đặt lại mật khẩu" color="#f59e0b">
                            <Key size={14} />
                          </ActionBtn>
                          <ActionBtn onClick={() => setModal({ type: 'delete', user: u })}
                            title="Xóa tài khoản" color="#ef4444">
                            <Trash2 size={14} />
                          </ActionBtn>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {modal && (
        <div style={modalOverlay} onClick={() => setModal(null)}>
          <div style={modalBox} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ color: '#e2e8f0', margin: 0, fontSize: 17 }}>
                {modal.type === 'reset'  && '🔑 Đặt lại mật khẩu'}
                {modal.type === 'status' && '🔒 Đổi trạng thái tài khoản'}
                {modal.type === 'delete' && '🗑️ Xóa tài khoản'}
              </h3>
              <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 18 }}>
              Người dùng: <strong style={{ color: '#e2e8f0' }}>{modal.user.email}</strong>
            </div>

            {modal.type === 'status' && (
              <div>
                <label style={labelStyle}>Trạng thái mới</label>
                <select value={newStatus} onChange={e => setNewStatus(e.target.value)} style={{ ...selectStyle, width: '100%', marginBottom: 20 }}>
                  {STATUSES.filter(Boolean).map(s => <option key={s} value={s}>{STATUS_META[s]?.label || s}</option>)}
                </select>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button onClick={() => setModal(null)} style={btnSecondary}>Hủy</button>
                  <button onClick={handleStatusUpdate} disabled={submitting} style={btnPrimary('#6366f1')}>
                    {submitting ? 'Đang lưu...' : 'Xác nhận'}
                  </button>
                </div>
              </div>
            )}

            {modal.type === 'reset' && (
              <div>
                <label style={labelStyle}>Mật khẩu mới (tối thiểu 6 ký tự)</label>
                <input
                  type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)}
                  placeholder="Nhập mật khẩu mới..."
                  style={{ ...inputStyle, marginBottom: 20 }}
                />
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button onClick={() => setModal(null)} style={btnSecondary}>Hủy</button>
                  <button onClick={handleResetPassword} disabled={submitting} style={btnPrimary('#f59e0b')}>
                    {submitting ? 'Đang lưu...' : 'Đặt lại mật khẩu'}
                  </button>
                </div>
              </div>
            )}

            {modal.type === 'delete' && (
              <div>
                <div style={{
                  background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                  borderRadius: 10, padding: '14px 16px', marginBottom: 20,
                  color: '#fca5a5', fontSize: 13,
                }}>
                  ⚠️ Hành động này sẽ đánh dấu tài khoản là <strong>ĐÃ XÓA</strong>. Người dùng sẽ không thể đăng nhập.
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button onClick={() => setModal(null)} style={btnSecondary}>Hủy</button>
                  <button onClick={handleDelete} disabled={submitting} style={btnPrimary('#ef4444')}>
                    {submitting ? 'Đang xử lý...' : 'Xác nhận xóa'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Shared micro-components ──
const ActionBtn = ({ children, onClick, title, color }) => (
  <button onClick={onClick} title={title} style={{
    background: `${color}12`, border: `1px solid ${color}30`,
    color: color, padding: '5px 7px', borderRadius: 7, cursor: 'pointer',
    display: 'flex', alignItems: 'center', transition: 'all 0.15s',
  }}
    onMouseEnter={e => e.currentTarget.style.background = `${color}22`}
    onMouseLeave={e => e.currentTarget.style.background = `${color}12`}
  >{children}</button>
);

const selectStyle = {
  background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.2)',
  color: '#94a3b8', padding: '9px 14px', borderRadius: 9, fontSize: 13,
  outline: 'none', cursor: 'pointer',
};

const inputStyle = {
  width: '100%', padding: '10px 14px', background: 'rgba(99,102,241,0.07)',
  border: '1px solid rgba(99,102,241,0.2)', borderRadius: 9,
  color: '#e2e8f0', fontSize: 13, outline: 'none', boxSizing: 'border-box',
};

const labelStyle = { display: 'block', color: '#94a3b8', fontSize: 12, marginBottom: 8, fontWeight: 500 };

const btnSecondary = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
  color: '#a5b4fc', padding: '8px 16px', borderRadius: 9, cursor: 'pointer', fontSize: 13,
};

const btnPrimary = (color) => ({
  background: `linear-gradient(135deg, ${color}, ${color}cc)`,
  border: 'none', color: '#fff', padding: '8px 18px',
  borderRadius: 9, cursor: 'pointer', fontSize: 13, fontWeight: 600,
});

const modalOverlay = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 9999, backdropFilter: 'blur(4px)',
};

const modalBox = {
  background: 'linear-gradient(135deg,#0d1530,#111827)', width: '90%', maxWidth: 460,
  borderRadius: 16, padding: '28px', border: '1px solid rgba(99,102,241,0.2)',
  boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
};
