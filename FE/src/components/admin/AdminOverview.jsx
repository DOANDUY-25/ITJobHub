import React, { useState, useEffect, useRef } from 'react';
import {
  Users, Briefcase, FileText, Building2, TrendingUp,
  DollarSign, Clock, CheckCircle, AlertCircle, RefreshCw
} from 'lucide-react';
import { adminService } from '../../services/api';

const StatCard = ({ icon: Icon, label, value, sub, color, gradient }) => (
  <div style={{
    background: 'linear-gradient(135deg, #0d1530 0%, #0f1b38 100%)',
    border: `1px solid ${color}30`,
    borderRadius: 16, padding: '20px 24px',
    display: 'flex', alignItems: 'flex-start', gap: 16,
    position: 'relative', overflow: 'hidden',
    transition: 'transform 0.2s, box-shadow 0.2s',
  }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 30px ${color}20`; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
  >
    <div style={{
      width: 48, height: 48, borderRadius: 12, flexShrink: 0,
      background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Icon size={22} color="#fff" />
    </div>
    <div>
      <div style={{ color: '#64748b', fontSize: 12, fontWeight: 500 }}>{label}</div>
      <div style={{ color: '#f1f5f9', fontSize: 26, fontWeight: 800, lineHeight: 1.2, marginTop: 2 }}>
        {value?.toLocaleString?.('vi-VN') ?? value}
      </div>
      {sub && <div style={{ color: color, fontSize: 12, marginTop: 4 }}>{sub}</div>}
    </div>
    <div style={{
      position: 'absolute', top: -10, right: -10, width: 80, height: 80,
      borderRadius: '50%', background: `${color}08`,
    }} />
  </div>
);

const MiniChart = ({ data, color, label }) => {
  const max = Math.max(...data, 1);
  const w = 280, h = 100;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * (w - 20) + 10;
    const y = h - 20 - ((v / max) * (h - 30));
    return `${x},${y}`;
  });
  const path = `M${pts.join(' L')}`;
  const area = `M${pts[0]} L${pts.join(' L')} L${w - 10},${h - 10} L10,${h - 10} Z`;

  return (
    <div style={{ padding: '12px 0 4px' }}>
      <div style={{ color: '#94a3b8', fontSize: 12, marginBottom: 8 }}>{label}</div>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#grad-${label})`} />
        <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((v, i) => {
          const [x, y] = pts[i].split(',');
          return <circle key={i} cx={x} cy={y} r="3.5" fill={color} />;
        })}
      </svg>
    </div>
  );
};

