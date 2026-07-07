import React, { useState } from 'react';
import WardenNav from '../../components/WardenNav';
import { useNavigate } from 'react-router-dom';
import { Scanner } from '@yudiel/react-qr-scanner';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';

const WardenScanQR: React.FC = () => {
    const navigate = useNavigate();
    const [scannedId, setScannedId] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [outpassData, setOutpassData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [imageError, setImageError] = useState<boolean>(false);

    // Search Feature states
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searchLoading, setSearchLoading] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<'scan' | 'search'>('scan');
    const [, setLoadedFrom] = useState<'scan' | 'search'>('scan');
    const [showLateModal, setShowLateModal] = useState<boolean>(false);

    const handleScan = async (text: string) => {
        if (text && text !== scannedId && !loading) {
            setScannedId(text);
            setLoadedFrom('scan');
            fetchOutpass(text);
        }
    };

    const fetchOutpass = async (id: string) => {
        setLoading(true);
        setError(null);
        setImageError(false);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/warden/outpass/qr/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.status === 200 && response.data.outpass) {
                setOutpassData(response.data.outpass);
                toast.success("Outpass Fetched and Verified Successfully");
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

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setSearchLoading(true);
        setError(null);
        setSearchResults([]);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/warden/outpass/qr/list?search=${searchQuery.trim()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.status === 200 && response.data.outpass) {
                setSearchResults(response.data.outpass);
                if (response.data.outpass.length === 0) {
                    toast.info("No matching outpasses found");
                }
            }
        } catch (err: any) {
            console.error(err);
            const msg = err.response?.data?.message || 'Failed to search outpasses';
            toast.error(msg);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleStatusUpdate = async (type: 'in' | 'out') => {
        if (!scannedId) return;
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/warden/outpass/${scannedId}/${type}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.status === 200) {
                toast.success(`Outpass marked as ${type.toUpperCase()} successfully`);
                resetScan();
            }
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || `Failed to mark outpass as ${type.toUpperCase()}`);
        }
    };

    const handleInClick = () => {
        if (!outpassData) return;
        const now = new Date();
        const expectedReturn = new Date(outpassData.toDate);
        if (now > expectedReturn) {
            setShowLateModal(true);
        } else {
            handleStatusUpdate('in');
        }
    };

    const resetScan = () => {
        setScannedId(null);
        setOutpassData(null);
        setError(null);
        setImageError(false);
        setSearchQuery('');
        setSearchResults([]);
    };

    // Calculate avatar source
    const studentPhoto = outpassData?.studentid?.photo || outpassData?.student?.photo;
    const avatarSrc = studentPhoto
        ? (studentPhoto.startsWith('data:')
            ? studentPhoto
            : `${studentPhoto}`)
        : null;

    const studentName = outpassData?.studentid?.name || outpassData?.student?.name || "Student";
    const registerNumber = outpassData?.studentid?.registerNumber || outpassData?.student?.registerNumber || "N/A";
    const department = outpassData?.studentid?.department || outpassData?.student?.department || "-";

    return (
        <div className="sd-root">
            <WardenNav />
            <ToastContainer position="top-center" />

            <main className="sd-main">
                <div className="sd-container">

                    {/* Header Row */}
                    <div className="sd-header-row">
                        <div>
                            <button className="sd-back-btn" onClick={() => navigate("/warden-dashboard")}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 12H5M12 5l-7 7 7 7" />
                                </svg>
                                Back to Dashboard
                            </button>
                            <h1 className="sd-title">Hostel QR Verification</h1>
                            <p className="sd-subtitle">Scan student outpass QR code for exit and entry authorization</p>
                        </div>
                    </div>

                    {/* Scan & Results Layout Card */}
                    <div className="sd-scanner-card">
                        {!scannedId ? (
                            <div className="sd-scanner-init">
                                {/* Tab Selector */}
                                <div className="sd-tabs-container">
                                    <button
                                        className={`sd-tab-btn ${activeTab === 'scan' ? 'active' : ''}`}
                                        onClick={() => {
                                            setActiveTab('scan');
                                            resetScan();
                                        }}
                                    >
                                        📷 Scan QR Code
                                    </button>
                                    <button
                                        className={`sd-tab-btn ${activeTab === 'search' ? 'active' : ''}`}
                                        onClick={() => {
                                            setActiveTab('search');
                                            resetScan();
                                        }}
                                    >
                                        🔍 Search Outpass
                                    </button>
                                </div>

                                {activeTab === 'scan' ? (
                                    <div className="sd-tab-content active-tab-content">
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
                                    <div className="sd-tab-content active-tab-content" style={{ width: '100%' }}>
                                        <div className="sd-scanner-instructions">
                                            <span className="sd-scanner-tip-icon">🔍</span>
                                            <p className="sd-scanner-tip-text">Enter student name or register number to look up their outpass manually.</p>
                                        </div>

                                        <div className="sd-manual-search-section">
                                            <form onSubmit={handleSearch} className="sd-search-form">
                                                <input
                                                    type="text"
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    placeholder="Search name or register number..."
                                                    className="sd-search-input"
                                                />
                                                <button type="submit" disabled={searchLoading} className="sd-search-btn">
                                                    {searchLoading ? 'Searching...' : '🔍 Search'}
                                                </button>
                                            </form>

                                            {/* Search Results */}
                                            {searchResults.length > 0 && (
                                                <div className="sd-search-results-list">
                                                    {searchResults.map((outpass) => {
                                                        const studentName = outpass.student?.name || outpass.name || "Student";
                                                        const studentReg = outpass.student?.registerNumber || outpass.registerNumber || "N/A";
                                                        const studentDept = outpass.student?.department || outpass.department || "-";
                                                        return (
                                                            <div
                                                                key={outpass._id}
                                                                className="sd-search-result-item"
                                                                onClick={() => {
                                                                    setScannedId(outpass._id);
                                                                    setLoadedFrom('search');
                                                                    fetchOutpass(outpass._id);
                                                                    setSearchResults([]);
                                                                    setSearchQuery('');
                                                                }}
                                                            >
                                                                <div className="sd-result-student-info">
                                                                    <span className="sd-result-name">{studentName}</span>
                                                                    <span className="sd-result-reg">{studentReg} - {studentDept}</span>
                                                                </div>
                                                                <div className="sd-result-outpass-meta">
                                                                    <span className="sd-result-type">{outpass.outpasstype}</span>
                                                                    <span className={`sd-result-status-pill ${outpass.status || 'pending'}`}>
                                                                        {outpass.status || 'pending'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
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
                                        <h2 className="sd-error-header">Access Denied / Verification Failed</h2>
                                        <p className="sd-error-desc">{error}</p>
                                        <button onClick={resetScan} className="sd-action-btn sd-btn-retry">
                                            Scan Another QR
                                        </button>
                                    </div>
                                )}

                                {outpassData && !loading && (
                                    <div className="sd-result-success">
                                        <div className="sd-success-banner">
                                            <span className="sd-success-checkmark">✓</span>
                                            <div>
                                                <h2 className="sd-success-title">Verified Approved Outpass</h2>
                                                <p className="sd-success-subtitle">Hostel Gate Pass Validated</p>
                                            </div>
                                        </div>

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
                                                            {studentName.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="sd-student-identity">
                                                    <h3 className="sd-student-name">{studentName}</h3>
                                                    <span className="sd-student-reg sd-mono">{registerNumber}</span>
                                                    <span className="sd-student-dept">{department}</span>
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
                                                    <span className="value" style={{ color: '#10B981', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.88rem' }}>
                                                        {outpassData.status || 'Approved'}
                                                    </span>
                                                </div>
                                                <div className="sd-detail-item full-width">
                                                    <span className="label">Reason</span>
                                                    <p className="value-p">{outpassData.reason || "N/A"}</p>
                                                </div>
                                                <div className="sd-detail-item">
                                                    <span className="label">Marked Out (Hostel Exit)</span>
                                                    <span className="value sd-timestamp">
                                                        {outpassData.out ? new Date(outpassData.out).toLocaleString() : 'Not Checked Out'}
                                                    </span>
                                                </div>
                                                <div className="sd-detail-item">
                                                    <span className="label">Marked In (Hostel Entry)</span>
                                                    <span className="value sd-timestamp">
                                                        {outpassData.in ? new Date(outpassData.in).toLocaleString() : 'Not Checked In'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Scan action buttons */}
                                            <div className="sd-result-actions">
                                                {!outpassData.out ? (
                                                    <button
                                                        onClick={() => handleStatusUpdate('out')}
                                                        className="sd-action-btn sd-btn-out"
                                                        style={{ width: '100%', maxWidth: 'none' }}
                                                    >
                                                        🚪 Mark Student OUT
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={handleInClick}
                                                        disabled={outpassData.in !== null}
                                                        className="sd-action-btn sd-btn-in"
                                                        style={{ width: '100%', maxWidth: 'none' }}
                                                    >
                                                        🏠 Mark Student IN
                                                    </button>
                                                )}
                                            </div>

                                            <button onClick={resetScan} className="sd-btn-reset-bottom">
                                                Scan Next QR Code
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {showLateModal && (
                        <div className="sd-modal-overlay" onClick={() => setShowLateModal(false)}>
                            <div className="sd-modal-card" onClick={(e) => e.stopPropagation()}>
                                <div className="sd-modal-header">
                                    <h3>🚨 Late Return Warning</h3>
                                    <button className="sd-close-btn" onClick={() => setShowLateModal(false)}>✕</button>
                                </div>
                                <div className="sd-modal-body">
                                    <div className="sd-warning-icon">⏳</div>
                                    <p className="sd-warning-text">
                                        This student has exceeded their allowed outpass return time (expected back by {outpassData ? new Date(outpassData.toDate).toLocaleString() : ''}).
                                    </p>
                                    <p className="sd-warning-subtext">
                                        The check-in will be logged and marked as <strong>LATE</strong> in the system registry. Do you wish to proceed?
                                    </p>
                                </div>
                                <div className="sd-modal-footer">
                                    <button className="sd-btn-cancel" onClick={() => setShowLateModal(false)}>Cancel</button>
                                    <button
                                        className="sd-btn-confirm"
                                        onClick={() => {
                                            setShowLateModal(false);
                                            handleStatusUpdate('in');
                                        }}
                                    >
                                        Confirm Check-In
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </main>

            <style>{`
                /* ====== ROOT LAYOUT ====== */
                .sd-root {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 45%, #DBEAFE 100%);
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                    padding-top: var(--nav-height, 64px);
                    padding-bottom: calc(100px + env(safe-area-inset-bottom));
                }

                .sd-main {
                    padding: 24px 32px;
                    max-width: var(--content-max, 1280px);
                    margin: 0 auto;
                }

                .sd-container {
                    display: flex;
                    flex-direction: column;
                    gap: 28px;
                }

                /* ====== HEADER ROW ====== */
                .sd-header-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    flex-wrap: wrap;
                    gap: 20px;
                }

                .sd-back-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: white;
                    border: 1px solid #E2E8F0;
                    color: #0047AB;
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
                    box-shadow: 0 6px 12px rgba(0, 71, 171, 0.08);
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

                /* ====== SCANNER CARD ====== */
                .sd-scanner-card {
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border: 1px solid rgba(255, 255, 255, 0.7);
                    border-radius: 24px;
                    padding: 40px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.03), 0 0 0 1px rgba(226,232,240,0.5);
                    max-width: 600px;
                    margin: 0 auto;
                    width: 100%;
                    box-sizing: border-box;
                }

                /* Scanner Init Mode */
                .sd-scanner-init {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 32px;
                }

                .sd-scanner-instructions {
                    text-align: center;
                    max-width: 380px;
                }

                .sd-scanner-tip-icon {
                    font-size: 2.5rem;
                    display: block;
                    margin-bottom: 12px;
                }

                .sd-scanner-tip-text {
                    font-size: 0.95rem;
                    color: #64748B;
                    font-weight: 500;
                    line-height: 1.5;
                    margin: 0;
                }

                .sd-scanner-viewport-wrapper {
                    position: relative;
                    width: 280px;
                    height: 280px;
                    border-radius: 24px;
                    overflow: hidden;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                    border: 4px solid #1E293B;
                }

                .sd-scanner-glow-border {
                    position: absolute;
                    inset: 0;
                    border: 3px solid #0047AB;
                    border-radius: 20px;
                    pointer-events: none;
                    z-index: 10;
                    box-shadow: 0 0 15px rgba(0, 71, 171, 0.5);
                }

                .sd-scanner-laser-line {
                    position: absolute;
                    left: 0;
                    width: 100%;
                    height: 3px;
                    background: linear-gradient(90deg, transparent, #3B82F6, transparent);
                    z-index: 9;
                    pointer-events: none;
                    animation: scannerSweep 2s ease-in-out infinite;
                    box-shadow: 0 0 10px #3B82F6;
                }

                .sd-scanner-element {
                    width: 100%;
                    height: 100%;
                }

                .sd-scanner-element video {
                    object-fit: cover !important;
                }

                /* ====== RESULTS DISPLAY ====== */
                .sd-scanner-results {
                    width: 100%;
                }

                .sd-result-loading {
                    text-align: center;
                    padding: 40px 0;
                }

                .sd-loader-spin {
                    width: 48px;
                    height: 48px;
                    border: 4px solid #E2E8F0;
                    border-top-color: #0047AB;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                    margin: 0 auto 20px;
                }

                .sd-result-loading h3 {
                    margin: 0 0 6px;
                    font-size: 1.1rem;
                    color: #0F172A;
                }

                .sd-result-loading p {
                    margin: 0;
                    font-size: 0.85rem;
                    color: #64748B;
                }

                /* Error results */
                .sd-result-error {
                    text-align: center;
                    padding: 20px 0;
                }

                .sd-error-badge-large {
                    font-size: 3.5rem;
                    margin-bottom: 20px;
                }

                .sd-error-header {
                    font-size: 1.35rem;
                    font-weight: 800;
                    color: #EF4444;
                    margin: 0 0 10px;
                }

                .sd-error-desc {
                    font-size: 0.95rem;
                    color: #64748B;
                    line-height: 1.5;
                    margin: 0 0 32px;
                }

                /* Success Results */
                .sd-result-success {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }

                .sd-success-banner {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    background: #ECFDF5;
                    border: 1px solid rgba(16, 185, 129, 0.2);
                    padding: 16px 20px;
                    border-radius: 16px;
                }

                .sd-success-checkmark {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: #10B981;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    font-size: 1.1rem;
                }

                .sd-success-title {
                    font-size: 1rem;
                    font-weight: 800;
                    color: #065F46;
                    margin: 0;
                }

                .sd-success-subtitle {
                    font-size: 0.8rem;
                    color: #047857;
                    margin: 2px 0 0;
                    font-weight: 600;
                }

                /* Student profile strip */
                .sd-student-profile-strip {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    padding-bottom: 20px;
                    border-bottom: 1px solid #E2E8F0;
                }

                .sd-student-avatar-wrap {
                    width: 64px;
                    height: 64px;
                    border-radius: 50%;
                    overflow: hidden;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.06);
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
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #0047AB 0%, #2563EB 100%);
                    color: white;
                    font-weight: 700;
                    font-size: 1.6rem;
                }

                .sd-student-identity {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .sd-student-name {
                    font-size: 1.2rem;
                    font-weight: 800;
                    color: #0F172A;
                    margin: 0;
                }

                .sd-student-reg {
                    font-size: 0.88rem;
                    color: #64748B;
                    font-weight: 600;
                }

                .sd-student-dept {
                    font-size: 0.8rem;
                    color: #64748B;
                    font-weight: 500;
                }

                /* Details grid */
                .sd-details-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 16px;
                    background: #F8FAFC;
                    border: 1px solid rgba(226,232,240,0.6);
                    padding: 20px;
                    border-radius: 16px;
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
                    color: #94A3B8;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.02em;
                }

                .sd-detail-item .value {
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: #334155;
                }

                .sd-detail-item .value-p {
                    font-size: 0.88rem;
                    color: #475569;
                    font-weight: 500;
                    margin: 0;
                    line-height: 1.4;
                }

                .sd-pill-type {
                    display: inline-flex;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-size: 0.72rem;
                    text-transform: uppercase;
                    background: #EFF6FF;
                    color: #0047AB;
                    width: fit-content;
                }

                .sd-pill-type.emergency {
                    background: #FEF2F2;
                    color: #EF4444;
                }

                .sd-timestamp {
                    color: #0F172A;
                    font-family: 'SF Mono', monospace;
                }

                /* Interactive actions */
                .sd-result-actions {
                    display: flex;
                    gap: 16px;
                    margin-top: 10px;
                }

                .sd-action-btn {
                    flex: 1;
                    padding: 14px 20px;
                    border: none;
                    border-radius: 12px;
                    font-weight: 700;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.02);
                }

                .sd-btn-out {
                    background: #EF4444;
                    color: white;
                }

                .sd-btn-out:hover:not(:disabled) {
                    background: #DC2626;
                    box-shadow: 0 6px 16px rgba(239,68,68,0.3);
                    transform: translateY(-2px);
                }

                .sd-btn-in {
                    background: #10B981;
                    color: white;
                }

                .sd-btn-in:hover:not(:disabled) {
                    background: #059669;
                    box-shadow: 0 6px 16px rgba(16,185,129,0.3);
                    transform: translateY(-2px);
                }

                .sd-action-btn:disabled {
                    opacity: 0.45;
                    cursor: not-allowed;
                    transform: none !important;
                    box-shadow: none !important;
                }

                .sd-btn-retry {
                    width: 100%;
                    max-width: 240px;
                    background: #0047AB;
                    color: white;
                    margin: 0 auto;
                }

                .sd-btn-retry:hover {
                    background: #003682;
                    box-shadow: 0 4px 12px rgba(0,71,171,0.25);
                }

                .sd-btn-reset-bottom {
                    background: transparent;
                    border: 1px dashed #CBD5E1;
                    color: #64748B;
                    padding: 10px;
                    border-radius: 10px;
                    cursor: pointer;
                    font-weight: 700;
                    font-size: 0.85rem;
                    transition: all 0.2s ease;
                    margin-top: 10px;
                }

                .sd-btn-reset-bottom:hover {
                    border-color: #0047AB;
                    color: #0047AB;
                    background: #EFF6FF;
                }

                .sd-mono {
                    font-family: 'SF Mono', 'Fira Code', monospace;
                    font-weight: 600;
                }

                /* Keyframes */
                @keyframes scannerSweep {
                    0% { top: 0%; }
                    50% { top: 100%; }
                    100% { top: 0%; }
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                /* ====== RESPONSIVE ====== */
                @media (max-width: 768px) {
                    .sd-main { padding: 16px 16px 0; }
                    .sd-header-row { flex-direction: column; align-items: stretch; gap: 16px; margin-bottom: 8px; }
                    .sd-scanner-card { padding: 24px 20px; border-radius: 20px; }
                    .sd-title { font-size: 1.5rem; }
                    
                    .sd-details-grid { grid-template-columns: 1fr; gap: 12px; }
                    .sd-detail-item.full-width { grid-column: span 1; }
                    .sd-result-actions { flex-direction: column; gap: 12px; }
                    
                    .sd-student-profile-strip { flex-direction: column; text-align: center; gap: 12px; padding-bottom: 16px; }
                    .sd-student-identity { align-items: center; }
                    
                    .sd-error-header { font-size: 1.2rem; }
                    .sd-success-title { font-size: 0.95rem; }
                }

                /* ====== MANUAL SEARCH ====== */
                .sd-manual-search-section {
                    width: 100%;
                    max-width: 480px;
                    margin: 0 auto;
                }

                .sd-search-form {
                    display: flex;
                    gap: 10px;
                    width: 100%;
                }

                .sd-search-input {
                    flex: 1;
                    padding: 12px 18px;
                    border: 2px solid #E2E8F0;
                    border-radius: 12px;
                    font-size: 0.95rem;
                    font-family: inherit;
                    color: #1F2937;
                    background: white;
                    outline: none;
                    transition: all 0.25s ease;
                }

                .sd-search-input:focus {
                    border-color: #0047AB;
                    box-shadow: 0 0 0 3px rgba(0, 71, 171, 0.1);
                }

                .sd-search-btn {
                    padding: 12px 20px;
                    background: linear-gradient(135deg, #0047AB, #005FDF);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.25s ease;
                    box-shadow: 0 4px 10px rgba(0, 71, 171, 0.15);
                    font-size: 0.9rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .sd-search-btn:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 6px 15px rgba(0, 71, 171, 0.25);
                }

                .sd-search-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .sd-divider {
                    display: flex;
                    align-items: center;
                    width: 100%;
                    max-width: 480px;
                    margin: 16px 0;
                    color: #94A3B8;
                    font-size: 0.8rem;
                    font-weight: 700;
                    letter-spacing: 0.5px;
                }

                .sd-divider::before,
                .sd-divider::after {
                    content: '';
                    flex: 1;
                    height: 1px;
                    background: #E2E8F0;
                }

                .sd-divider span {
                    padding: 0 12px;
                }

                .sd-search-results-list {
                    background: white;
                    border: 1px solid #E2E8F0;
                    border-radius: 16px;
                    margin-top: 12px;
                    max-height: 240px;
                    overflow-y: auto;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.05);
                    display: flex;
                    flex-direction: column;
                }

                .sd-search-result-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 14px 20px;
                    border-bottom: 1px solid #F1F5F9;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    text-align: left;
                }

                .sd-search-result-item:last-child {
                    border-bottom: none;
                }

                .sd-search-result-item:hover {
                    background: #F8FAFC;
                }

                .sd-result-student-info {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .sd-result-name {
                    font-weight: 700;
                    color: #1E293B;
                    font-size: 0.95rem;
                }

                .sd-result-reg {
                    font-size: 0.8rem;
                    color: #64748B;
                    font-weight: 500;
                }

                .sd-result-outpass-meta {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    gap: 6px;
                }

                .sd-result-type {
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: #0047AB;
                    background: #EFF6FF;
                    padding: 3px 8px;
                    border-radius: 6px;
                }

                .sd-result-status-pill {
                    font-size: 0.7rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    padding: 2px 8px;
                    border-radius: 20px;
                }

                .sd-result-status-pill.approved {
                    background: #DCFCE7;
                    color: #166534;
                    border: 1px solid #86EFAC;
                }

                .sd-result-status-pill.pending {
                    background: #F3F4F6;
                    color: #4B5563;
                    border: 1px solid #D1D5DB;
                }

                /* ====== TABS SYSTEM ====== */
                .sd-tabs-container {
                    display: flex;
                    gap: 12px;
                    width: 100%;
                    max-width: 480px;
                    margin: 0 auto 24px;
                    border-bottom: 2px solid #E2E8F0;
                    padding-bottom: 8px;
                }

                .sd-tab-btn {
                    flex: 1;
                    padding: 12px 16px;
                    background: transparent;
                    border: none;
                    color: #64748B;
                    font-size: 0.95rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.25s ease;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }

                .sd-tab-btn:hover {
                    color: #0047AB;
                    background: #F1F5F9;
                }

                .sd-tab-btn.active {
                    color: #0047AB;
                    background: #EFF6FF;
                }

                .sd-tab-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 24px;
                    width: 100%;
                }

                /* ====== LATE DIALOG MODAL ====== */
                .sd-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(15, 23, 42, 0.45);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }

                .sd-modal-card {
                    background: white;
                    border-radius: 20px;
                    width: 90%;
                    max-width: 460px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
                    overflow: hidden;
                }

                .sd-modal-header {
                    background: #FEF2F2;
                    padding: 16px 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid #FEE2E2;
                }

                .sd-modal-header h3 {
                    margin: 0;
                    color: #991B1B;
                    font-size: 1.1rem;
                    font-weight: 700;
                }

                .sd-close-btn {
                    background: transparent;
                    border: none;
                    color: #991B1B;
                    width: 28px;
                    height: 28px;
                    border-radius: 6px;
                    font-size: 1rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }

                .sd-close-btn:hover {
                    background: rgba(153, 27, 27, 0.1);
                }

                .sd-modal-body {
                    padding: 24px;
                    text-align: center;
                }

                .sd-warning-icon {
                    font-size: 3rem;
                    margin-bottom: 16px;
                }

                .sd-warning-text {
                    font-weight: 700;
                    color: #1F2937;
                    font-size: 1rem;
                    line-height: 1.5;
                    margin: 0 0 12px 0;
                }

                .sd-warning-subtext {
                    font-size: 0.9rem;
                    color: #64748B;
                    line-height: 1.5;
                    margin: 0;
                }

                .sd-modal-footer {
                    padding: 0 24px 24px 24px;
                    display: flex;
                    gap: 12px;
                    justify-content: flex-end;
                }

                .sd-btn-cancel {
                    padding: 10px 20px;
                    border: none;
                    border-radius: 10px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s;
                    background: #F1F5F9;
                    color: #475569;
                    font-size: 0.9rem;
                }

                .sd-btn-cancel:hover {
                    background: #E2E8F0;
                }

                .sd-btn-confirm {
                    padding: 10px 20px;
                    border: none;
                    border-radius: 10px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s;
                    background: #EF4444;
                    color: white;
                    font-size: 0.9rem;
                    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
                }

                .sd-btn-confirm:hover {
                    background: #DC2626;
                    box-shadow: 0 6px 16px rgba(239, 68, 68, 0.3);
                }
            `}</style>
        </div>
    );
};

export default WardenScanQR;
