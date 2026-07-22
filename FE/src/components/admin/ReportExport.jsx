import React, { useState } from 'react';
import { FileSpreadsheet, Users, Briefcase, DollarSign, Download, CheckCircle } from 'lucide-react';
import api from '../../services/api';

const REPORTS = [
  {
    id: 'users',
    icon: Users,
    color: '#6366f1',
    gradient: 'linear-gradient(135deg,#6366f1,#4f46e5)',
    title: 'Báo cáo người dùng',
    desc: 'Danh sách toàn bộ người dùng trong hệ thống với đầy đủ thông tin: email, vai trò, trạng thái, ngày đăng ký.',
    filename: 'users_report.xlsx',
    endpoint: '/admin/reports/users',
  },
  {
    id: 'jobs',
    icon: Briefcase,
    color: '#22c55e',
    gradient: 'linear-gradient(135deg,#22c55e,#16a34a)',
    title: 'Báo cáo tin tuyển dụng',
    desc: 'Danh sách tất cả tin tuyển dụng với tiêu đề, công ty, địa điểm, mức lương, loại hình và trạng thái.',
    filename: 'jobs_report.xlsx',
    endpoint: '/admin/reports/jobs',
  },
  {
    id: 'revenue',
    icon: DollarSign,
    color: '#14b8a6',
    gradient: 'linear-gradient(135deg,#14b8a6,#0d9488)',
    title: 'Báo cáo doanh thu',
    desc: 'Thống kê doanh thu theo từng tháng trong 12 tháng gần nhất: số user mới, job mới, hồ sơ và doanh thu.',
    filename: 'revenue_report.xlsx',
    endpoint: '/admin/reports/revenue',
  },
];

export default function ReportExport({ showToast }) {
  const [downloading, setDownloading] = useState({});
  const [downloaded, setDownloaded]   = useState({});

  const handleDownload = async (report) => {
    setDownloading(p => ({ ...p, [report.id]: true }));
    try {
      const token = localStorage.getItem('token');
      const response = await api.get(report.endpoint, {
        responseType: 'blob',
        headers: { Authorization: `Bearer ${token}` },
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', report.filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      showToast(`Đã tải xuống ${report.title}.`, 'success');
      setDownloaded(p => ({ ...p, [report.id]: true }));
      setTimeout(() => setDownloaded(p => ({ ...p, [report.id]: false })), 3000);
    } catch (e) {
      showToast(`Lỗi xuất báo cáo: ${e?.response?.data?.message || e.message}`, 'error');
    } finally {
      setDownloading(p => ({ ...p, [report.id]: false }));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header info */}
      <div style={{
        background: 'linear-gradient(135deg,rgba(99,102,241,0.1),rgba(139,92,246,0.08))',
        border: '1px solid rgba(99,102,241,0.2)', borderRadius: 14, padding: '20px 24px',
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <FileSpreadsheet size={22} color="#fff" />
        </div>
        <div>
          <h2 style={{ color: '#e2e8f0', fontSize: 17, fontWeight: 700, margin: 0 }}>
            Xuất báo cáo Excel
          </h2>
          <p style={{ color: '#64748b', fontSize: 13, margin: '4px 0 0' }}>
            Tải xuống các file báo cáo (.xlsx) để phân tích và đối soát số liệu hoạt động hệ thống.
          </p>
        </div>
      </div>

      {/* Report cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
        {REPORTS.map(report => {
          const Icon = report.icon;
          const isDownloading = downloading[report.id];
          const isDone = downloaded[report.id];
          return (
            <div key={report.id} style={{
              background: 'linear-gradient(135deg,#0d1530,#0f1b38)',
              border: `1px solid ${report.color}25`, borderRadius: 16, padding: '26px 24px',
              display: 'flex', flexDirection: 'column', gap: 16,
              transition: 'box-shadow 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = `0 8px 30px ${report.color}15`}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
            >
              {/* Icon + title */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 50, height: 50, borderRadius: 14,
                  background: report.gradient,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={22} color="#fff" />
                </div>
                <div>
                  <h3 style={{ color: '#e2e8f0', fontSize: 16, fontWeight: 700, margin: 0 }}>
                    {report.title}
                  </h3>
                  <span style={{ color: '#475569', fontSize: 12 }}>.xlsx</span>
                </div>
              </div>

              {/* Description */}
              <p style={{ color: '#64748b', fontSize: 13, lineHeight: 1.65, margin: 0, flex: 1 }}>
                {report.desc}
              </p>

              {/* File info */}
              <div style={{
                background: `${report.color}08`, border: `1px solid ${report.color}15`,
                borderRadius: 8, padding: '8px 12px',
                display: 'flex', alignItems: 'center', gap: 8,
                color: report.color, fontSize: 12,
              }}>
                <FileSpreadsheet size={14} />
                <span>{report.filename}</span>
              </div>

              {/* Download button */}
              <button
                onClick={() => handleDownload(report)}
                disabled={isDownloading}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  background: isDone
                    ? 'linear-gradient(135deg,#22c55e,#16a34a)'
                    : report.gradient,
                  border: 'none', color: '#fff', padding: '12px 20px',
                  borderRadius: 10, cursor: isDownloading ? 'wait' : 'pointer',
                  fontSize: 14, fontWeight: 600,
                  opacity: isDownloading ? 0.7 : 1,
                  transition: 'all 0.2s',
                }}
              >
                {isDone ? (
                  <><CheckCircle size={16} /> Đã tải xuống!</>
                ) : isDownloading ? (
                  <><SpinnerIcon /> Đang xuất...</>
                ) : (
                  <><Download size={16} /> Tải xuống Excel</>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Note */}
      <div style={{
        background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)',
        borderRadius: 10, padding: '14px 18px',
        color: '#fbbf24', fontSize: 13, lineHeight: 1.6,
      }}>
        <strong>💡 Lưu ý:</strong> Báo cáo doanh thu chứa dữ liệu 12 tháng gần nhất. 
        Nếu chưa có giao dịch nào thì cột doanh thu sẽ hiển thị 0. 
        File Excel tương thích với Microsoft Excel và Google Sheets.
      </div>
    </div>
  );
}

const SpinnerIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
    style={{ animation: 'spin 1s linear infinite' }}>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </svg>
);
