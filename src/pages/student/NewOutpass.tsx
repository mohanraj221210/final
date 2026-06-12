import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import StudentHeader from '../../components/StudentHeader';
import StudentBottomNav from '../../components/StudentBottomNav';

const Outpass: React.FC = () => {
    const navigate = useNavigate();
    
    // Core state
    const [formData, setFormData] = useState({
        outpasstype: 'Outing',
        fromDate: '',
        toDate: '',
        reason: '',
        skillrack: '',
        attendance: ''
    });

    const [activeStep, setActiveStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [residenceType, setResidenceType] = useState<string>('');
    const [hasPendingOutpass, setHasPendingOutpass] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);

    const now = new Date();
    const currentHour = now.getHours();
    const isPortalOpen = currentHour >= 6 && currentHour < 10;
    const isEmergency = formData.outpasstype === 'Emergency';

    const getMinFromDateTime = () => {
        const minD = new Date();
        if (formData.outpasstype !== 'Emergency') {
            minD.setDate(minD.getDate() + 1);
            minD.setHours(0, 0, 0, 0);
        }

        const year = minD.getFullYear();
        const month = String(minD.getMonth() + 1).padStart(2, '0');
        const day = String(minD.getDate()).padStart(2, '0');
        const hours = String(minD.getHours()).padStart(2, '0');
        const minutes = String(minD.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    useEffect(() => {
        const checkProfile = async () => {
            try {
                const token = localStorage.getItem('token');

                // Fetch Profile and Outpasses in parallel
                const [profileResponse, outpassResponse] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_API_URL}/api/profile`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    axios.get(`${import.meta.env.VITE_API_URL}/api/outpass`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                ]);

                if (profileResponse.status === 200) {
                    const user = profileResponse.data.user;
                    setResidenceType(user.residencetype?.toLowerCase() || '');

                    // Pre-select OD for day scholars
                    if (user.residencetype?.toLowerCase() === 'day scholar') {
                        setFormData(prev => ({ ...prev, outpasstype: 'OD' }));
                    }

                    const isProfileComplete = () => {
                        if (!user.name || !user.registerNumber || !user.department || !user.year ||
                            !user.phone || !user.email || !user.parentnumber || !user.residencetype || !user.photo) {
                            return false;
                        }

                        if (user.residencetype === 'hostel') {
                            if (!user.hostelname || !user.hostelroomno) return false;
                        } else if (user.residencetype === 'day scholar') {
                            if (!user.busno || !user.boardingpoint) return false;
                        }
                        return true;
                    };

                    if (!isProfileComplete()) {
                        toast.error("Please complete your profile first");
                        navigate('/dashboard');
                        return;
                    }
                }

                if (outpassResponse.status === 200) {
                    const outpasses = outpassResponse.data.outpasses || [];
                    const pendingOutpass = outpasses.find((op: any) => op.status === 'pending');

                    if (pendingOutpass) {
                        setHasPendingOutpass(true);
                        toast.warning("You have a pending outpass application.");
                    }
                }

            } catch (error) {
                console.error("Error checking profile:", error);
            }
        };
        checkProfile();
    }, [navigate]);

    const validateAndSetFile = (file: File) => {
        // Validate file type (PDF only)
        if (file.type !== 'application/pdf') {
            toast.error('Only PDF files are allowed');
            return;
        }

        // Validate file size (max 200KB)
        const maxSize = 200 * 1024; // 200KB in bytes
        if (file.size > maxSize) {
            toast.error('File size must be less than 200KB');
            return;
        }

        setSelectedFile(file);
        toast.success(`Selected file: ${file.name}`);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            validateAndSetFile(e.target.files[0]);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndSetFile(e.dataTransfer.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (!isEmergency && !isPortalOpen) {
            toast.error("Portal is open from 6:00 AM to 10:00 AM only.");
            setIsSubmitting(false);
            return;
        }

        if (!isEmergency && formData.fromDate) {
            const selectedDate = new Date(formData.fromDate);
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            if (selectedDate < tomorrow) {
                toast.error("Non-emergency outpass must be applied at least one day in advance.");
                setIsSubmitting(false);
                return;
            }
        }

        try {
            const token = localStorage.getItem('token');
            const submitData = new FormData();
            submitData.append('outpasstype', formData.outpasstype);
            submitData.append('fromDate', formData.fromDate);
            submitData.append('toDate', formData.toDate);
            submitData.append('reason', formData.reason);
            submitData.append('skillrack', formData.skillrack || '');
            submitData.append('attendance', formData.attendance || '');

            if (formData.outpasstype === 'OD' && selectedFile) {
                submitData.append('file', selectedFile);
            }

            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/outpass/apply`,
                submitData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.status === 201 || response.status === 200) {
                toast.success('Outpass application submitted successfully');
                setTimeout(() => navigate('/dashboard'), 2500);
            }
        } catch (error: any) {
            console.error('Error submitting outpass:', error);
            toast.error(error.response?.data?.message || 'Failed to submit application');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleNextStep = () => {
        if (!formData.fromDate || !formData.toDate) {
            toast.warn("Please specify dates and times");
            return;
        }

        const start = new Date(formData.fromDate);
        const end = new Date(formData.toDate);
        if (start >= end) {
            toast.error("From date must be earlier than To date");
            return;
        }

        setActiveStep(2);
    };

    return (
        <div className="student-page outpass-apply-page animate-page-enter">
            <ToastContainer position="bottom-right" />

            {/* ── DESKTOP VIEW ── */}
            <div className="lux-desktop-view">
            <StudentHeader />

            <div className="content-wrapper">
                {/* Back Link & Title */}
                <div className="back-link-wrapper">
                    <button onClick={() => navigate('/dashboard')} className="btn-back">
                        <span className="icon">←</span> Back to Dashboard
                    </button>
                </div>

                <div className="page-header-simple">
                    <h1>Apply Outpass</h1>
                    <p className="subtitle">Request official campus exit approval from faculty and wardens</p>
                </div>

                {/* Step Indicator Header */}
                <div className="stepper-wrapper card animate-stagger-1">
                    <div className={`step-item ${activeStep >= 1 ? 'step-active' : ''}`}>
                        <div className="step-number">1</div>
                        <div className="step-label">Type & Timing</div>
                    </div>
                    <div className="step-connector"></div>
                    <div className={`step-item ${activeStep >= 2 ? 'step-active' : ''}`}>
                        <div className="step-number">2</div>
                        <div className="step-label">Reason & Details</div>
                    </div>
                </div>

                {/* Main Form Box */}
                <div className="card outpass-form-box animate-stagger-2">
                    {activeStep === 1 ? (
                        /* STEP 1: TYPE & TIMING */
                        <div className="step-container">
                            <h3 className="step-title">Step 1: Select Type & Schedule</h3>
                            
                            <div className="form-group">
                                <label className="form-label">Outpass Type</label>
                                <select
                                    name="outpasstype"
                                    value={formData.outpasstype}
                                    onChange={handleChange}
                                    className="input"
                                >
                                    {residenceType === 'day scholar' ? (
                                        <>
                                            <option value="OD">On Duty (OD)</option>
                                            <option value="Emergency">Emergency</option>
                                        </>
                                    ) : (
                                        <>
                                            <option value="Outing">Outing (Town Pass)</option>
                                            <option value="Home">Home Pass</option>
                                            <option value="OD">On Duty (OD)</option>
                                            <option value="Emergency">Emergency</option>
                                        </>
                                    )}
                                </select>
                                {residenceType === 'day scholar' && (
                                    <span className="form-hint" style={{ color: 'var(--primary)', fontWeight: 500 }}>
                                        ℹ️ Only OD and Emergency outpasses are permitted for Day Scholars.
                                    </span>
                                )}
                            </div>

                            <div className="grid-2" style={{ marginTop: '16px' }}>
                                <div className="form-group">
                                    <label className="form-label">From Date & Time</label>
                                    <input
                                        type="datetime-local"
                                        name="fromDate"
                                        value={formData.fromDate}
                                        onChange={handleChange}
                                        min={getMinFromDateTime()}
                                        required
                                        className="input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">To Date & Time</label>
                                    <input
                                        type="datetime-local"
                                        name="toDate"
                                        value={formData.toDate}
                                        onChange={handleChange}
                                        min={formData.fromDate || getMinFromDateTime()}
                                        required
                                        className="input"
                                    />
                                </div>
                            </div>

                            {/* Notifications / Warn Panels */}
                            {!isEmergency && !isPortalOpen && (
                                <div className="notice-panel panel-warning" style={{ marginTop: '24px' }}>
                                    <strong>Portal Closed:</strong> Outpass submissions (except Emergency) are strictly open from 6:00 AM to 10:00 AM daily.
                                </div>
                            )}

                            {hasPendingOutpass && (
                                <div className="notice-panel panel-danger" style={{ marginTop: '24px' }}>
                                    <strong>Duplicate Application:</strong> You already have a pending outpass request. You cannot submit another until the active one is processed.
                                </div>
                            )}

                            <div className="form-navigation" style={{ marginTop: '32px' }}>
                                <div></div>
                                <button 
                                    type="button" 
                                    onClick={handleNextStep} 
                                    className="btn btn-primary"
                                    style={{ minWidth: '160px' }}
                                >
                                    Continue →
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* STEP 2: REASON & VERIFICATION */
                        <form onSubmit={handleSubmit} className="step-container">
                            <h3 className="step-title">Step 2: Verification Details</h3>

                            <div className="form-group">
                                <label className="form-label">Detailed Reason for Leave</label>
                                <textarea
                                    name="reason"
                                    value={formData.reason}
                                    onChange={handleChange}
                                    required
                                    maxLength={250}
                                    rows={4}
                                    placeholder="State clear reasons for your leave application (max 250 characters)..."
                                    className="input"
                                ></textarea>
                                <div className="char-count-indicator">
                                    {formData.reason.length} / 250 characters
                                </div>
                            </div>

                            <div className="grid-2" style={{ marginTop: '16px' }}>
                                <div className="form-group">
                                    <label className="form-label">SkillRack Problems Solved</label>
                                    <input
                                        type="text"
                                        name="skillrack"
                                        value={formData.skillrack}
                                        onChange={handleChange}
                                        placeholder="Enter problem count"
                                        className="input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Attendance Percentage (%)</label>
                                    <input
                                        type="number"
                                        name="attendance"
                                        value={formData.attendance}
                                        onChange={handleChange}
                                        placeholder="e.g. 85"
                                        min="0"
                                        max="100"
                                        className="input"
                                    />
                                </div>
                            </div>

                            {/* CONDITIONAL PDF DROPZONE */}
                            {formData.outpasstype === 'OD' && (
                                <div className="form-group" style={{ marginTop: '24px' }}>
                                    <label className="form-label">Upload Supporting Document (PDF under 200KB)</label>
                                    <div 
                                        className={`dropzone-box ${dragActive ? 'drag-active' : ''} ${selectedFile ? 'has-file' : ''}`}
                                        onDragEnter={handleDrag}
                                        onDragOver={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDrop={handleDrop}
                                    >
                                        <input
                                            type="file"
                                            id="file-upload-input"
                                            accept=".pdf"
                                            onChange={handleFileChange}
                                            required={formData.outpasstype === 'OD'}
                                            style={{ display: 'none' }}
                                        />
                                        
                                        {!selectedFile ? (
                                            <label htmlFor="file-upload-input" className="dropzone-label">
                                                <span className="dropzone-icon">📄</span>
                                                <span className="dropzone-text-primary">Drag & drop your PDF or click to browse</span>
                                                <span className="dropzone-text-secondary">Only PDF format supported (Max 200KB)</span>
                                            </label>
                                        ) : (
                                            <div className="selected-file-preview">
                                                <span className="preview-icon">📂</span>
                                                <div className="file-details">
                                                    <span className="file-name">{selectedFile.name}</span>
                                                    <span className="file-size">{(selectedFile.size / 1024).toFixed(1)} KB</span>
                                                </div>
                                                <button 
                                                    type="button" 
                                                    onClick={() => setSelectedFile(null)} 
                                                    className="btn-remove-file"
                                                    title="Remove File"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Submit / Back Controls */}
                            <div className="form-navigation" style={{ marginTop: '32px' }}>
                                <button 
                                    type="button" 
                                    onClick={() => setActiveStep(1)} 
                                    className="btn btn-surface"
                                    style={{ minWidth: '120px' }}
                                >
                                    ← Back
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn btn-primary submit-btn" 
                                    disabled={isSubmitting || hasPendingOutpass || (!isEmergency && !isPortalOpen)}
                                    style={{ minWidth: '200px' }}
                                >
                                    {isSubmitting ? 'Submitting...' : (hasPendingOutpass ? 'Pending Request Active' : (!isEmergency && !isPortalOpen ? 'Portal Closed' : 'Submit Outpass'))}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
            </div>{/* end desktop */}

            {/* ── MOBILE VIEW ── */}
            <div className="lux-mobile-view cred-page-bg">
                {/* Mobile Header */}
                <div className="mob-page-header">
                    <button className="mob-back-btn" onClick={() => navigate('/dashboard')}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                    </button>
                    <div className="mob-header-text">
                        <span className="cred-h2" style={{fontSize: '18px'}}>Apply Outpass</span>
                        <span className="cred-p" style={{fontSize: '12px'}}>Official exit request</span>
                    </div>
                    <div style={{width: 36}} />
                </div>

                <div className="mob-scroll-body">
                    {/* Step Indicator */}
                    <div className="cred-card mob-step-indicator animate-cred-enter cred-stagger-1">
                        <div className={`mob-step-pill ${activeStep >= 1 ? 'mob-step-active' : ''}`}>
                            <span className="mob-step-num">1</span>
                            <span>Type & Timing</span>
                        </div>
                        <div className="mob-step-line" />
                        <div className={`mob-step-pill ${activeStep >= 2 ? 'mob-step-active' : ''}`}>
                            <span className="mob-step-num">2</span>
                            <span>Details</span>
                        </div>
                    </div>

                    {/* Portal Status Banner */}
                    {!isEmergency && !isPortalOpen && (
                        <div className="mob-alert-card mob-alert-warning animate-cred-enter cred-stagger-2">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                            <span>Portal is open <strong>6:00 AM – 10:00 AM</strong> only (except Emergency)</span>
                        </div>
                    )}

                    {hasPendingOutpass && (
                        <div className="mob-alert-card mob-alert-danger animate-cred-enter cred-stagger-2">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                            <span>You have an active pending outpass request</span>
                        </div>
                    )}

                    {activeStep === 1 ? (
                        /* STEP 1 */
                        <div className="cred-card mob-form-card animate-cred-enter cred-stagger-3">
                            <h3 className="mob-form-section-title">Outpass Type</h3>
                            <select
                                name="outpasstype"
                                value={formData.outpasstype}
                                onChange={handleChange}
                                className="mob-input"
                            >
                                {residenceType === 'day scholar' ? (
                                    <>
                                        <option value="OD">On Duty (OD)</option>
                                        <option value="Emergency">Emergency</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="Outing">Outing (Town Pass)</option>
                                        <option value="Home">Home Pass</option>
                                        <option value="OD">On Duty (OD)</option>
                                        <option value="Emergency">Emergency</option>
                                    </>
                                )}
                            </select>
                            {residenceType === 'day scholar' && (
                                <p className="cred-p" style={{fontSize: '12px', marginTop: '6px'}}>Only OD & Emergency allowed for Day Scholars</p>
                            )}

                            <h3 className="mob-form-section-title" style={{marginTop: 24}}>Schedule</h3>
                            <div className="mob-form-group">
                                <label className="cred-label">From Date & Time</label>
                                <input
                                    type="datetime-local"
                                    name="fromDate"
                                    value={formData.fromDate}
                                    onChange={handleChange}
                                    min={getMinFromDateTime()}
                                    required
                                    className="mob-input"
                                />
                            </div>
                            <div className="mob-form-group">
                                <label className="cred-label">To Date & Time</label>
                                <input
                                    type="datetime-local"
                                    name="toDate"
                                    value={formData.toDate}
                                    onChange={handleChange}
                                    min={formData.fromDate || getMinFromDateTime()}
                                    required
                                    className="mob-input"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={handleNextStep}
                                className="mob-cta-btn"
                                style={{marginTop: 24}}
                            >
                                Continue →
                            </button>
                        </div>
                    ) : (
                        /* STEP 2 */
                        <form onSubmit={handleSubmit} className="animate-cred-enter cred-stagger-3">
                            <div className="cred-card mob-form-card">
                                <h3 className="mob-form-section-title">Reason for Leave</h3>
                                <textarea
                                    name="reason"
                                    value={formData.reason}
                                    onChange={handleChange}
                                    required
                                    maxLength={250}
                                    rows={4}
                                    placeholder="State your reason clearly (max 250 chars)..."
                                    className="mob-input"
                                    style={{resize: 'vertical', minHeight: '100px'}}
                                />
                                <p className="cred-p" style={{fontSize: '12px', textAlign: 'right', marginTop: '4px'}}>{formData.reason.length} / 250</p>

                                <h3 className="mob-form-section-title" style={{marginTop: 20}}>Verification</h3>
                                <div className="mob-form-group">
                                    <label className="cred-label">SkillRack Problems Solved</label>
                                    <input type="text" name="skillrack" value={formData.skillrack} onChange={handleChange} placeholder="Enter count" className="mob-input" />
                                </div>
                                <div className="mob-form-group">
                                    <label className="cred-label">Attendance Percentage</label>
                                    <input type="number" name="attendance" value={formData.attendance} onChange={handleChange} placeholder="e.g. 85" min="0" max="100" className="mob-input" />
                                </div>

                                {formData.outpasstype === 'OD' && (
                                    <div className="mob-form-group">
                                        <label className="cred-label">Supporting Document (PDF, max 200KB)</label>
                                        <div
                                            className={`mob-dropzone ${dragActive ? 'mob-dropzone-active' : ''} ${selectedFile ? 'mob-dropzone-filled' : ''}`}
                                            onDragEnter={handleDrag}
                                            onDragOver={handleDrag}
                                            onDragLeave={handleDrag}
                                            onDrop={handleDrop}
                                        >
                                            <input type="file" id="mob-file-input" accept=".pdf" onChange={handleFileChange} required={formData.outpasstype === 'OD'} style={{display:'none'}} />
                                            {!selectedFile ? (
                                                <label htmlFor="mob-file-input" className="mob-dropzone-label">
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                                    <span className="cred-p">Tap to upload PDF</span>
                                                    <span className="cred-p" style={{fontSize: '12px'}}>Only PDF • Max 200KB</span>
                                                </label>
                                            ) : (
                                                <div className="mob-file-preview">
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--cred-success)" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                                                    <span className="cred-h2" style={{fontSize: '13px', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{selectedFile.name}</span>
                                                    <button type="button" onClick={() => setSelectedFile(null)} className="mob-file-remove">✕</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="mob-form-nav">
                                    <button type="button" onClick={() => setActiveStep(1)} className="mob-btn-secondary">← Back</button>
                                    <button
                                        type="submit"
                                        className="mob-cta-btn"
                                        disabled={isSubmitting || hasPendingOutpass || (!isEmergency && !isPortalOpen)}
                                        style={{flex: 1}}
                                    >
                                        {isSubmitting ? 'Submitting…' : hasPendingOutpass ? 'Request Active' : (!isEmergency && !isPortalOpen ? 'Portal Closed' : 'Submit Outpass')}
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}
                </div>

                {/* Bottom Navigation */}
                <StudentBottomNav activeTab="outpass" />
            </div>{/* end mobile */}

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

                /* ── DESKTOP VIEWS (RETAINED) ── */
                .outpass-apply-page { background: var(--bg); }
                .back-link-wrapper { margin-bottom: var(--space-4); }
                .btn-back { background: none; border: none; color: var(--primary); font-size: 0.9rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; padding: 8px 12px; border-radius: var(--radius-sm); transition: var(--transition-fast); }
                .btn-back:hover { background: var(--primary-light); color: var(--primary-dark); }
                .page-header-simple { margin-bottom: var(--space-6); }
                .page-header-simple h1 { font-size: 1.8rem; color: var(--text-1); margin: 0 0 6px 0; }
                .page-header-simple .subtitle { font-size: 0.95rem; color: var(--text-3); margin: 0; }
                .stepper-wrapper { display: flex; align-items: center; justify-content: space-between; padding: var(--space-4) var(--space-6) !important; margin-bottom: var(--space-6); background: var(--surface); }
                .step-item { display: flex; align-items: center; gap: var(--space-3); color: var(--text-4); transition: var(--transition); }
                .step-number { width: 32px; height: 32px; border-radius: 50%; background: var(--bg-elevated); color: var(--text-3); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; border: 1px solid var(--border); transition: var(--transition); }
                .step-label { font-size: 0.9rem; font-weight: 600; transition: var(--transition); }
                .step-active { color: var(--primary); }
                .step-active .step-number { background: var(--primary); color: white; border-color: var(--primary); box-shadow: 0 0 0 4px var(--primary-light); }
                .step-connector { flex: 1; height: 2px; background: var(--border); margin: 0 var(--space-4); }
                .outpass-form-box { max-width: 720px; margin: 0 auto; }
                .step-title { font-size: 1.1rem; font-weight: 700; color: var(--text-1); margin-bottom: var(--space-5); border-bottom: 1px solid var(--border); padding-bottom: var(--space-3); }
                .notice-panel { padding: var(--space-4); border-radius: var(--radius-md); font-size: 0.85rem; line-height: 1.5; border: 1px solid transparent; }
                .panel-warning { background: var(--warning-light); border-color: var(--warning-mid); color: #92400E; }
                .panel-danger { background: var(--danger-light); border-color: var(--danger-mid); color: #991B1B; }
                .char-count-indicator { text-align: right; font-size: 0.75rem; color: var(--text-4); margin-top: 4px; }
                .form-navigation { display: flex; justify-content: space-between; align-items: center; }
                .dropzone-box { border: 2px dashed var(--border); border-radius: var(--radius-md); padding: var(--space-6); background: var(--bg); transition: var(--transition); cursor: pointer; display: flex; align-items: center; justify-content: center; min-height: 120px; }
                .dropzone-box:hover, .dropzone-box.drag-active { border-color: var(--primary); background: var(--primary-light); }
                .dropzone-label { display: flex; flex-direction: column; align-items: center; text-align: center; cursor: pointer; width: 100%; }
                .dropzone-icon { font-size: 2.2rem; margin-bottom: var(--space-2); }
                .dropzone-text-primary { font-size: 0.9rem; font-weight: 600; color: var(--text-1); }
                .dropzone-text-secondary { font-size: 0.75rem; color: var(--text-4); margin-top: 4px; }
                .selected-file-preview { display: flex; align-items: center; gap: var(--space-3); background: var(--surface); padding: var(--space-3) var(--space-4); border-radius: var(--radius-sm); border: 1px solid var(--border); width: 100%; }
                .preview-icon { font-size: 1.8rem; }
                .file-details { display: flex; flex-direction: column; flex: 1; min-width: 0; }
                .file-name { font-size: 0.85rem; font-weight: 600; color: var(--text-1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .file-size { font-size: 0.75rem; color: var(--text-4); }
                .btn-remove-file { background: var(--danger-light); color: var(--danger); border: none; width: 28px; height: 28px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-weight: 700; transition: var(--transition-fast); }
                .btn-remove-file:hover { background: var(--danger); color: white; }

                /* ── DESKTOP / MOBILE SPLIT ── */
                .lux-desktop-view { display: block; }
                .lux-mobile-view  { display: none; }
                @media (max-width: 768px) {
                    .lux-desktop-view { display: none !important; }
                    .lux-mobile-view  { display: flex !important; flex-direction: column; min-height: 100vh; background: linear-gradient(135deg, #F7F3E6 0%, #E8EEF5 45%, #C8D9F2 100%); font-family: 'Inter', -apple-system, sans-serif; }
                }

                /* ==========================================
                   CRED PREMIUM MOBILE STYLES (NEW OUTPASS)
                   ========================================== */
                .mob-page-header { display:flex; align-items:center; gap:12px; padding:16px 16px 12px; background:rgba(255,255,255,0.85); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px); position:sticky; top:0; z-index:50; border-bottom: 1px solid rgba(226,232,240,0.6); }
                .mob-back-btn { width:36px; height:36px; border-radius:10px; background:#FFFFFF; border:1px solid #E2E8F0; color:#1E293B; display:flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0; transition:transform 0.2s; }
                .mob-back-btn:active { transform:scale(0.9); }
                .mob-header-text { flex:1; display: flex; flex-direction: column; }

                .mob-scroll-body { flex:1; overflow-y:auto; padding:24px 16px 100px; display:flex; flex-direction:column; gap:20px; }

                /* Step Indicator */
                .mob-step-indicator { display:flex; align-items:center; gap:8px; padding:12px 16px; }
                .mob-step-pill { display:flex; align-items:center; gap:8px; font-size:13px; font-weight:600; color:var(--cred-text-2); flex:1; }
                .mob-step-active { color:var(--cred-gold); }
                .mob-step-num { width:24px; height:24px; border-radius:50%; background:var(--cred-surface-2); color:var(--cred-text-2); display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:800; flex-shrink:0; border: 1px solid var(--cred-border); transition:all 0.2s; }
                .mob-step-active .mob-step-num { background:var(--cred-gold); color:var(--cred-surface); border-color: var(--cred-gold); }
                .mob-step-line { flex:0.3; height:2px; background:var(--cred-border); border-radius:2px; }

                /* Alerts */
                .mob-alert-card { display:flex; align-items:flex-start; gap:10px; padding:14px 16px; border-radius:16px; font-size:13px; font-weight:500; line-height:1.4; }
                .mob-alert-warning { background:rgba(245, 158, 11, 0.1); color:var(--cred-warning); border:1px solid rgba(245, 158, 11, 0.2); }
                .mob-alert-danger  { background:rgba(239, 68, 68, 0.1); color:var(--cred-danger); border:1px solid rgba(239, 68, 68, 0.2); }
                .mob-alert-card svg { flex-shrink:0; margin-top:1px; }

                /* Form Card */
                .mob-form-card { padding:20px; }
                .mob-form-section-title { font-size:14px; font-weight:800; color:var(--cred-text); margin:0 0 16px 0; padding-bottom:8px; border-bottom:1px solid var(--cred-border); }
                .mob-form-group { margin-top:16px; display:flex; flex-direction:column; gap:8px; }
                
                .mob-input {
                    width:100%; padding:14px 16px;
                    border:1px solid rgba(226,232,240,0.8);
                    border-radius:12px;
                    font-size:15px; color:#0F172A;
                    background:#FFFFFF;
                    font-family:inherit;
                    outline:none;
                    box-sizing:border-box;
                    transition:border-color 0.2s;
                }
                .mob-input:focus { border-color:var(--cred-gold); background:#FFFFFF; box-shadow: 0 0 0 3px rgba(184,134,11,0.12); }
                
                /* Dropzone */
                .mob-dropzone { border:1px dashed var(--cred-border); border-radius:12px; background:var(--cred-surface-2); min-height:100px; display:flex; align-items:center; justify-content:center; transition:all 0.2s; cursor:pointer; }
                .mob-dropzone-active { border-color:var(--cred-gold); background:rgba(212, 160, 23, 0.05); }
                .mob-dropzone-filled { background:rgba(16, 185, 129, 0.05); border-color:var(--cred-success); border-style:solid; }
                .mob-dropzone-label { display:flex; flex-direction:column; align-items:center; gap:8px; text-align:center; cursor:pointer; width:100%; padding:20px; }
                .mob-file-preview { display:flex; align-items:center; gap:10px; padding:12px 16px; width:100%; box-sizing: border-box; }
                .mob-file-remove { background:rgba(239, 68, 68, 0.15); color:var(--cred-danger); border:none; border-radius:50%; width:24px; height:24px; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:11px; flex-shrink:0; }

                /* Buttons */
                .mob-cta-btn { width:100%; background:linear-gradient(135deg, #1E3A8A, #0F172A); color:#FFFFFF; border:none; border-radius:16px; padding:16px; font-size:16px; font-weight:800; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; transition:transform 0.2s; box-shadow: 0 8px 24px rgba(15,23,42,0.25); font-family:inherit; }
                .mob-cta-btn:disabled { opacity:0.5; cursor:not-allowed; }
                .mob-cta-btn:not(:disabled):active { transform:scale(0.96); }
                .mob-btn-secondary { background:#FFFFFF; color:#0F172A; border:1px solid rgba(226,232,240,0.8); border-radius:12px; padding:14px 20px; font-size:14px; font-weight:700; cursor:pointer; font-family:inherit; transition: background 0.2s, box-shadow 0.2s; box-shadow: 0 4px 12px rgba(15,23,42,0.08); }
                .mob-btn-secondary:active { background: #F1F5F9; }
                .mob-form-nav { display:flex; gap:12px; margin-top:24px; }
            `}</style>
        </div>
    );
};

export default Outpass;