const BarChart = ({ data, labels, color }) => {
  const max = Math.max(...data, 1);
  const barW = 18;
  const gap = 8;
  const totalW = data.length * (barW + gap);
  const h = 90;

  return (
    <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
      <svg width={totalW} height={h + 20} viewBox={`0 0 ${totalW} ${h + 20}`}>
        {data.map((v, i) => {
          const bh = Math.max((v / max) * h, 2);
          const x = i * (barW + gap);
          const y = h - bh;
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={bh}
                rx="4" fill={color} opacity="0.8" />
              <text x={x + barW / 2} y={h + 14} textAnchor="middle"
                fill="#64748b" fontSize="9">{labels[i]?.slice(0, 3)}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default function AdminOverview({ showToast }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await adminService.getDashboardStats();
      setStats(data);
    } catch {
      showToast('Không thể tải dữ liệu thống kê.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStats(); }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: '#6366f1' }}>
      <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const monthly = stats?.monthlyStats || [];
  const labels  = monthly.map(m => m.month);
  const userValues = monthly.map(m => m.newUsers || 0);
  const jobValues  = monthly.map(m => m.newJobs || 0);
  const appValues  = monthly.map(m => m.newApplications || 0);
  const revValues  = monthly.map(m => Number(m.revenue || 0) / 1_000_000);

  const fmtRevenue = (v) => {
    if (!v) return '0 ₫';
    if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B ₫`;
    if (v >= 1_000_000)     return `${(v / 1_000_000).toFixed(1)}M ₫`;
    if (v >= 1_000)         return `${(v / 1_000).toFixed(0)}K ₫`;
    return `${v} ₫`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* ── Stat Cards Row 1 ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <StatCard icon={Users}     label="Tổng người dùng" value={stats?.totalUsers}
          sub={`${stats?.totalCandidates} ứng viên · ${stats?.totalEmployers} NTD`}
          color="#6366f1" gradient="linear-gradient(135deg,#6366f1,#4f46e5)" />
        <StatCard icon={Briefcase} label="Tổng tin tuyển dụng" value={stats?.totalJobs}
          sub={`${stats?.totalPublishedJobs} đang hiển thị`}
          color="#22c55e" gradient="linear-gradient(135deg,#22c55e,#16a34a)" />
        <StatCard icon={FileText}  label="Hồ sơ ứng tuyển" value={stats?.totalApplications}
          sub="Tất cả các vị trí"
          color="#f59e0b" gradient="linear-gradient(135deg,#f59e0b,#d97706)" />
        <StatCard icon={Building2} label="Công ty đăng ký" value={stats?.totalCompanies}
          sub={`${stats?.totalPendingCompanies} chờ duyệt`}
          color="#ec4899" gradient="linear-gradient(135deg,#ec4899,#db2777)" />
        <StatCard icon={DollarSign} label="Tổng doanh thu" value={fmtRevenue(Number(stats?.totalRevenue || 0))}
          sub="Từ các giao dịch thành công"
          color="#14b8a6" gradient="linear-gradient(135deg,#14b8a6,#0d9488)" />
        <StatCard icon={AlertCircle} label="Job chờ duyệt" value={stats?.totalPendingJobs}
          sub="Cần Admin xét duyệt"
          color="#f97316" gradient="linear-gradient(135deg,#f97316,#ea580c)" />
      </div>

      {/* ── Charts ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Trend chart */}
        <div style={{
          background: 'linear-gradient(135deg,#0d1530,#0f1b38)',
          border: '1px solid rgba(99,102,241,0.15)', borderRadius: 16, padding: '22px 24px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <h3 style={{ color: '#e2e8f0', fontSize: 15, fontWeight: 700, margin: 0 }}>
              Xu hướng 12 tháng gần nhất
            </h3>
            <TrendingUp size={16} color="#6366f1" />
          </div>
          {monthly.length > 0 ? (
            <>
              <MiniChart data={userValues}  color="#6366f1" label="👤 Người dùng mới" />
              <MiniChart data={jobValues}   color="#22c55e" label="💼 Job mới" />
              <MiniChart data={appValues}   color="#f59e0b" label="📄 Hồ sơ nộp" />
            </>
          ) : (
            <div style={{ color: '#475569', textAlign: 'center', padding: '40px 0' }}>Chưa có dữ liệu</div>
          )}
        </div>

        {/* Revenue chart */}
        <div style={{
          background: 'linear-gradient(135deg,#0d1530,#0f1b38)',
          border: '1px solid rgba(20,184,166,0.2)', borderRadius: 16, padding: '22px 24px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ color: '#e2e8f0', fontSize: 15, fontWeight: 700, margin: 0 }}>
              Doanh thu theo tháng (Triệu ₫)
            </h3>
            <DollarSign size={16} color="#14b8a6" />
          </div>
          {monthly.length > 0 ? (
            <BarChart data={revValues} labels={labels} color="#14b8a6" />
          ) : (
            <div style={{ color: '#475569', textAlign: 'center', padding: '40px 0' }}>Chưa có doanh thu</div>
          )}

          {/* Monthly table */}
          <div style={{ marginTop: 16, maxHeight: 200, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
                  {['Tháng', 'User', 'Job', 'CV', 'DT (VND)'].map(h => (
                    <th key={h} style={{ color: '#64748b', padding: '6px 8px', textAlign: 'right', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...monthly].reverse().slice(0, 6).map((m, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(99,102,241,0.07)' }}>
                    <td style={{ color: '#94a3b8', padding: '6px 8px' }}>{m.month}</td>
                    <td style={{ color: '#6366f1', padding: '6px 8px', textAlign: 'right' }}>{m.newUsers}</td>
                    <td style={{ color: '#22c55e', padding: '6px 8px', textAlign: 'right' }}>{m.newJobs}</td>
                    <td style={{ color: '#f59e0b', padding: '6px 8px', textAlign: 'right' }}>{m.newApplications}</td>
                    <td style={{ color: '#14b8a6', padding: '6px 8px', textAlign: 'right' }}>
                      {fmtRevenue(Number(m.revenue || 0))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Refresh button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={loadStats} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)',
          color: '#a5b4fc', padding: '8px 18px', borderRadius: 10, cursor: 'pointer', fontSize: 13,
        }}>
          <RefreshCw size={14} /> Làm mới dữ liệu
        </button>
      </div>
    </div>
  );
}
