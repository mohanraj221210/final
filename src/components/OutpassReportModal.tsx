import React, { useState, useCallback } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

/* ────────────────────────────────────────────────────────────────── */
/*  Types                                                             */
/* ────────────────────────────────────────────────────────────────── */
interface OutpassRecord {
  _id?: string;
  name?: string;
  registerNumber?: string;
  department?: string;
  year?: string | number;
  reason?: string;
  fromDate?: string;
  toDate?: string;
  createdAt?: string;
  approvedDate?: string;
  status?: string;
  outpasstype?: string;
  approvedBy?: string;
  remarks?: string;
  studentid?: Record<string, any>;
}

interface StaffInfo {
  name?: string;
  department?: string;
  designation?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  outpasses: OutpassRecord[];
  staff: StaffInfo | null;
}

/* ────────────────────────────────────────────────────────────────── */
/*  Helpers                                                           */
/* ────────────────────────────────────────────────────────────────── */
const fmt = (d?: string) => {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return d; }
};

const STATUS_COLORS: Record<string, string> = {
  approved: '#16A34A',
  rejected: '#DC2626',
  pending:  '#D97706',
  emergency:'#7C3AED',
};

const LOADING_STEPS = [
  'Preparing Report...',
  'Collecting Student Records...',
  'Generating Statistics...',
  'Formatting Document...',
  'Please Wait...',
];

