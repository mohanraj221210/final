import React, { useState } from 'react';
import WatchmanNav from '../../components/WatchmanNav';
import { useNavigate } from 'react-router-dom';
import { Scanner } from '@yudiel/react-qr-scanner';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';

const WatchmanScanQR: React.FC = () => {
    const navigate = useNavigate();
    const [scannedId, setScannedId] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [outpassData, setOutpassData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [imageError, setImageError] = useState<boolean>(false);

    const isOutpassTimeValid = (fromDate: string, toDate: string) => {
        if (!fromDate || !toDate) return true;
        const now = Date.now();
        const fromTime = new Date(fromDate).getTime();
        const toTime = new Date(toDate).getTime();
        return now >= fromTime && now <= toTime;
    };

    const handleScan = async (text: string) => {
        if (text && text !== scannedId && !loading) {
            setScannedId(text);
            fetchOutpass(text);
        }
    };

    const fetchOutpass = async (id: string) => {
        setLoading(true);
        setError(null);
        setImageError(false);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/watchman/outpass/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.status === 200 && response.data.outpass) {
                setOutpassData(response.data.outpass);
                toast.success("Outpass Fetched Successfully");
            }
        } catch (err: any) {
            console.error(err);
            const msg = err.response?.data?.message || 'Failed to fetch outpass details';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (type: 'in' | 'out') => {
        if (!scannedId) return;
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/watchman/outpass/${scannedId}/${type}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.status === 200) {
                toast.success(`Outpass marked as ${type.toUpperCase()} successfully`);
                setOutpassData(response.data.outpass);
            }
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || `Failed to mark outpass as ${type.toUpperCase()}`);
        }
    };

    const resetScan = () => {
        setScannedId(null);
        setOutpassData(null);
        setError(null);
        setImageError(false);
    };

    // Calculate avatar source
    const studentPhoto = outpassData?.studentid?.photo;
    const avatarSrc = studentPhoto
        ? (studentPhoto.startsWith('data:')
            ? studentPhoto
            : `${studentPhoto}`)
        : null;

    return (
        <div className="sd-root">
            <WatchmanNav />
            <ToastContainer position="top-center" />
            
            <main className="sd-main">
                <div className="sd-container">
                    
                    {/* Header Row */}
                    <div className="sd-header-row">
                        <div>
                            <button className="sd-back-btn" onClick={() => navigate("/watchman-dashboard")}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 12H5M12 5l-7 7 7 7"/>
                                </svg>
                                Back to Dashboard
                            </button>
                            <h1 className="sd-title">Gate QR Verification</h1>
                            <p className="sd-subtitle">Scan student outpass credentials to record entry and exit times</p>
                        </div>
                    </div>

                    {/* Scan & Results Layout Card */}
                    <div className="sd-scanner-card">
                        {!scannedId ? (
                            <div className="sd-scanner-init">
                                <div className="sd-scanner-instructions">
                                    <span className="sd-scanner-tip-icon">📷</span>
                                    <p className="sd-scanner-tip-text">Align the student's digital outpass QR code inside the camera window below.</p>
                                </div>

                                <div className="sd-scanner-viewport-wrapper">
                                    <div className="sd-scanner-glow-border" />
                                    <div className="sd-scanner-laser-line" />
                                    <div className="sd-scanner-element">
                                        <Scanner
                                            onScan={(result) => {
                                                if (result && result.length > 0) {
                                                    handleScan(result[0].rawValue);
                                                }
                                            }}
                                            onError={(error) => console.log(error?.message)}
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="sd-scanner-results">
                                {loading && (
                                    <div className="sd-result-loading">
                                        <div className="sd-loader-spin" />
                                        <h3>Retrieving Outpass Details...</h3>
                                        <p>Contacting secure databases</p>
                                    </div>
                                )}

                                {error && !loading && (
                                    <div className="sd-result-error">
                                        <div className="sd-error-badge-large">❌</div>
                                        <h2 className="sd-error-header">Access Denied / Failed</h2>
                                        <p className="sd-error-desc">{error}</p>
                                        <button onClick={resetScan} className="sd-action-btn sd-btn-retry">
                                            Scan Another QR
                                        </button>
                                    </div>
                                )}

                                {outpassData && !loading && (
                                    <div className="sd-result-success">
                                        {isOutpassTimeValid(outpassData.fromDate, outpassData.toDate) ? (
                                            <div className="sd-success-banner">
                                                <span className="sd-success-checkmark">✓</span>
                                                <div>
                                                    <h2 className="sd-success-title">Verified Outpass Approved</h2>
                                                    <p className="sd-success-subtitle">Gate Log Record Validated</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="sd-success-banner" style={{ background: '#FEF2F2', borderColor: '#FECACA', color: '#DC2626' }}>
                                                <span className="sd-success-checkmark" style={{ background: '#EF4444' }}>!</span>
                                                <div>
                                                    <h2 className="sd-success-title" style={{ color: '#991B1B' }}>Warning: Outpass Time Window Invalid</h2>
                                                    <p className="sd-success-subtitle" style={{ color: '#B91C1C' }}>
                                                        {new Date().getTime() < new Date(outpassData.fromDate).getTime() 
                                                            ? 'Outpass is not yet active (future scheduled pass).' 
                                                            : 'Outpass has expired (return time exceeded).'}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="sd-result-body">
                                            
                                            {/* Student Card Info */}
                                            <div className="sd-student-profile-strip">
                                                <div className="sd-student-avatar-wrap">
                                                    {avatarSrc && !imageError ? (
                                                        <img
                                                            src={avatarSrc}
                                                            alt="Student"
                                                            className="sd-student-img"
                                                            onError={() => setImageError(true)}
                                                        />
                                                    ) : (
                                                        <div className="sd-student-initials">
                                                            {outpassData.studentid?.name ? outpassData.studentid.name.charAt(0).toUpperCase() : "S"}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="sd-student-identity">
                                                    <h3 className="sd-student-name">{outpassData.studentid?.name || "Student"}</h3>
                                                    <span className="sd-student-reg sd-mono">{outpassData.studentid?.registerNumber || "N/A"}</span>
                                                    <span className="sd-student-dept">{outpassData.studentid?.department || "-"}</span>
                                                </div>
                                            </div>

                                            {/* Details Grid */}
                                            <div className="sd-details-grid">
                                                <div className="sd-detail-item">
                                                    <span className="label">Outpass Type</span>
                                                    <span className={`value sd-pill-type ${outpassData.outpasstype?.toLowerCase().includes('emergency') ? 'emergency' : ''}`}>
                                                        {outpassData.outpasstype || 'General'}
                                                    </span>
                                                </div>
                                                <div className="sd-detail-item">
                                                    <span className="label">Status</span>
                                                    <span className="value" style={{ color: outpassData.status === 'approved' ? '#10B981' : '#EA580C', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.88rem' }}>
                                                        {outpassData.status || 'Pending'}
                                                    </span>
                                                </div>
                                                <div className="sd-detail-item">
                                                    <span className="label">Valid From Date & Time</span>
                                                    <span className="value" style={{ color: '#475569', fontWeight: 600 }}>
                                                        {outpassData.fromDate ? new Date(outpassData.fromDate).toLocaleString() : 'N/A'}
                                                    </span>
                                                </div>
                                                <div className="sd-detail-item">
                                                    <span className="label">Valid To Date & Time</span>
                                                    <span className="value" style={{ color: '#475569', fontWeight: 600 }}>
                                                        {outpassData.toDate ? new Date(outpassData.toDate).toLocaleString() : 'N/A'}
                                                    </span>
                                                </div>
                                                <div className="sd-detail-item full-width">
                                                    <span className="label">Reason</span>
                                                    <p className="value-p">{outpassData.reason || "N/A"}</p>
                                                </div>
                                                <div className="sd-detail-item">
                                                    <span className="label">Marked Out (Exit Gate)</span>
                                                    <span className="value sd-timestamp">
                                                        {outpassData.out ? new Date(outpassData.out).toLocaleString() : 'Not Checked Out'}
                                                    </span>
                                                </div>
                                                <div className="sd-detail-item">
                                                    <span className="label">Marked In (Entry Gate)</span>
                                                    <span className="value sd-timestamp">
                                                        {outpassData.in ? new Date(outpassData.in).toLocaleString() : 'Not Checked In'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Verification Controls */}
                                        <div className="sd-result-actions">
                                            <button onClick={resetScan} className="sd-action-btn sd-btn-secondary">
                                                Scan Next Student
                                            </button>
                                            
                                            {!outpassData.out && (
                                                <button 
                                                    onClick={() => handleStatusUpdate('out')}
                                                    className="sd-action-btn sd-btn-primary sd-btn-exit"
                                                >
                                                    Confirm Student EXIT (Out)
                                                </button>
                                            )}
                                            
                                            {outpassData.out && !outpassData.in && (
                                                <button 
                                                    onClick={() => handleStatusUpdate('in')}
                                                    className="sd-action-btn sd-btn-primary sd-btn-entry"
                                                >
                                                    Confirm Student ENTRY (In)
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                </div>
            </main>

            <style>{`
                /* ====== LAYOUT & BASE ====== */
                .sd-root {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 45%, #DBEAFE 100%);
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                    padding-top: var(--nav-height, 64px);
                    padding-bottom: 80px;
                }

                .sd-main {
                    padding: 24px 32px;
                    max-width: var(--content-max, 1280px);
                    margin: 0 auto;
                }

                .sd-container {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }

                /* ====== HEADER ROW ====== */
                .sd-header-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    flex-wrap: wrap;
                }

                .sd-back-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: white;
                    border: 1px solid #E2E8F0;
                    color: #3B82F6;
                    font-size: 0.85rem;
                    font-weight: 700;
                    padding: 10px 18px;
                    border-radius: 100px;
                    cursor: pointer;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.02);
                    transition: all 0.2s ease;
                    font-family: inherit;
                }

                .sd-back-btn:hover {
                    background: #EFF6FF;
                    transform: translateX(-4px);
                    box-shadow: 0 6px 12px rgba(59, 130, 246, 0.08);
                }

                .sd-title {
                    font-size: 1.8rem;
                    font-weight: 800;
                    color: #0F172A;
                    margin: 12px 0 4px;
                    letter-spacing: -0.02em;
                }

                .sd-subtitle {
                    font-size: 0.9rem;
                    color: #64748B;
                    margin: 0;
                    font-weight: 500;
                }

                /* ====== SCANNER CONTAINER CARD ====== */
                .sd-scanner-card {
                    background: rgba(255, 255, 255, 0.92);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border: 1px solid rgba(255, 255, 255, 0.75);
                    border-radius: 24px;
                    padding: 32px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03), 0 0 0 1px rgba(226, 232, 240, 0.6);
                    max-width: 600px;
                    margin: 0 auto;
                    width: 100%;
                    box-sizing: border-box;
                }

                /* ====== INITIAL STATE ====== */
                .sd-scanner-init {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 24px;
                }

                .sd-scanner-instructions {
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    max-width: 380px;
                }

                .sd-scanner-tip-icon {
                    font-size: 2.2rem;
                    background: #EFF6FF;
                    color: #3B82F6;
                    width: 56px;
                    height: 56px;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 10px rgba(59,130,246,0.1);
                }

                .sd-scanner-tip-text {
                    font-size: 0.88rem;
                    color: #64748B;
                    margin: 0;
                    line-height: 1.5;
                    font-weight: 500;
                }

                .sd-scanner-viewport-wrapper {
                    position: relative;
                    width: 100%;
                    max-width: 360px;
                    aspect-ratio: 1;
                    border-radius: 20px;
                    overflow: hidden;
                    border: 2px solid #E2E8F0;
                    background: #000;
                    box-shadow: 0 12px 36px rgba(0,0,0,0.1);
                }

                .sd-scanner-glow-border {
                    position: absolute;
                    inset: 12px;
                    border: 3px solid #3B82F6;
                    border-radius: 12px;
                    pointer-events: none;
                    z-index: 10;
                    box-shadow: 0 0 15px rgba(59, 130, 246, 0.4), inset 0 0 15px rgba(59, 130, 246, 0.4);
                }

                .sd-scanner-laser-line {
                    position: absolute;
                    top: 15px;
                    left: 20px;
                    right: 20px;
                    height: 3px;
                    background: #3B82F6;
                    z-index: 11;
                    pointer-events: none;
                    box-shadow: 0 0 12px #3B82F6, 0 0 4px #3B82F6;
                    border-radius: 50%;
                    animation: laser-sweep 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                }

                @keyframes laser-sweep {
                    0%, 100% { top: 15px; opacity: 0.7; }
                    50% { top: calc(100% - 18px); opacity: 1; }
                }

                .sd-scanner-element {
                    width: 100%;
                    height: 100%;
                }

                /* ====== LOADING STATE ====== */
                .sd-result-loading {
                    text-align: center;
                    padding: 48px 12px;
                }

                .sd-loader-spin {
                    width: 48px;
                    height: 48px;
                    border: 4px solid #E2E8F0;
                    border-top-color: #3B82F6;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                    margin: 0 auto 20px;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .sd-result-loading h3 {
                    color: #1E293B;
                    font-size: 1.15rem;
                    margin: 0 0 8px;
                    font-weight: 700;
                }

                .sd-result-loading p {
                    color: #94A3B8;
                    font-size: 0.82rem;
                    margin: 0;
                    font-weight: 500;
                }

                /* ====== ERROR STATE ====== */
                .sd-result-error {
                    text-align: center;
                    padding: 40px 16px;
                }

                .sd-error-badge-large {
                    font-size: 3rem;
                    width: 72px;
                    height: 72px;
                    background: #FEF2F2;
                    border-radius: 50%;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 20px;
                    box-shadow: inset 0 2px 4px rgba(239, 68, 68, 0.05);
                }

                .sd-error-header {
                    font-size: 1.3rem;
                    font-weight: 800;
                    color: #EF4444;
                    margin: 0 0 8px;
                    letter-spacing: -0.01em;
                }

                .sd-error-desc {
                    font-size: 0.9rem;
                    color: #64748B;
                    margin: 0 0 24px;
                    line-height: 1.5;
                    font-weight: 500;
                }

                .sd-btn-retry {
                    background: #EF4444;
                    color: white;
                    box-shadow: 0 4px 14px rgba(239, 68, 68, 0.3);
                }

                .sd-btn-retry:hover {
                    background: #DC2626;
                    box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
                }

                /* ====== SUCCESS STATE ====== */
                .sd-success-banner {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    background: #ECFDF5;
                    border: 1px solid rgba(16, 185, 129, 0.15);
                    padding: 16px 20px;
                    border-radius: 16px;
                    margin-bottom: 24px;
                }

                .sd-success-checkmark {
                    font-size: 1.5rem;
                    font-weight: 900;
                    color: white;
                    background: #10B981;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    box-shadow: 0 4px 10px rgba(16,185,129,0.25);
                }

                .sd-success-title {
                    font-size: 1.05rem;
                    font-weight: 800;
                    color: #065F46;
                    margin: 0 0 2px;
                }

                .sd-success-subtitle {
                    font-size: 0.8rem;
                    color: #047857;
                    margin: 0;
                    font-weight: 600;
                }

                /* Student Identity Strip */
                .sd-student-profile-strip {
                    display: flex;
                    align-items: center;
                    gap: 18px;
                    background: #FAFBFD;
                    border: 1px solid #EFF2F5;
                    border-radius: 18px;
                    padding: 16px 20px;
                    margin-bottom: 20px;
                }

                .sd-student-avatar-wrap {
                    width: 64px;
                    height: 64px;
                    border-radius: 14px;
                    overflow: hidden;
                    border: 2px solid white;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.06);
                    flex-shrink: 0;
                }

                .sd-student-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .sd-student-initials {
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(135deg, #3B82F6, #1D4ED8);
                    color: white;
                    font-size: 1.8rem;
                    font-weight: 800;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .sd-student-identity {
                    display: flex;
                    flex-direction: column;
                }

                .sd-student-name {
                    font-size: 1.15rem;
                    font-weight: 800;
                    color: #0F172A;
                    margin: 0 0 2px;
                }

                .sd-student-reg {
                    font-size: 0.82rem;
                    font-weight: 700;
                    color: #64748B;
                }

                .sd-student-dept {
                    font-size: 0.78rem;
                    color: #94A3B8;
                    margin-top: 2px;
                    font-weight: 600;
                }

                /* Details grid */
                .sd-details-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                    background: #FAFBFD;
                    border: 1px solid #EFF2F5;
                    border-radius: 18px;
                    padding: 20px;
                    margin-bottom: 28px;
                }

                .sd-detail-item {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .sd-detail-item.full-width {
                    grid-column: span 2;
                }

                .sd-detail-item .label {
                    font-size: 0.68rem;
                    font-weight: 700;
                    color: #94A3B8;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .sd-detail-item .value {
                    font-size: 0.95rem;
                    font-weight: 600;
                    color: #1F2937;
                }

                .sd-pill-type {
                    display: inline-block;
                    padding: 3px 8px;
                    border-radius: 6px;
                    background: #EFF6FF;
                    color: #3B82F6;
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    width: fit-content;
                }

                .sd-pill-type.emergency {
                    background: #FEF2F2;
                    color: #EF4444;
                }

                .sd-detail-item .value-p {
                    margin: 0;
                    font-size: 0.88rem;
                    color: #475569;
                    line-height: 1.5;
                    font-weight: 500;
                }

                .sd-timestamp {
                    color: #3B82F6 !important;
                    font-family: 'SF Mono', monospace;
                    font-size: 0.82rem !important;
                }

                /* ====== BUTTON ACTION STYLING ====== */
                .sd-result-actions {
                    display: flex;
                    gap: 12px;
                    flex-wrap: wrap;
                }

                .sd-action-btn {
                    flex: 1;
                    min-width: 140px;
                    padding: 14px 24px;
                    border-radius: 14px;
                    font-size: 0.92rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    border: none;
                    font-family: inherit;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }

                .sd-btn-primary {
                    color: white;
                }

                .sd-btn-exit {
                    background: linear-gradient(135deg, #EA580C 0%, #C2410C 100%);
                    box-shadow: 0 4px 14px rgba(234, 88, 12, 0.35);
                }

                .sd-btn-exit:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(234, 88, 12, 0.45);
                }

                .sd-btn-entry {
                    background: linear-gradient(135deg, #10B981 0%, #047857 100%);
                    box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
                }

                .sd-btn-entry:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.45);
                }

                .sd-btn-secondary {
                    background: white;
                    border: 1px solid #E2E8F0;
                    color: #475569;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
                }

                .sd-btn-secondary:hover {
                    background: #F8FAFC;
                    border-color: #CBD5E1;
                    color: #0F172A;
                }

                .sd-mono {
                    font-family: 'SF Mono', 'Fira Code', monospace;
                }

                @media (max-width: 480px) {
                    .sd-scanner-card {
                        padding: 20px 16px;
                    }
                    .sd-success-banner {
                        padding: 12px;
                        gap: 12px;
                    }
                    .sd-success-title {
                        font-size: 0.95rem;
                    }
                    .sd-student-profile-strip {
                        padding: 12px;
                        gap: 12px;
                    }
                    .sd-student-name {
                        font-size: 1rem;
                    }
                    .sd-details-grid {
                        grid-template-columns: 1fr;
                        padding: 14px;
                        gap: 12px;
                    }
                    .sd-detail-item.full-width {
                        grid-column: span 1;
                    }
                    .sd-result-actions {
                        flex-direction: column;
                    }
                    .sd-action-btn {
                        width: 100%;
                    }
                }
            `}</style>
        </div>
    );
};

export default WatchmanScanQR;
