import React, { useState, useEffect } from 'react';
import {
  Package, Settings, Plus, Edit2, Trash2, Save,
  X, RefreshCw, Check, DollarSign, Calendar
} from 'lucide-react';
import { adminService } from '../../services/api';

const TABS = [
  { id: 'packages', label: 'Gói dịch vụ', icon: Package },
  { id: 'config',   label: 'Cấu hình hệ thống', icon: Settings },
];

const emptyPkg = { packageName: '', price: '', durationDays: 30, features: '[]', status: 'ACTIVE' };

export default function SystemConfig({ showToast }) {
  const [tab, setTab]           = useState('packages');
  const [packages, setPackages] = useState([]);
  const [configs, setConfigs]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [pkgModal, setPkgModal] = useState(null); // null | 'new' | {pkg object}
  const [pkgForm, setPkgForm]   = useState(emptyPkg);
  const [submitting, setSubmitting] = useState(false);
  const [editConfigId, setEditConfigId] = useState(null);
  const [editConfigVal, setEditConfigVal] = useState('');
  const [newConfigName, setNewConfigName]   = useState('');
  const [newConfigValue, setNewConfigValue] = useState('');
  const [showNewConfig, setShowNewConfig]   = useState(false);

  const fetchPackages = async () => {
    try { setLoading(true); setPackages(await adminService.getAllPackages()); }
    catch { showToast('Lỗi tải gói dịch vụ.', 'error'); }
    finally { setLoading(false); }
  };

  const fetchConfigs = async () => {
    try { setLoading(true); setConfigs(await adminService.getAllConfigs()); }
    catch { showToast('Lỗi tải cấu hình hệ thống.', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (tab === 'packages') fetchPackages();
    else fetchConfigs();
  }, [tab]);

  // Parse features JSON string to array for display
  const parseFeatures = (s) => {
    try { return JSON.parse(s || '[]'); }
    catch { return []; }
  };

  const handlePkgSubmit = async () => {
    if (!pkgForm.packageName || !pkgForm.price) {
      showToast('Vui lòng điền đầy đủ tên và giá gói.', 'error'); return;
    }
    try {
      setSubmitting(true);
      const data = {
        ...pkgForm,
        price: parseFloat(pkgForm.price),
        durationDays: parseInt(pkgForm.durationDays, 10),
      };
      if (pkgModal === 'new') {
        await adminService.createPackage(data);
        showToast('Tạo gói dịch vụ thành công.', 'success');
      } else {
        await adminService.updatePackage(pkgModal.packageId, data);
        showToast('Cập nhật gói dịch vụ thành công.', 'success');
      }
      setPkgModal(null);
      fetchPackages();
    } catch (e) {
      showToast(e?.response?.data?.message || 'Lỗi lưu gói dịch vụ.', 'error');
    } finally { setSubmitting(false); }
  };

  const handleDeletePkg = async (id) => {
    if (!window.confirm('Vô hiệu hóa gói dịch vụ này?')) return;
    try {
      await adminService.deletePackage(id);
      showToast('Đã vô hiệu hóa gói.', 'success');
      fetchPackages();
    } catch { showToast('Lỗi xóa gói.', 'error'); }
  };

  const handleSaveConfig = async (configName) => {
    try {
      await adminService.upsertConfig(configName, editConfigVal);
      showToast('Đã lưu cấu hình.', 'success');
      setEditConfigId(null);
      fetchConfigs();
    } catch { showToast('Lỗi lưu cấu hình.', 'error'); }
  };

  const handleAddConfig = async () => {
    if (!newConfigName.trim() || !newConfigValue.trim()) {
      showToast('Vui lòng nhập tên và giá trị cấu hình.', 'error'); return;
    }
    try {
      await adminService.upsertConfig(newConfigName, newConfigValue);
      showToast('Đã thêm cấu hình mới.', 'success');
      setNewConfigName(''); setNewConfigValue(''); setShowNewConfig(false);
      fetchConfigs();
    } catch { showToast('Lỗi thêm cấu hình.', 'error'); }
  };

  const openEditPkg = (pkg) => {
    setPkgForm({
      packageName: pkg.packageName,
      price: String(pkg.price),
      durationDays: pkg.durationDays,
      features: pkg.features || '[]',
      status: pkg.status,
    });
    setPkgModal(pkg);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'rgba(99,102,241,0.06)', padding: 4, borderRadius: 12, width: 'fit-content' }}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '9px 18px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
            background: tab === id ? 'linear-gradient(135deg,rgba(99,102,241,0.3),rgba(139,92,246,0.25))' : 'transparent',
            color: tab === id ? '#a5b4fc' : '#64748b',
            border: tab === id ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
          }}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* ── Packages Tab ── */}
      {tab === 'packages' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button onClick={fetchPackages} style={btnSecondary}><RefreshCw size={14} /> Làm mới</button>
            <button onClick={() => { setPkgForm(emptyPkg); setPkgModal('new'); }} style={btnPrimary('#6366f1')}>
              <Plus size={14} /> Tạo gói mới
            </button>
          </div>

          {loading ? (
            <Loader />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              {packages.map(pkg => {
                const features = parseFeatures(pkg.features);
                return (
                  <div key={pkg.packageId} style={{
                    background: 'linear-gradient(135deg,#0d1530,#0f1b38)',
                    border: pkg.status === 'ACTIVE' ? '1px solid rgba(99,102,241,0.25)' : '1px solid rgba(107,114,128,0.2)',
                    borderRadius: 14, padding: '20px 22px', position: 'relative',
                  }}>
                    {/* Status badge */}
                    <span style={{
                      position: 'absolute', top: 14, right: 14,
                      background: pkg.status === 'ACTIVE' ? 'rgba(34,197,94,0.12)' : 'rgba(107,114,128,0.12)',
                      color: pkg.status === 'ACTIVE' ? '#22c55e' : '#6b7280',
                      padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                    }}>
                      {pkg.status === 'ACTIVE' ? 'Đang hoạt động' : 'Vô hiệu'}
                    </span>

                    <h3 style={{ color: '#e2e8f0', fontSize: 17, fontWeight: 700, margin: '0 0 8px' }}>{pkg.packageName}</h3>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 14 }}>
                      <span style={{ color: '#6366f1', fontSize: 24, fontWeight: 800 }}>
                        {Number(pkg.price).toLocaleString('vi-VN')}
                      </span>
                      <span style={{ color: '#475569', fontSize: 13 }}>₫ / {pkg.durationDays} ngày</span>
                    </div>

                    <ul style={{ margin: '0 0 18px', padding: '0 0 0 16px', color: '#94a3b8', fontSize: 13, lineHeight: 1.9 }}>
                      {features.length > 0
                        ? features.map((f, i) => <li key={i}>{f}</li>)
                        : <li style={{ color: '#475569' }}>Chưa có tính năng</li>
                      }
                    </ul>

                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => openEditPkg(pkg)} style={{ ...btnSecondary, flex: 1 }}>
                        <Edit2 size={13} /> Sửa
                      </button>
                      <button onClick={() => handleDeletePkg(pkg.packageId)} style={{
                        ...btnSecondary, flex: 1, color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)',
                      }}>
                        <Trash2 size={13} /> Vô hiệu
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Config Tab ── */}
      {tab === 'config' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button onClick={fetchConfigs} style={btnSecondary}><RefreshCw size={14} /> Làm mới</button>
            <button onClick={() => setShowNewConfig(p => !p)} style={btnPrimary('#6366f1')}>
              <Plus size={14} /> Thêm cấu hình
            </button>
          </div>

          {showNewConfig && (
            <div style={{
              background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: 12, padding: '18px 20px', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end',
            }}>
              <div style={{ flex: 1, minWidth: 160 }}>
                <label style={labelStyle}>Tên cấu hình (key)</label>
                <input value={newConfigName} onChange={e => setNewConfigName(e.target.value)}
                  placeholder="vd: site_title" style={inputStyle} />
              </div>
              <div style={{ flex: 2, minWidth: 200 }}>
                <label style={labelStyle}>Giá trị</label>
                <input value={newConfigValue} onChange={e => setNewConfigValue(e.target.value)}
                  placeholder="Giá trị cấu hình" style={inputStyle} />
              </div>
              <button onClick={handleAddConfig} style={btnPrimary('#22c55e')}>
                <Check size={14} /> Lưu
              </button>
              <button onClick={() => setShowNewConfig(false)} style={btnSecondary}>
                <X size={14} />
              </button>
            </div>
          )}

          {loading ? <Loader /> : (
            <div style={{
              background: 'linear-gradient(135deg,#0d1530,#0f1b38)',
              border: '1px solid rgba(99,102,241,0.15)', borderRadius: 14, overflow: 'hidden',
            }}>
              {configs.length === 0 ? (
                <div style={{ padding: '60px', textAlign: 'center', color: '#475569' }}>
                  Chưa có cấu hình nào. Thêm cấu hình đầu tiên!
                </div>
              ) : configs.map((cfg, i) => (
                <div key={cfg.configId} style={{
                  padding: '14px 20px',
                  borderBottom: i < configs.length - 1 ? '1px solid rgba(99,102,241,0.07)' : 'none',
                  display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
                }}>
                  <div style={{ minWidth: 180 }}>
                    <div style={{ color: '#a5b4fc', fontSize: 13, fontWeight: 600, fontFamily: 'monospace' }}>{cfg.configName}</div>
                    <div style={{ color: '#475569', fontSize: 11, marginTop: 2 }}>
                      Cập nhật: {cfg.lastUpdated ? new Date(cfg.lastUpdated).toLocaleString('vi-VN') : '–'}
                    </div>
                  </div>

                  {editConfigId === cfg.configId ? (
                    <div style={{ flex: 1, display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input
                        value={editConfigVal} onChange={e => setEditConfigVal(e.target.value)}
                        style={{ ...inputStyle, flex: 1 }}
                        autoFocus
                      />
                      <button onClick={() => handleSaveConfig(cfg.configName)} style={btnPrimary('#22c55e')}>
                        <Check size={14} />
                      </button>
                      <button onClick={() => setEditConfigId(null)} style={btnSecondary}>
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{
                        flex: 1, color: '#e2e8f0', fontSize: 13,
                        background: 'rgba(99,102,241,0.06)', padding: '6px 12px', borderRadius: 7,
                        fontFamily: 'monospace',
                      }}>
                        {cfg.configValue}
                      </span>
                      <button
                        onClick={() => { setEditConfigId(cfg.configId); setEditConfigVal(cfg.configValue); }}
                        style={{ ...btnSecondary, padding: '6px 10px' }}
                      >
                        <Edit2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Package Modal ── */}
      {pkgModal !== null && (
        <div style={modalOverlay} onClick={() => setPkgModal(null)}>
          <div style={{ ...modalBox, maxWidth: 520 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
              <h3 style={{ color: '#e2e8f0', margin: 0, fontSize: 17 }}>
                {pkgModal === 'new' ? '📦 Tạo gói dịch vụ mới' : '✏️ Chỉnh sửa gói dịch vụ'}
              </h3>
              <button onClick={() => setPkgModal(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <FormField label="Tên gói">
                <input value={pkgForm.packageName} onChange={e => setPkgForm(p => ({ ...p, packageName: e.target.value }))}
                  placeholder="vd: Gói VIP" style={inputStyle} />
              </FormField>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <FormField label="Giá (VND)">
                  <input type="number" value={pkgForm.price} onChange={e => setPkgForm(p => ({ ...p, price: e.target.value }))}
                    placeholder="0" style={inputStyle} />
                </FormField>
                <FormField label="Thời hạn (ngày)">
                  <input type="number" value={pkgForm.durationDays} onChange={e => setPkgForm(p => ({ ...p, durationDays: e.target.value }))}
                    placeholder="30" style={inputStyle} />
                </FormField>
              </div>

              <FormField label='Tính năng (JSON array, vd: ["Feature 1", "Feature 2"])'>
                <textarea value={pkgForm.features} onChange={e => setPkgForm(p => ({ ...p, features: e.target.value }))}
                  rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
              </FormField>

              <FormField label="Trạng thái">
                <select value={pkgForm.status} onChange={e => setPkgForm(p => ({ ...p, status: e.target.value }))} style={{ ...selectStyle, width: '100%' }}>
                  <option value="ACTIVE">Hoạt động</option>
                  <option value="INACTIVE">Vô hiệu</option>
                </select>
              </FormField>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 22 }}>
              <button onClick={() => setPkgModal(null)} style={btnSecondary}>Hủy</button>
              <button onClick={handlePkgSubmit} disabled={submitting} style={btnPrimary('#6366f1')}>
                <Save size={14} /> {submitting ? 'Đang lưu...' : 'Lưu gói'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Helpers ──
const FormField = ({ label, children }) => (
  <div>
    <label style={labelStyle}>{label}</label>
    {children}
  </div>
);

const Loader = () => (
  <div style={{ textAlign: 'center', padding: '60px', color: '#6366f1' }}>
    <RefreshCw size={28} style={{ animation: 'spin 1s linear infinite' }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

const selectStyle = {
  background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.2)',
  color: '#94a3b8', padding: '9px 14px', borderRadius: 9, fontSize: 13, outline: 'none', cursor: 'pointer',
};
const inputStyle = {
  width: '100%', padding: '10px 14px', background: 'rgba(99,102,241,0.07)',
  border: '1px solid rgba(99,102,241,0.2)', borderRadius: 9,
  color: '#e2e8f0', fontSize: 13, outline: 'none', boxSizing: 'border-box',
};
const labelStyle = { display: 'block', color: '#94a3b8', fontSize: 12, marginBottom: 6, fontWeight: 500 };
const btnSecondary = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
  color: '#a5b4fc', padding: '8px 14px', borderRadius: 9, cursor: 'pointer', fontSize: 13,
};
const btnPrimary = (color) => ({
  display: 'inline-flex', alignItems: 'center', gap: 6,
  background: `linear-gradient(135deg, ${color}, ${color}cc)`,
  border: 'none', color: '#fff', padding: '8px 16px',
  borderRadius: 9, cursor: 'pointer', fontSize: 13, fontWeight: 600,
});
const modalOverlay = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 9999, backdropFilter: 'blur(4px)',
};
const modalBox = {
  background: 'linear-gradient(135deg,#0d1530,#111827)', width: '90%', maxWidth: 480,
  borderRadius: 16, padding: '28px', border: '1px solid rgba(99,102,241,0.2)',
  boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
};
