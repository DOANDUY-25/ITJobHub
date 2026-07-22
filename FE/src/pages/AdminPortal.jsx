import React, { useState } from 'react';
import {
  LayoutDashboard, Users, FileText, Building2,
  Settings, BarChart2, Shield, ChevronRight,
  Menu, X, Package
} from 'lucide-react';
import AdminOverview from '../components/admin/AdminOverview';
import UserManagement from '../components/admin/UserManagement';
import ContentModeration from '../components/admin/ContentModeration';
import SystemConfig from '../components/admin/SystemConfig';
import ReportExport from '../components/admin/ReportExport';

const NAV_ITEMS = [
  { id: 'overview',    label: 'Tổng quan',        icon: LayoutDashboard,  desc: 'Dashboard & thống kê' },
  { id: 'users',       label: 'Người dùng',        icon: Users,            desc: 'Quản lý tài khoản' },
  { id: 'moderation',  label: 'Kiểm duyệt',        icon: Shield,           desc: 'Duyệt Job & Công ty' },
  { id: 'config',      label: 'Cấu hình hệ thống', icon: Settings,         desc: 'Gói dịch vụ & Config' },
  { id: 'reports',     label: 'Báo cáo',           icon: BarChart2,        desc: 'Xuất Excel' },
];

export default function AdminPortal({ user, showToast }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const ActiveComponent = () => {
    const props = { user, showToast };
    switch (activeTab) {
      case 'overview':   return <AdminOverview {...props} />;
      case 'users':      return <UserManagement {...props} />;
      case 'moderation': return <ContentModeration {...props} />;
      case 'config':     return <SystemConfig {...props} />;
      case 'reports':    return <ReportExport {...props} />;
      default:           return <AdminOverview {...props} />;
    }
  };

  const currentNav = NAV_ITEMS.find(n => n.id === activeTab);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0f1e', fontFamily: "'Inter', sans-serif" }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: sidebarOpen ? 260 : 72,
        background: 'linear-gradient(180deg, #0d1530 0%, #0a0f1e 100%)',
        borderRight: '1px solid rgba(99,102,241,0.15)',
        transition: 'width 0.3s ease',
        overflow: 'hidden',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
      }}>
        {/* Sidebar header */}
        <div style={{
          padding: '20px 16px',
          borderBottom: '1px solid rgba(99,102,241,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}>
          {sidebarOpen && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Shield size={18} color="#fff" />
              </div>
              <div>
                <div style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 14 }}>Admin Portal</div>
                <div style={{ color: '#6366f1', fontSize: 11 }}>ITJobHub Control</div>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(p => !p)}
            style={{
              background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
              color: '#a5b4fc', padding: '6px 8px', borderRadius: 8, cursor: 'pointer',
              display: 'flex', alignItems: 'center', flexShrink: 0,
            }}
          >
            {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>

        {/* Admin info pill */}
        {sidebarOpen && (
          <div style={{
            margin: '16px 12px',
            padding: '10px 14px',
            background: 'rgba(99,102,241,0.08)',
            borderRadius: 10,
            border: '1px solid rgba(99,102,241,0.15)',
          }}>
            <div style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 600 }}>{user?.email}</div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 4,
              background: 'rgba(99,102,241,0.2)', color: '#a5b4fc',
              padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600,
            }}>
              <Shield size={10} /> ADMINISTRATOR
            </div>
          </div>
        )}

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '8px 8px', overflowY: 'auto' }}>
          {NAV_ITEMS.map(({ id, label, icon: Icon, desc }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                title={!sidebarOpen ? label : undefined}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  width: '100%', padding: sidebarOpen ? '11px 14px' : '11px 18px',
                  marginBottom: 4,
                  background: active ? 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15))' : 'transparent',
                  border: active ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                  borderRadius: 10, cursor: 'pointer',
                  color: active ? '#a5b4fc' : '#64748b',
                  transition: 'all 0.2s',
                  textAlign: 'left',
                }}
                onMouseEnter={e => !active && (e.currentTarget.style.background = 'rgba(99,102,241,0.05)')}
                onMouseLeave={e => !active && (e.currentTarget.style.background = 'transparent')}
              >
                <Icon size={18} style={{ flexShrink: 0, color: active ? '#8b5cf6' : '#475569' }} />
                {sidebarOpen && (
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
                    <div style={{ fontSize: 11, color: active ? '#818cf8' : '#475569', marginTop: 1 }}>{desc}</div>
                  </div>
                )}
                {sidebarOpen && active && <ChevronRight size={14} style={{ color: '#6366f1', flexShrink: 0 }} />}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ── Main content ── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        {/* Top bar */}
        <header style={{
          padding: '20px 32px',
          borderBottom: '1px solid rgba(99,102,241,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(13,21,48,0.8)',
          backdropFilter: 'blur(12px)',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div>
            <h1 style={{ color: '#e2e8f0', fontSize: 22, fontWeight: 700, margin: 0 }}>
              {currentNav?.label}
            </h1>
            <p style={{ color: '#64748b', fontSize: 13, margin: '4px 0 0' }}>
              {currentNav?.desc}
            </p>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 14px', borderRadius: 20,
            background: 'rgba(99,102,241,0.1)',
            border: '1px solid rgba(99,102,241,0.2)',
            color: '#818cf8', fontSize: 12,
          }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%',
              background: '#22c55e', boxShadow: '0 0 6px #22c55e',
            }} />
            Hệ thống hoạt động bình thường
          </div>
        </header>

        <div style={{ flex: 1, padding: '28px 32px' }}>
          <ActiveComponent />
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0a0f1e; }
        ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.3); border-radius: 3px; }
      `}</style>
    </div>
  );
}
