import React, { useState } from 'react';
import WatchmanNav from '../../components/WatchmanNav';
import { useNavigate } from 'react-router-dom';
import { Scanner } from '@yudiel/react-qr-scanner';
import { toast, ToastContainer } from 'react-toastify';

const WatchmanScanQR: React.FC = () => {
    const navigate = useNavigate();
    const [scannedData, setScannedData] = useState<string | null>(null);

    const handleScan = (text: string) => {
        if (text && text !== scannedData) {
            setScannedData(text);
            toast.success("QR Scanned successfully!");
        }
    };

    return (
        <div className="page-container dashboard-page">
            <WatchmanNav />
            <ToastContainer position="top-center" />
            <div className="content-wrapper">
                <div className="header-row" style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                    <button className="back-btn" onClick={() => navigate("/watchman-dashboard")}>
                        ← Back
                    </button>
                    <h1 style={{ marginLeft: '16px', color: '#1e3a8a', fontSize: '22px' }}>Scan QR Code</h1>
                </div>

                <div className="scanner-container" style={{ background: 'white', padding: '24px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.06)' }}>
                    {!scannedData ? (
                        <>
                            <p style={{ textAlign: 'center', marginBottom: '20px', color: '#64748b' }}>Point the camera at the student's QR code to scan.</p>
                            <div style={{ maxWidth: '400px', margin: '0 auto', borderRadius: '16px', overflow: 'hidden' }}>
                                <Scanner
                                    onScan={(result) => handleScan(result[0].rawValue)}
                                    onError={(error) => console.log(error?.message)}
                                />
                            </div>
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                            <div style={{ fontSize: '48px', marginBottom: '20px' }}>✅</div>
                            <h2 style={{ color: '#1e3a8a', marginBottom: '16px' }}>Scanned Data</h2>
                            <div style={{ background: '#f1f5f9', padding: '16px', borderRadius: '12px', wordBreak: 'break-all', marginBottom: '24px', fontSize: '18px', fontWeight: 'bold' }}>
                                {scannedData}
                            </div>
                            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                                <button
                                    onClick={() => setScannedData(null)}
                                    style={{ padding: '12px 24px', borderRadius: '12px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                    Scan Another
                                </button>
                                {/* We could add functionality here to verify this ID against the backend */}
                                <button
                                    onClick={() => toast.info('Verification feature can be linked here.')}
                                    style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', background: '#2563eb', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                    Verify Pass
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .back-btn {
                    background: white;
                    border: 1px solid #cbd5e1;
                    font-size: 16px;
                    color: #1e3a8a;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.3s ease;
                    padding: 10px 24px;
                    border-radius: 50px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    font-weight: 600;
                }
                .back-btn:hover {
                    background: #f1f5f9;
                    transform: translateX(-5px);
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                }
            `}</style>
        </div>
    );
};

export default WatchmanScanQR;