/* ────────────────────────────────────────────────────────────────── */
/*  Component                                                         */
/* ────────────────────────────────────────────────────────────────── */
const OutpassReportModal: React.FC<Props> = ({ open, onClose, outpasses, staff }) => {
  /* ── Filters ── */
  const [startDate, setStartDate]   = useState('');
  const [endDate,   setEndDate]     = useState('');
  const [status,    setStatus]      = useState<'all'|'approved'|'pending'|'rejected'|'emergency'>('all');
  const [timeRange, setTimeRange]   = useState<'custom'|'today'|'weekly'|'monthly'>('custom');
  const [studentFilter, setStudentFilter] = useState('all');

  /* ── UI state ── */
  const [loading,      setLoading]      = useState(false);
  const [loadingStep,  setLoadingStep]  = useState(0);
  const [successType,  setSuccessType]  = useState<string | null>(null);

  /* ── Derived data ── */
  const filteredPasses = useCallback((): OutpassRecord[] => {
    let data = [...outpasses];

    // Time range preset
    const now  = new Date();
    let rangeStart: Date | null = null;
    if (timeRange === 'today') {
      rangeStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (timeRange === 'weekly') {
      rangeStart = new Date(now); rangeStart.setDate(now.getDate() - 6); rangeStart.setHours(0,0,0,0);
    } else if (timeRange === 'monthly') {
      rangeStart = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    if (rangeStart) {
      data = data.filter(p => new Date(p.createdAt || '') >= rangeStart!);
    }

    // Custom date range
    if (timeRange === 'custom') {
      if (startDate) data = data.filter(p => new Date(p.createdAt || '') >= new Date(startDate));
      if (endDate)   data = data.filter(p => new Date(p.createdAt || '') <= new Date(endDate + 'T23:59:59'));
    }

    // Status
    if (status !== 'all') {
      data = data.filter(p => {
        const s = (p.status || '').toLowerCase();
        const t = (p.outpasstype || '').toLowerCase();
        if (status === 'emergency') return t.includes('emergency');
        return s === status;
      });
    }

    // Student Filter
    if (studentFilter !== 'all' && studentFilter !== 'specific') {
      data = data.filter(p => (p.name || p.studentid?.name) === studentFilter);
    }

    return data;
  }, [outpasses, startDate, endDate, status, timeRange, studentFilter]);

  const rows = filteredPasses();

  const stats = {
    total:     rows.length,
    approved:  rows.filter(p => (p.status||'').toLowerCase() === 'approved').length,
    rejected:  rows.filter(p => (p.status||'').toLowerCase() === 'rejected').length,
    pending:   rows.filter(p => (p.status||'').toLowerCase() === 'pending').length,
    emergency: rows.filter(p => (p.outpasstype||'').toLowerCase().includes('emergency')).length,
  };

  const approvalRate  = stats.total ? Math.round((stats.approved / stats.total) * 100) : 0;
  const rejectionRate = stats.total ? Math.round((stats.rejected / stats.total) * 100) : 0;

  /* ── Loading animation ── */
  const runLoading = async (onDone: () => void) => {
    setLoading(true); setLoadingStep(0);
    for (let i = 0; i < LOADING_STEPS.length; i++) {
      await new Promise(r => setTimeout(r, 380));
      setLoadingStep(i + 1);
    }
    await new Promise(r => setTimeout(r, 200));
    onDone();
    setLoading(false);
  };

  /* ── Row mapper for table ── */
  const tableRows = () => rows.map(p => [
    p.registerNumber || p.studentid?.registerNumber || '—',
    p.name           || p.studentid?.name           || '—',
    p.department     || p.studentid?.department     || staff?.department || '—',
    String(p.year    || p.studentid?.year           || '—'),
    p.reason         || '—',
    fmt(p.fromDate),
    fmt(p.toDate),
    fmt(p.createdAt),
    fmt(p.approvedDate),
    (p.status || 'pending').toUpperCase(),
    p.approvedBy || '—',
    p.remarks    || '—',
    (p.outpasstype||'').toLowerCase().includes('emergency') ? 'YES' : 'No',
    (p.fromDate && p.toDate)
      ? `${Math.max(0, Math.ceil((new Date(p.toDate).getTime() - new Date(p.fromDate).getTime()) / 86400000))} day(s)`
      : '—',
  ]);

  /* ── PDF ── */
  const handlePDF = () => {
    runLoading(() => {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pageW = doc.internal.pageSize.getWidth();
      const now   = new Date();

      // ── Header band ──
      doc.setFillColor(30, 58, 138);
      doc.rect(0, 0, pageW, 38, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18); doc.setFont('helvetica', 'bold');
      doc.text('JIT CAMPUS ONE', 14, 14);
      doc.setFontSize(13); doc.setFont('helvetica', 'normal');
      doc.text('Faculty Outpass Report', 14, 22);
      doc.setFontSize(9);
      doc.text(`Department : ${staff?.department || 'N/A'}`, 14, 30);
      doc.text(`Generated By : ${staff?.name || 'Faculty'}`, 80, 30);
      doc.text(`Date : ${now.toLocaleDateString('en-IN')}`, 160, 30);
      doc.text(`Academic Year : 2024–2025`, 210, 30);

      // ── Stats row ──
      const statItems = [
        { label: 'Total Applications', val: stats.total,     color: [59, 130, 246] as [number,number,number] },
        { label: 'Approved',           val: stats.approved,  color: [22, 163, 74]  as [number,number,number] },
        { label: 'Rejected',           val: stats.rejected,  color: [220, 38, 38]  as [number,number,number] },
        { label: 'Pending',            val: stats.pending,   color: [217, 119, 6]  as [number,number,number] },
        { label: 'Emergency',          val: stats.emergency, color: [124, 58, 237] as [number,number,number] },
        { label: 'Approval Rate',      val: `${approvalRate}%`,  color: [16, 185, 129] as [number,number,number] },
      ];
      const boxW = (pageW - 28) / statItems.length;
      statItems.forEach((s, i) => {
        const x = 14 + i * boxW;
        doc.setFillColor(s.color[0], s.color[1], s.color[2]);
        doc.roundedRect(x, 42, boxW - 3, 18, 2, 2, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14); doc.setFont('helvetica', 'bold');
        doc.text(String(s.val), x + (boxW-3)/2, 52, { align: 'center' });
        doc.setFontSize(7); doc.setFont('helvetica', 'normal');
        doc.text(s.label, x + (boxW-3)/2, 57, { align: 'center' });
      });

      // ── Table ──
      autoTable(doc, {
        startY: 65,
        head: [['Reg No', 'Name', 'Dept', 'Yr', 'Reason', 'From', 'To', 'Applied', 'Approved', 'Status', 'Authority', 'Remarks', 'Emergency', 'Duration']],
        body: tableRows(),
        styles: { fontSize: 7, cellPadding: 2, font: 'helvetica' },
        headStyles: { fillColor: [30, 58, 138], textColor: 255, fontStyle: 'bold', fontSize: 7.5 },
        alternateRowStyles: { fillColor: [239, 246, 255] },
        columnStyles: {
          9: { fontStyle: 'bold' },
          12: { halign: 'center' },
        },
        didDrawCell: (data: any) => {
          if (data.section === 'body' && data.column.index === 9) {
            const val = (String(data.cell.raw) || '').toLowerCase();
            const color = STATUS_COLORS[val] || '#64748B';
            const [r, g, b] = color.match(/\w\w/g)!.map(x => parseInt(x, 16));
            doc.setFillColor(r, g, b);
            doc.roundedRect(data.cell.x + 1, data.cell.y + 1, data.cell.width - 2, data.cell.height - 2, 1, 1, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(6.5); doc.setFont('helvetica', 'bold');
            doc.text(String(data.cell.raw), data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2 + 1, { align: 'center' });
          }
        },
        foot: [[``, `Total: ${stats.total}`, '', '', '', '', '', '', '', '', '', '', '', '']],
        footStyles: { fillColor: [30, 58, 138], textColor: 255, fontStyle: 'bold', fontSize: 7 },
        didDrawPage: (data: any) => {
          const pg = doc.getNumberOfPages();
          doc.setFontSize(7); doc.setTextColor(150, 150, 150);
          doc.text(`Page ${data.pageNumber} of ${pg}  |  Generated by JIT Campus One  |  Confidential`, pageW / 2, doc.internal.pageSize.getHeight() - 5, { align: 'center' });
        },
      });

      doc.save(`Outpass_Report_${now.toISOString().slice(0,10)}.pdf`);
      setSuccessType('PDF');
      setTimeout(() => setSuccessType(null), 2500);
    });
  };

  /* ── Excel ── */
  const handleExcel = () => {
    runLoading(() => {
      const wb = XLSX.utils.book_new();

      // Sheet 1 – Summary
      const summaryData = [
        ['JIT Campus One – Outpass Report'],
        [],
        ['Generated By', staff?.name || 'Faculty'],
        ['Department',   staff?.department || 'N/A'],
        ['Academic Year','2024–2025'],
        ['Generated On', new Date().toLocaleDateString('en-IN')],
        [],
        ['SUMMARY'],
        ['Total Applications', stats.total],
        ['Approved',           stats.approved],
        ['Rejected',           stats.rejected],
        ['Pending',            stats.pending],
        ['Emergency',          stats.emergency],
        ['Approval Rate',      `${approvalRate}%`],
        ['Rejection Rate',     `${rejectionRate}%`],
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summaryData), 'Summary');

      // Sheet 2 – Student Details
      const headers = ['Reg No','Name','Department','Year','Reason','From Date','To Date','Applied Date','Approved Date','Status','Authority','Remarks','Emergency','Duration'];
      const detailsData = [headers, ...tableRows()];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(detailsData), 'Student Details');

      // Sheet 3 – Statistics
      const statsData = [
        ['Status','Count','Percentage'],
        ['Approved',  stats.approved,  `${approvalRate}%`],
        ['Rejected',  stats.rejected,  `${rejectionRate}%`],
        ['Pending',   stats.pending,   `${stats.total ? Math.round(stats.pending/stats.total*100) : 0}%`],
        ['Emergency', stats.emergency, `${stats.total ? Math.round(stats.emergency/stats.total*100) : 0}%`],
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(statsData), 'Statistics');

      const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      saveAs(new Blob([buf], { type: 'application/octet-stream' }), `Outpass_Report_${new Date().toISOString().slice(0,10)}.xlsx`);
      setSuccessType('Excel');
      setTimeout(() => setSuccessType(null), 2500);
    });
  };

  /* ── CSV ── */
  const handleCSV = () => {
    runLoading(() => {
      const headers = ['Reg No','Name','Department','Year','Reason','From Date','To Date','Applied Date','Approved Date','Status','Authority','Remarks','Emergency','Duration'];
      const csvRows = [headers, ...tableRows()].map(row => row.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','));
      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, `Outpass_Report_${new Date().toISOString().slice(0,10)}.csv`);
      setSuccessType('CSV');
      setTimeout(() => setSuccessType(null), 2500);
    });
  };

  /* ── Print ── */
  const handlePrint = () => {
    const now = new Date();
    const printRows = tableRows().map((r, i) => `
      <tr style="background:${i%2===0?'#fff':'#EFF6FF'}">
        ${r.map((cell, ci) => `<td style="padding:5px 7px;font-size:10px;border:1px solid #E2E8F0;${ci===9?`background:${STATUS_COLORS[(String(cell)).toLowerCase()]||'#64748B'};color:#fff;font-weight:700;border-radius:4px;`:''}">${cell}</td>`).join('')}
      </tr>`).join('');

    const html = `<!DOCTYPE html><html><head><title>Outpass Report</title>
    <style>
      body{font-family:Arial,sans-serif;margin:0;padding:20px;}
      .header{background:#1e3a8a;color:#fff;padding:18px 24px;border-radius:8px;margin-bottom:16px;}
      .header h1{margin:0;font-size:20px;}
      .header p{margin:4px 0 0;font-size:12px;opacity:0.85;}
      .stats{display:flex;gap:12px;margin-bottom:16px;}
      .stat{flex:1;padding:10px;border-radius:8px;text-align:center;}
      .stat-val{font-size:22px;font-weight:800;display:block;}
      .stat-lbl{font-size:10px;}
      table{width:100%;border-collapse:collapse;font-size:10px;}
      th{background:#1e3a8a;color:#fff;padding:7px;text-align:left;font-size:10px;}
      td{padding:5px 7px;border:1px solid #E2E8F0;}
      .footer{text-align:center;margin-top:20px;font-size:10px;color:#64748B;}
      @media print{button{display:none;}}
    </style></head><body>
    <div class="header">
      <h1>JIT Campus One — Faculty Outpass Report</h1>
      <p>Department: ${staff?.department||'N/A'} &nbsp;|&nbsp; Generated By: ${staff?.name||'Faculty'} &nbsp;|&nbsp; ${now.toLocaleDateString('en-IN')} &nbsp;|&nbsp; Academic Year: 2024–2025</p>
    </div>
    <div class="stats">
      <div class="stat" style="background:#EFF6FF"><span class="stat-val" style="color:#1e3a8a">${stats.total}</span><span class="stat-lbl">Total</span></div>
      <div class="stat" style="background:#DCFCE7"><span class="stat-val" style="color:#16A34A">${stats.approved}</span><span class="stat-lbl">Approved</span></div>
      <div class="stat" style="background:#FEF2F2"><span class="stat-val" style="color:#DC2626">${stats.rejected}</span><span class="stat-lbl">Rejected</span></div>
      <div class="stat" style="background:#FFFBEB"><span class="stat-val" style="color:#D97706">${stats.pending}</span><span class="stat-lbl">Pending</span></div>
      <div class="stat" style="background:#EDE9FE"><span class="stat-val" style="color:#7C3AED">${stats.emergency}</span><span class="stat-lbl">Emergency</span></div>
      <div class="stat" style="background:#ECFDF5"><span class="stat-val" style="color:#10B981">${approvalRate}%</span><span class="stat-lbl">Approval Rate</span></div>
    </div>
    <table>
      <thead><tr>${['Reg No','Name','Dept','Yr','Reason','From','To','Applied','Approved','Status','Authority','Remarks','Emergency','Duration'].map(h=>`<th>${h}</th>`).join('')}</tr></thead>
      <tbody>${printRows}</tbody>
    </table>
    <div class="footer">Generated by JIT Campus One · Confidential · ${now.toISOString()}</div>
    </body></html>`;

    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.onload = () => { win.print(); };
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="rm-backdrop" onClick={onClose} />

      {/* Modal */}
      <div className="rm-modal" role="dialog" aria-modal="true" aria-labelledby="rm-title">

        {/* ── Header ── */}
        <div className="rm-header">
          <div className="rm-header-left">
            <div className="rm-header-icon">
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><polyline points="10 9 9 9 8 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </div>
            <div>
              <h2 id="rm-title" className="rm-title">Generate Outpass Report</h2>
              <p className="rm-subtitle">Generate downloadable reports for your students' outpass activities.</p>
            </div>
          </div>
          <button className="rm-close" onClick={onClose} aria-label="Close">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        </div>

        <div className="rm-body">

          {/* ── Filters ── */}
          <div className="rm-section">
            <h3 className="rm-section-title">
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Report Filters
            </h3>

            {/* Time presets */}
            <div className="rm-filter-row">
              <label className="rm-label">Time Range</label>
              <div className="rm-pill-group">
                {(['today','weekly','monthly','custom'] as const).map(t => (
                  <button key={t} className={`rm-pill ${timeRange===t?'rm-pill-active':''}`} onClick={() => setTimeRange(t)}>
                    {t.charAt(0).toUpperCase()+t.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Date range (only when custom) */}
            {timeRange === 'custom' && (
              <div className="rm-filter-row">
                <label className="rm-label">Date Range</label>
                <div className="rm-date-group">
                  <div className="rm-date-field">
                    <label className="rm-date-label">Start Date</label>
                    <input type="date" className="rm-date-input" value={startDate} onChange={e => setStartDate(e.target.value)} />
                  </div>
                  <span className="rm-date-sep">→</span>
                  <div className="rm-date-field">
                    <label className="rm-date-label">End Date</label>
                    <input type="date" className="rm-date-input" value={endDate} onChange={e => setEndDate(e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {/* Student Filter */}
            <div className="rm-filter-row">
              <label className="rm-label">Student Filter</label>
              <div className="rm-pill-group">
                <button
                  className={`rm-pill ${studentFilter === 'all' ? 'rm-pill-active' : ''}`}
                  onClick={() => setStudentFilter('all')}
                >
                  All Students
                </button>
                <button
                  className={`rm-pill ${studentFilter !== 'all' ? 'rm-pill-active' : ''}`}
                  onClick={() => {
                    const firstStudent = outpasses[0]?.name || outpasses[0]?.studentid?.name || '';
                    setStudentFilter(firstStudent || 'specific');
                  }}
                >
                  Specific Student
                </button>
              </div>
              {studentFilter !== 'all' && (
                <select
                  className="rm-input"
                  style={{ width: 'auto', minWidth: '200px', height: '34px', padding: '0 8px', borderRadius: '8px' }}
                  value={studentFilter}
                  onChange={e => setStudentFilter(e.target.value)}
                >
                  <option value="specific" disabled>Select Student...</option>
                  {Array.from(new Set(outpasses.map(o => o.name || o.studentid?.name).filter(Boolean))).map((name: any) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Status */}
            <div className="rm-filter-row">
              <label className="rm-label">Status</label>
              <div className="rm-pill-group">
                {(['all','approved','pending','rejected','emergency'] as const).map(s => (
                  <button key={s} className={`rm-pill rm-pill-${s} ${status===s?'rm-pill-active':''}`} onClick={() => setStatus(s)}>
                    {s.charAt(0).toUpperCase()+s.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Department + Year */}
            <div className="rm-filter-row rm-filter-row-2col">
              <div>
                <label className="rm-label">Department</label>
                <input className="rm-input rm-input-readonly" readOnly value={staff?.department || 'N/A'} />
              </div>
              <div>
                <label className="rm-label">Academic Year</label>
                <input className="rm-input rm-input-readonly" readOnly value="2024 – 2025" />
              </div>
            </div>
          </div>

          {/* ── Preview Stats ── */}
          <div className="rm-section">
            <h3 className="rm-section-title">
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M3 9h18M9 21V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              Report Preview
            </h3>
            <div className="rm-stats-grid">
              {[
                { label: 'Total Students',   val: stats.total,     color: '#3B82F6', bg: '#EFF6FF' },
                { label: 'Applications',     val: stats.total,     color: '#6366F1', bg: '#EEF2FF' },
                { label: 'Approved',         val: stats.approved,  color: '#16A34A', bg: '#DCFCE7' },
                { label: 'Rejected',         val: stats.rejected,  color: '#DC2626', bg: '#FEE2E2' },
                { label: 'Pending',          val: stats.pending,   color: '#D97706', bg: '#FEF3C7' },
                { label: 'Emergency',        val: stats.emergency, color: '#7C3AED', bg: '#EDE9FE' },
              ].map((s,i) => (
                <div key={i} className="rm-stat-card" style={{ background: s.bg, borderColor: s.color+'33' }}>
                  <span className="rm-stat-val" style={{ color: s.color }}>{s.val}</span>
                  <span className="rm-stat-label">{s.label}</span>
                </div>
              ))}
            </div>
            <div className="rm-rate-row">
              <div className="rm-rate">
                <span className="rm-rate-label">Approval Rate</span>
                <div className="rm-rate-bar-bg"><div className="rm-rate-bar rm-rate-green" style={{ width: `${approvalRate}%` }} /></div>
                <span className="rm-rate-pct" style={{ color: '#16A34A' }}>{approvalRate}%</span>
              </div>
              <div className="rm-rate">
                <span className="rm-rate-label">Rejection Rate</span>
                <div className="rm-rate-bar-bg"><div className="rm-rate-bar rm-rate-red" style={{ width: `${rejectionRate}%` }} /></div>
                <span className="rm-rate-pct" style={{ color: '#DC2626' }}>{rejectionRate}%</span>
              </div>
            </div>
          </div>

          {/* ── Report Info ── */}
          <div className="rm-info-strip">
            <div className="rm-info-item"><span className="rm-info-label">Institution</span><span className="rm-info-val">JIT Campus One</span></div>
            <div className="rm-info-item"><span className="rm-info-label">Faculty</span><span className="rm-info-val">{staff?.name || '—'}</span></div>
            <div className="rm-info-item"><span className="rm-info-label">Department</span><span className="rm-info-val">{staff?.department || '—'}</span></div>
            <div className="rm-info-item"><span className="rm-info-label">Records</span><span className="rm-info-val">{stats.total} outpasses</span></div>
          </div>
        </div>

        {/* ── Footer: Download buttons ── */}
        <div className="rm-footer">
          <button className="rm-dl-btn rm-dl-pdf"   onClick={handlePDF}   disabled={loading || stats.total === 0}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            Download PDF
          </button>
          <button className="rm-dl-btn rm-dl-xlsx"  onClick={handleExcel} disabled={loading || stats.total === 0}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M3 9h18M9 21V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            Download Excel
          </button>
          <button className="rm-dl-btn rm-dl-csv"   onClick={handleCSV}   disabled={loading || stats.total === 0}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="8" y1="13" x2="16" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="8" y1="17" x2="16" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            Download CSV
          </button>
          <button className="rm-dl-btn rm-dl-print" onClick={handlePrint}  disabled={loading || stats.total === 0}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><polyline points="6 9 6 2 18 2 18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><rect x="6" y="14" width="12" height="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            Print Report
          </button>
        </div>
      </div>

      {/* ── Loading Overlay ── */}
      {loading && (
        <div className="rm-loading-overlay">
          <div className="rm-loading-box">
            <div className="rm-loading-spinner" />
            <div className="rm-loading-steps">
              {LOADING_STEPS.map((step, i) => (
                <div key={i} className={`rm-loading-step ${loadingStep > i ? 'rm-step-done' : loadingStep === i ? 'rm-step-active' : ''}`}>
                  <span className="rm-step-icon">{loadingStep > i ? '✓' : loadingStep === i ? '⟳' : '○'}</span>
                  {step}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Success Toast ── */}
      {successType && (
        <div className="rm-success-toast">
          <span className="rm-success-icon">✓</span>
          {successType} report downloaded successfully!
        </div>
      )}

      {/* ── Styles ── */}
      <style>{`
        /* ── Backdrop ── */
        .rm-backdrop {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(15, 23, 42, 0.55);
          backdrop-filter: blur(6px);
          animation: rmFadeIn 0.25s ease;
        }

        /* ── Modal ── */
        .rm-modal {
          position: fixed; z-index: 1001;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%) scale(1);
          width: min(90vw, 820px);
          max-height: 90vh;
          display: flex; flex-direction: column;
          background: #fff;
          border-radius: 20px;
          box-shadow: 0 32px 80px rgba(30, 58, 138, 0.18), 0 8px 32px rgba(0,0,0,0.12);
          overflow: hidden;
          animation: rmSlideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes rmFadeIn  { from{opacity:0;} to{opacity:1;} }
        @keyframes rmSlideIn { from{opacity:0;transform:translate(-50%,-50%) scale(0.92);} to{opacity:1;transform:translate(-50%,-50%) scale(1);} }

        /* ── Header ── */
        .rm-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 22px 28px 18px;
          background: linear-gradient(135deg, #1e3a8a 0%, #2563EB 100%);
          flex-shrink: 0;
        }
        .rm-header-left { display: flex; align-items: center; gap: 14px; }
        .rm-header-icon {
          width: 44px; height: 44px; border-radius: 12px;
          background: rgba(255,255,255,0.15); backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          color: #fff; flex-shrink: 0;
        }
        .rm-title   { margin: 0; font-size: 18px; font-weight: 700; color: #fff; font-family: 'Inter', sans-serif; }
        .rm-subtitle{ margin: 3px 0 0; font-size: 12px; color: rgba(255,255,255,0.7); font-family: 'Inter', sans-serif; }
        .rm-close   {
          width: 36px; height: 36px; border-radius: 50%; border: none;
          background: rgba(255,255,255,0.15); color: #fff; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.2s; flex-shrink: 0;
        }
        .rm-close:hover { background: rgba(255,255,255,0.28); }

        /* ── Body ── */
        .rm-body { flex: 1; overflow-y: auto; padding: 24px 28px; display: flex; flex-direction: column; gap: 24px; }

        /* ── Section ── */
        .rm-section { display: flex; flex-direction: column; gap: 14px; }
        .rm-section-title {
          display: flex; align-items: center; gap: 7px;
          font-size: 13px; font-weight: 700; color: #1E3A8A;
          margin: 0; padding-bottom: 8px;
          border-bottom: 1.5px solid #EFF6FF;
          font-family: 'Inter', sans-serif;
        }

        /* ── Filter rows ── */
        .rm-filter-row { display: flex; align-items: flex-start; gap: 14px; flex-wrap: wrap; }
        .rm-filter-row-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .rm-label { font-size: 11px; font-weight: 600; color: #475569; min-width: 80px; padding-top: 6px; font-family: 'Inter', sans-serif; white-space: nowrap; }

        /* Pill group */
        .rm-pill-group { display: flex; gap: 6px; flex-wrap: wrap; }
        .rm-pill {
          padding: 5px 14px; border-radius: 20px; border: 1.5px solid #E2E8F0;
          background: #F8FAFC; font-size: 11px; font-weight: 600; cursor: pointer;
          color: #64748B; transition: all 0.18s; font-family: 'Inter', sans-serif;
        }
        .rm-pill:hover { border-color: #3B82F6; color: #3B82F6; background: #EFF6FF; }
        .rm-pill-active { border-color: #1e3a8a !important; background: #1e3a8a !important; color: #fff !important; }

        /* Date group */
        .rm-date-group { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .rm-date-field { display: flex; flex-direction: column; gap: 4px; }
        .rm-date-label { font-size: 10px; color: #94A3B8; font-weight: 600; font-family: 'Inter', sans-serif; }
        .rm-date-input {
          padding: 7px 10px; border: 1.5px solid #E2E8F0; border-radius: 8px;
          font-size: 12px; color: #1E293B; background: #F8FAFC; font-family: 'Inter', sans-serif;
          transition: border 0.18s; outline: none;
        }
        .rm-date-input:focus { border-color: #3B82F6; }
        .rm-date-sep { color: #CBD5E1; font-size: 18px; margin-top: 18px; }

        /* Input */
        .rm-input {
          padding: 8px 12px; border: 1.5px solid #E2E8F0; border-radius: 8px;
          font-size: 12px; color: #1E293B; background: #F8FAFC; width: 100%; box-sizing: border-box;
          font-family: 'Inter', sans-serif;
        }
        .rm-input-readonly { color: #64748B; cursor: not-allowed; }

        /* ── Stats grid ── */
        .rm-stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .rm-stat-card {
          border-radius: 12px; border: 1.5px solid; padding: 12px;
          display: flex; flex-direction: column; align-items: center; gap: 4px;
          transition: transform 0.18s;
        }
        .rm-stat-card:hover { transform: translateY(-2px); }
        .rm-stat-val   { font-size: 26px; font-weight: 800; font-family: 'Inter', sans-serif; }
        .rm-stat-label { font-size: 10px; color: #64748B; font-weight: 600; font-family: 'Inter', sans-serif; text-align: center; }

        /* Rate bars */
        .rm-rate-row { display: flex; gap: 20px; flex-wrap: wrap; }
        .rm-rate { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 200px; }
        .rm-rate-label { font-size: 11px; color: #64748B; font-weight: 600; white-space: nowrap; font-family: 'Inter', sans-serif; }
        .rm-rate-bar-bg { flex: 1; height: 6px; background: #F1F5F9; border-radius: 3px; overflow: hidden; }
        .rm-rate-bar { height: 100%; border-radius: 3px; transition: width 0.6s ease; }
        .rm-rate-green { background: linear-gradient(90deg, #22C55E, #16A34A); }
        .rm-rate-red   { background: linear-gradient(90deg, #F87171, #DC2626); }
        .rm-rate-pct   { font-size: 11px; font-weight: 700; font-family: 'Inter', sans-serif; }

        /* ── Info strip ── */
        .rm-info-strip {
          display: flex; gap: 0; flex-wrap: wrap;
          border-radius: 10px; overflow: hidden;
          border: 1.5px solid #E2E8F0;
        }
        .rm-info-item {
          flex: 1; min-width: 120px; padding: 10px 14px;
          border-right: 1px solid #E2E8F0; background: #F8FAFC;
          display: flex; flex-direction: column; gap: 2px;
        }
        .rm-info-item:last-child { border-right: none; }
        .rm-info-label { font-size: 9px; font-weight: 600; color: #94A3B8; letter-spacing: 1px; text-transform: uppercase; font-family: 'Inter', sans-serif; }
        .rm-info-val   { font-size: 12px; font-weight: 700; color: #1E293B; font-family: 'Inter', sans-serif; }

        /* ── Footer ── */
        .rm-footer {
          display: flex; gap: 10px; padding: 16px 28px;
          border-top: 1px solid #F1F5F9; flex-wrap: wrap;
          background: #FAFBFF; flex-shrink: 0;
        }
        .rm-dl-btn {
          flex: 1; min-width: 130px; display: flex; align-items: center; justify-content: center; gap: 7px;
          padding: 10px 16px; border-radius: 10px; border: 1.5px solid transparent;
          font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s;
          font-family: 'Inter', sans-serif; position: relative; overflow: hidden;
        }
        .rm-dl-btn::after { content:''; position:absolute; inset:0; background:rgba(255,255,255,0); transition:background 0.2s; border-radius: inherit; }
        .rm-dl-btn:hover::after { background:rgba(255,255,255,0.15); }
        .rm-dl-btn:active { transform: scale(0.97); }
        .rm-dl-btn:disabled { opacity: 0.45; cursor: not-allowed; pointer-events: none; }

        .rm-dl-pdf   { background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%); color: #fff; box-shadow: 0 4px 14px rgba(220,38,38,0.3); }
        .rm-dl-xlsx  { background: linear-gradient(135deg, #16A34A 0%, #15803D 100%); color: #fff; box-shadow: 0 4px 14px rgba(22,163,74,0.3); }
        .rm-dl-csv   { background: linear-gradient(135deg, #0891B2 0%, #0E7490 100%); color: #fff; box-shadow: 0 4px 14px rgba(8,145,178,0.3); }
        .rm-dl-print { background: linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%); color: #fff; box-shadow: 0 4px 14px rgba(124,58,237,0.3); }

        /* ── Loading overlay ── */
        .rm-loading-overlay {
          position: fixed; inset: 0; z-index: 1100;
          background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center;
          animation: rmFadeIn 0.2s ease;
        }
        .rm-loading-box {
          background: #fff; border-radius: 18px; padding: 32px 40px;
          display: flex; flex-direction: column; align-items: center; gap: 20px;
          min-width: 280px;
          box-shadow: 0 24px 60px rgba(30,58,138,0.2);
        }
        .rm-loading-spinner {
          width: 44px; height: 44px; border: 3px solid #EFF6FF;
          border-top-color: #1e3a8a; border-radius: 50%;
          animation: rmSpin 0.75s linear infinite;
        }
        @keyframes rmSpin { to { transform: rotate(360deg); } }
        .rm-loading-steps { display: flex; flex-direction: column; gap: 8px; width: 100%; }
        .rm-loading-step {
          display: flex; align-items: center; gap: 10px;
          font-size: 12px; color: #94A3B8; font-family: 'Inter', sans-serif;
          transition: all 0.3s;
        }
        .rm-step-active { color: #1e3a8a; font-weight: 700; }
        .rm-step-done   { color: #16A34A; }
        .rm-step-icon   { font-size: 14px; width: 18px; text-align: center; }

        /* ── Success toast ── */
        .rm-success-toast {
          position: fixed; bottom: 28px; right: 28px; z-index: 1200;
          background: #fff; border-left: 4px solid #16A34A;
          border-radius: 10px; padding: 14px 20px;
          display: flex; align-items: center; gap: 10px;
          font-size: 13px; font-weight: 600; color: #1E293B;
          box-shadow: 0 8px 30px rgba(0,0,0,0.12);
          animation: rmSlideInRight 0.35s cubic-bezier(0.34,1.56,0.64,1);
          font-family: 'Inter', sans-serif;
        }
        .rm-success-icon { font-size: 18px; color: #16A34A; }
        @keyframes rmSlideInRight { from{opacity:0;transform:translateX(40px);} to{opacity:1;transform:translateX(0);} }

        /* ── Mobile responsive ── */
        @media (max-width: 640px) {
          .rm-modal   { width: 100vw; max-height: 95vh; top: auto; bottom: 0; left: 0; transform: none; border-radius: 20px 20px 0 0; animation: rmSlideUp 0.3s cubic-bezier(0.34,1.56,0.64,1); }
          @keyframes rmSlideUp { from{opacity:0;transform:translateY(40px);} to{opacity:1;transform:translateY(0);} }
          .rm-header  { padding: 18px 20px 14px; }
          .rm-body    { padding: 16px 18px; }
          .rm-footer  { padding: 12px 18px; gap: 8px; }
          .rm-dl-btn  { min-width: calc(50% - 4px); font-size: 11px; padding: 9px 10px; }
          .rm-stats-grid { grid-template-columns: repeat(2, 1fr); }
          .rm-filter-row-2col { grid-template-columns: 1fr; }
          .rm-filter-row { flex-direction: column; gap: 8px; }
          .rm-label   { min-width: unset; padding-top: 0; }
          .rm-info-strip { flex-direction: column; }
          .rm-info-item  { border-right: none; border-bottom: 1px solid #E2E8F0; }
        }
      `}</style>
    </>
  );
};

export default OutpassReportModal;
