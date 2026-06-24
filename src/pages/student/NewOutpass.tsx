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

        // if (!isEmergency && !isPortalOpen) {
        //     toast.error("Portal is open from 6:00 AM to 10:00 AM only.");
        //     setIsSubmitting(false);
        //     return;
        // }

        // if (!isEmergency && formData.fromDate) {
        //     const selectedDate = new Date(formData.fromDate);
        //     const tomorrow = new Date();
        //     tomorrow.setDate(tomorrow.getDate() + 1);
        //     tomorrow.setHours(0, 0, 0, 0);
        //     if (selectedDate < tomorrow) {
        //         toast.error("Non-emergency outpass must be applied at least one day in advance.");
        //         setIsSubmitting(false);
        //         return;
        //     }
        // }

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
        <div className="pb-apply-page-root">
            <ToastContainer position="bottom-right" />

            {/* ── DESKTOP VIEW ── */}
            <div className="lux-desktop-view">
                <StudentHeader />
                <main className="student-content">
                    <div className="content-wrapper">
                        {/* Back Link & Title */}
                        <div className="pb-back-link-wrapper">
                            <button onClick={() => navigate('/dashboard')} className="pb-btn-back">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <line x1="19" y1="12" x2="5" y2="12" />
                                    <polyline points="12 19 5 12 12 5" />
                                </svg>
                                Back to Dashboard
                            </button>
                        </div>

                        <div className="pb-page-header-simple">
                            <h1 className="pb-page-title">Apply Outpass</h1>
                            <p className="pb-page-subtitle">Request official campus exit approval from faculty and wardens</p>
                        </div>

                        {/* Step Indicator Header */}
                        <div className="pb-stepper-wrapper pb-animate-stagger-1">
                            <div className={`pb-step-item ${activeStep >= 1 ? 'active' : ''}`}>
                                <div className="pb-step-number">1</div>
                                <div className="pb-step-label">Type & Timing</div>
                            </div>
                            <div className="pb-step-connector"></div>
                            <div className={`pb-step-item ${activeStep >= 2 ? 'active' : ''}`}>
                                <div className="pb-step-number">2</div>
                                <div className="pb-step-label">Reason & Details</div>
                            </div>
                        </div>

                        {/* Main Form Box */}
                        <div className="pb-outpass-form-box pb-animate-stagger-2">
                            {activeStep === 1 ? (
                                /* STEP 1: TYPE & TIMING */
                                <div className="pb-step-container">
                                    <h3 className="pb-step-title">Step 1: Select Type & Schedule</h3>

                                    <div className="pb-form-group">
                                        <label className="pb-label">Outpass Type</label>
                                        <select
                                            name="outpasstype"
                                            value={formData.outpasstype}
                                            onChange={handleChange}
                                            className="pb-select"
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
                                            <span className="pb-form-hint">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '4px', verticalAlign: 'middle' }}>
                                                    <circle cx="12" cy="12" r="10" />
                                                    <line x1="12" y1="16" x2="12" y2="12" />
                                                    <line x1="12" y1="8" x2="12.01" y2="8" />
                                                </svg>
                                                Only OD and Emergency outpasses are permitted for Day Scholars.
                                            </span>
                                        )}
                                    </div>

                                    <div className="pb-grid-2" style={{ marginTop: '20px' }}>
                                        <div className="pb-form-group">
                                            <label className="pb-label">From Date & Time</label>
                                            <input
                                                type="datetime-local"
                                                name="fromDate"
                                                value={formData.fromDate}
                                                onChange={handleChange}
                                                min={getMinFromDateTime()}
                                                required
                                                className="pb-input"
                                            />
                                        </div>
                                        <div className="pb-form-group">
                                            <label className="pb-label">To Date & Time</label>
                                            <input
                                                type="datetime-local"
                                                name="toDate"
                                                value={formData.toDate}
                                                onChange={handleChange}
                                                min={formData.fromDate || getMinFromDateTime()}
                                                required
                                                className="pb-input"
                                            />
                                        </div>
                                    </div>

                                    {/* Notifications / Warn Panels */}
                                    {/* {!isEmergency && !isPortalOpen && (
                                        <div className="pb-notice-panel pb-panel-warning" style={{ marginTop: '24px' }}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '8px', flexShrink: 0 }}>
                                                <circle cx="12" cy="12" r="10" />
                                                <line x1="12" y1="8" x2="12" y2="12" />
                                                <line x1="12" y1="16" x2="12.01" y2="16" />
                                            </svg>
                                            <span><strong>Portal Closed:</strong> Outpass submissions (except Emergency) are strictly open from 6:00 AM to 10:00 AM daily.</span>
                                        </div>
                                    )} */}

                                    {hasPendingOutpass && (
                                        <div className="pb-notice-panel pb-panel-danger" style={{ marginTop: '24px' }}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '8px', flexShrink: 0 }}>
                                                <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
                                                <line x1="12" y1="8" x2="12" y2="12" />
                                                <line x1="12" y1="16" x2="12.01" y2="16" />
                                            </svg>
                                            <span><strong>Duplicate Application:</strong> You already have a pending outpass request. You cannot submit another until the active one is processed.</span>
                                        </div>
                                    )}

                                    <div className="pb-form-navigation" style={{ marginTop: '32px' }}>
                                        <div></div>
                                        <button
                                            type="button"
                                            onClick={handleNextStep}
                                            className="pb-continue-btn"
                                        >
                                            Continue
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: '6px' }}>
                                                <line x1="5" y1="12" x2="19" y2="12" />
                                                <polyline points="12 5 19 12 12 19" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* STEP 2: REASON & VERIFICATION */
                                <form onSubmit={handleSubmit} className="pb-step-container">
                                    <h3 className="pb-step-title">Step 2: Verification Details</h3>

                                    <div className="pb-form-group">
                                        <label className="pb-label">Detailed Reason for Leave</label>
                                        <textarea
                                            name="reason"
                                            value={formData.reason}
                                            onChange={handleChange}
                                            required
                                            maxLength={250}
                                            rows={4}
                                            placeholder="State clear reasons for your leave application (max 250 characters)..."
                                            className="pb-textarea"
                                        ></textarea>
                                        <div className="pb-char-count-indicator">
                                            {formData.reason.length} / 250 characters
                                        </div>
                                    </div>

                                    <div className="pb-grid-2" style={{ marginTop: '20px' }}>
                                        <div className="pb-form-group">
                                            <label className="pb-label">SkillRack Problems Solved</label>
                                            <input
                                                type="text"
                                                name="skillrack"
                                                value={formData.skillrack}
                                                onChange={handleChange}
                                                placeholder="Enter problem count"
                                                className="pb-input"
                                            />
                                        </div>
                                        <div className="pb-form-group">
                                            <label className="pb-label">Attendance Percentage (%)</label>
                                            <input
                                                type="number"
                                                name="attendance"
                                                value={formData.attendance}
                                                onChange={handleChange}
                                                placeholder="e.g. 85"
                                                min="0"
                                                max="100"
                                                className="pb-input"
                                            />
                                        </div>
                                    </div>

                                    {/* CONDITIONAL PDF DROPZONE */}
                                    {formData.outpasstype === 'OD' && (
                                        <div className="pb-form-group" style={{ marginTop: '24px' }}>
                                            <label className="pb-label">Upload Supporting Document (PDF under 200KB)</label>
                                            <div
                                                className={`pb-dropzone-box ${dragActive ? 'drag-active' : ''} ${selectedFile ? 'has-file' : ''}`}
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
                                                    <label htmlFor="file-upload-input" className="pb-dropzone-label">
                                                        <span className="pb-dropzone-icon">
                                                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                                <polyline points="17 8 12 3 7 8" />
                                                                <line x1="12" y1="3" x2="12" y2="15" />
                                                            </svg>
                                                        </span>
                                                        <span className="pb-dropzone-text-primary">Drag & drop your PDF or click to browse</span>
                                                        <span className="pb-dropzone-text-secondary">Only PDF format supported (Max 200KB)</span>
                                                    </label>
                                                ) : (
                                                    <div className="pb-selected-file-preview">
                                                        <span className="pb-preview-icon">
                                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                                <polyline points="14 2 14 8 20 8" />
                                                            </svg>
                                                        </span>
                                                        <div className="pb-file-details">
                                                            <span className="pb-file-name">{selectedFile.name}</span>
                                                            <span className="pb-file-size">{(selectedFile.size / 1024).toFixed(1)} KB</span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedFile(null)}
                                                            className="pb-btn-remove-file"
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
                                    <div className="pb-form-navigation" style={{ marginTop: '32px' }}>
                                        <button
                                            type="button"
                                            onClick={() => setActiveStep(1)}
                                            className="pb-back-btn"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '6px' }}>
                                                <line x1="19" y1="12" x2="5" y2="12" />
                                                <polyline points="12 19 5 12 12 5" />
                                            </svg>
                                            Back
                                        </button>
                                        <button
                                            type="submit"
                                            className="pb-submit-action-btn"
                                            disabled={isSubmitting || hasPendingOutpass}
                                        >
                                            {isSubmitting ? 'Submitting...' : (hasPendingOutpass ? 'Pending Request Active' : 'Submit Outpass')}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </main>
            </div>{/* end desktop */}

            {/* ── MOBILE VIEW ── */}
            <div className="lux-mobile-view">
                {/* Mobile Header */}
                <div className="pb-mob-page-header">
                    <button className="pb-mob-back-btn" onClick={() => navigate('/dashboard')}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
                    </button>
                    <div className="pb-mob-header-text">
                        <span className="pb-mob-header-title">Apply Outpass</span>
                        <span className="pb-mob-header-subtitle">Official exit request</span>
                    </div>
                    <div style={{ width: 36 }} />
                </div>

                <div className="pb-mob-scroll-body">
                    {/* Step Indicator */}
                    <div className="pb-mob-step-indicator pb-animate-stagger-1">
                        <div className={`pb-mob-step-pill ${activeStep >= 1 ? 'active' : ''}`}>
                            <span className="pb-mob-step-num">1</span>
                            <span>Type & Timing</span>
                        </div>
                        <div className="pb-mob-step-line" />
                        <div className={`pb-mob-step-pill ${activeStep >= 2 ? 'active' : ''}`}>
                            <span className="pb-mob-step-num">2</span>
                            <span>Details</span>
                        </div>
                    </div>

                    {/* Portal Status Banner */}
                    {!isEmergency && !isPortalOpen && (
                        <div className="pb-mob-alert-card pb-alert-warning pb-animate-stagger-2">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                            <span>Portal is open <strong>6:00 AM – 10:00 AM</strong> only (except Emergency)</span>
                        </div>
                    )}

                    {hasPendingOutpass && (
                        <div className="pb-mob-alert-card pb-alert-danger pb-animate-stagger-2">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                            <span>You have an active pending outpass request</span>
                        </div>
                    )}

                    {activeStep === 1 ? (
                        /* STEP 1 */
                        <div className="pb-mob-form-card pb-animate-stagger-3">
                            <h3 className="pb-mob-form-section-title">Outpass Type</h3>
                            <select
                                name="outpasstype"
                                value={formData.outpasstype}
                                onChange={handleChange}
                                className="pb-mob-select"
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
                                <p className="pb-mob-form-hint">Only OD & Emergency allowed for Day Scholars</p>
                            )}

                            <h3 className="pb-mob-form-section-title" style={{ marginTop: 24 }}>Schedule</h3>
                            <div className="pb-mob-form-group">
                                <label className="pb-label">From Date & Time</label>
                                <input
                                    type="datetime-local"
                                    name="fromDate"
                                    value={formData.fromDate}
                                    onChange={handleChange}
                                    min={getMinFromDateTime()}
                                    required
                                    className="pb-mob-input"
                                />
                            </div>
                            <div className="pb-mob-form-group" style={{ marginTop: '12px' }}>
                                <label className="pb-label">To Date & Time</label>
                                <input
                                    type="datetime-local"
                                    name="toDate"
                                    value={formData.toDate}
                                    onChange={handleChange}
                                    min={formData.fromDate || getMinFromDateTime()}
                                    required
                                    className="pb-mob-input"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={handleNextStep}
                                className="pb-mob-cta-btn"
                                style={{ marginTop: 24 }}
                            >
                                Continue
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: '6px' }}><polyline points="9 18 15 12 9 6" /></svg>
                            </button>
                        </div>
                    ) : (
                        /* STEP 2 */
                        <form onSubmit={handleSubmit} className="pb-animate-stagger-3">
                            <div className="pb-mob-form-card">
                                <h3 className="pb-mob-form-section-title">Reason for Leave</h3>
                                <textarea
                                    name="reason"
                                    value={formData.reason}
                                    onChange={handleChange}
                                    required
                                    maxLength={250}
                                    rows={4}
                                    placeholder="State your reason clearly (max 250 chars)..."
                                    className="pb-mob-textarea"
                                />
                                <p className="pb-char-counter">{formData.reason.length} / 250</p>

                                <h3 className="pb-mob-form-section-title" style={{ marginTop: 20 }}>Verification</h3>
                                <div className="pb-mob-form-group">
                                    <label className="pb-label">SkillRack Problems Solved</label>
                                    <input type="text" name="skillrack" value={formData.skillrack} onChange={handleChange} placeholder="Enter count" className="pb-mob-input" />
                                </div>
                                <div className="pb-mob-form-group" style={{ marginTop: '12px' }}>
                                    <label className="pb-label">Attendance Percentage</label>
                                    <input type="number" name="attendance" value={formData.attendance} onChange={handleChange} placeholder="e.g. 85" min="0" max="100" className="pb-mob-input" />
                                </div>

                                {formData.outpasstype === 'OD' && (
                                    <div className="pb-mob-form-group" style={{ marginTop: '16px' }}>
                                        <label className="pb-label">Supporting Document (PDF, max 200KB)</label>
                                        <div
                                            className={`pb-mob-dropzone ${dragActive ? 'active' : ''} ${selectedFile ? 'filled' : ''}`}
                                            onDragEnter={handleDrag}
                                            onDragOver={handleDrag}
                                            onDragLeave={handleDrag}
                                            onDrop={handleDrop}
                                        >
                                            <input type="file" id="mob-file-input" accept=".pdf" onChange={handleFileChange} required={formData.outpasstype === 'OD'} style={{ display: 'none' }} />
                                            {!selectedFile ? (
                                                <label htmlFor="mob-file-input" className="pb-mob-dropzone-label">
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                                                    <span className="pb-primary-text">Tap to upload PDF</span>
                                                    <span className="pb-secondary-text">Only PDF • Max 200KB</span>
                                                </label>
                                            ) : (
                                                <div className="pb-mob-file-preview">
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                                                    <span className="pb-file-name">{selectedFile.name}</span>
                                                    <button type="button" onClick={() => setSelectedFile(null)} className="pb-mob-file-remove">✕</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="pb-mob-form-nav">
                                    <button type="button" onClick={() => setActiveStep(1)} className="pb-mob-cancel-btn">Back</button>
                                    <button
                                        type="submit"
                                        className="pb-mob-cta-btn"
                                        disabled={isSubmitting || hasPendingOutpass}
                                        style={{ flex: 1 }}
                                    >
                                        {isSubmitting ? 'Submitting…' : hasPendingOutpass ? 'Request Active' : 'Submit'}
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
                .pb-apply-page-root {
                    min-height: 100vh;
                    background: var(--pb-bg);
                }
                .pb-page-title {
                    font-size: 1.75rem;
                    font-weight: 800;
                    color: var(--pb-text);
                    margin: 0;
                    letter-spacing: -0.025em;
                }
                .pb-page-subtitle {
                    font-size: 0.9rem;
                    color: var(--pb-text-3);
                    margin: 4px 0 0 0;
                }
                .pb-page-header-simple {
                    margin-bottom: 28px;
                }

                /* Stepper styling */
                .pb-stepper-wrapper {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 20px 32px;
                    margin-bottom: 24px;
                    background: var(--pb-card);
                    border: 1px solid var(--pb-card-border);
                    border-radius: var(--pb-radius);
                    box-shadow: var(--pb-shadow);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                }
                .pb-step-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    color: var(--pb-text-4);
                    transition: var(--pb-transition);
                }
                .pb-step-number {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: rgba(59, 130, 246, 0.05);
                    color: var(--pb-text-3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 800;
                    font-size: 0.88rem;
                    border: 1.5px solid rgba(59, 130, 246, 0.1);
                    transition: var(--pb-transition);
                }
                .pb-step-label {
                    font-size: 0.88rem;
                    font-weight: 750;
                }
                .pb-step-item.active {
                    color: var(--pb-primary);
                }
                .pb-step-item.active .pb-step-number {
                    background: var(--pb-primary);
                    color: #fff;
                    border-color: var(--pb-primary);
                    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
                }
                .pb-step-connector {
                    flex: 1;
                    height: 2px;
                    background: rgba(59, 130, 246, 0.08);
                    margin: 0 24px;
                }

                /* Form Container Card */
                .pb-outpass-form-box {
                    max-width: 720px;
                    margin: 0 auto;
                    background: var(--pb-card);
                    border: 1px solid var(--pb-card-border);
                    border-radius: var(--pb-radius);
                    box-shadow: var(--pb-shadow);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    padding: 32px;
                }
                .pb-step-title {
                    font-size: 1.05rem;
                    font-weight: 800;
                    color: var(--pb-text);
                    margin-bottom: 24px;
                    border-bottom: 1px solid rgba(59, 130, 246, 0.06);
                    padding-bottom: 12px;
                    letter-spacing: -0.01em;
                }

                .pb-form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }
                .pb-label {
                    font-size: 0.72rem;
                    font-weight: 700;
                    color: var(--pb-text-3);
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                    margin-bottom: 0;
                }
                .pb-input, .pb-select, .pb-textarea {
                    width: 100%;
                    height: 42px;
                    padding: 0 14px;
                    border-radius: 10px;
                    border: 1.5px solid rgba(59, 130, 246, 0.12);
                    background: #fff;
                    font-size: 0.88rem;
                    font-family: inherit;
                    color: var(--pb-text);
                    transition: var(--pb-transition);
                    box-sizing: border-box;
                    outline: none;
                }
                .pb-textarea {
                    height: auto;
                    padding: 12px 14px;
                    resize: vertical;
                    min-height: 100px;
                }
                .pb-input:focus, .pb-select:focus, .pb-textarea:focus {
                    border-color: var(--pb-primary);
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.08);
                }
                .pb-select {
                    appearance: none;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394A3B8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-position: right 12px center;
                    background-size: 14px;
                    padding-right: 36px;
                }
                .pb-form-hint {
                    font-size: 0.75rem;
                    color: var(--pb-primary);
                    font-weight: 600;
                    margin-top: 4px;
                    display: flex;
                    align-items: center;
                }

                .pb-grid-2 {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 16px;
                }

                /* Notices */
                .pb-notice-panel {
                    padding: 14px 18px;
                    border-radius: 12px;
                    font-size: 0.82rem;
                    line-height: 1.5;
                    border: 1px solid transparent;
                    display: flex;
                    align-items: center;
                }
                .pb-panel-warning {
                    background: rgba(245, 158, 11, 0.04);
                    border-color: rgba(245, 158, 11, 0.15);
                    color: #92400E;
                }
                .pb-panel-danger {
                    background: rgba(239, 68, 68, 0.04);
                    border-color: rgba(239, 68, 68, 0.15);
                    color: #991B1B;
                }

                .pb-char-count-indicator {
                    text-align: right;
                    font-size: 0.72rem;
                    color: var(--pb-text-4);
                    margin-top: 4px;
                    font-weight: 500;
                }

                .pb-form-navigation {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .pb-continue-btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    height: 42px;
                    padding: 0 22px;
                    background: linear-gradient(135deg, var(--pb-primary), var(--pb-primary-dark));
                    color: #fff;
                    font-weight: 700;
                    font-size: 0.88rem;
                    border: none;
                    border-radius: 12px;
                    cursor: pointer;
                    box-shadow: 0 4px 14px rgba(59, 130, 246, 0.25);
                    transition: var(--pb-transition);
                }
                .pb-continue-btn:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.35);
                }
                .pb-back-btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    height: 42px;
                    padding: 0 18px;
                    background: rgba(59, 130, 246, 0.05);
                    border: 1px solid rgba(59, 130, 246, 0.1);
                    color: var(--pb-text-2);
                    font-weight: 700;
                    font-size: 0.85rem;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: var(--pb-transition);
                }
                .pb-back-btn:hover {
                    background: rgba(59, 130, 246, 0.1);
                }
                .pb-submit-action-btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    height: 42px;
                    padding: 0 24px;
                    background: linear-gradient(135deg, var(--pb-primary), var(--pb-primary-dark));
                    color: #fff;
                    font-weight: 700;
                    font-size: 0.88rem;
                    border: none;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: var(--pb-transition);
                    box-shadow: 0 4px 14px rgba(59, 130, 246, 0.25);
                }
                .pb-submit-action-btn:disabled {
                    opacity: 0.55;
                    cursor: not-allowed;
                    box-shadow: none;
                }
                .pb-submit-action-btn:not(:disabled):hover {
                    transform: translateY(-1px);
                    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.35);
                }

                /* PDF Dropzone */
                .pb-dropzone-box {
                    border: 2px dashed rgba(59, 130, 246, 0.15);
                    border-radius: 14px;
                    padding: 24px;
                    background: rgba(59, 130, 246, 0.01);
                    transition: var(--pb-transition);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 130px;
                }
                .pb-dropzone-box:hover, .pb-dropzone-box.drag-active {
                    border-color: var(--pb-primary);
                    background: rgba(59, 130, 246, 0.05);
                }
                .pb-dropzone-label {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    cursor: pointer;
                    width: 100%;
                    color: var(--pb-text-3);
                }
                .pb-dropzone-icon {
                    color: var(--pb-primary);
                    margin-bottom: 8px;
                    display: flex;
                    align-items: center;
                }
                .pb-dropzone-text-primary {
                    font-size: 0.88rem;
                    font-weight: 750;
                    color: var(--pb-text);
                }
                .pb-dropzone-text-secondary {
                    font-size: 0.72rem;
                    color: var(--pb-text-4);
                    margin-top: 4px;
                    font-weight: 500;
                }
                .pb-selected-file-preview {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background: #fff;
                    padding: 12px 16px;
                    border-radius: 10px;
                    border: 1px solid rgba(59, 130, 246, 0.1);
                    width: 100%;
                    box-shadow: var(--pb-shadow);
                }
                .pb-preview-icon {
                    color: #10B981;
                    display: flex;
                    align-items: center;
                }
                .pb-file-details {
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                    min-width: 0;
                }
                .pb-file-name {
                    font-size: 0.82rem;
                    font-weight: 700;
                    color: var(--pb-text);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .pb-file-size {
                    font-size: 0.72rem;
                    color: var(--pb-text-4);
                    font-weight: 500;
                }
                .pb-btn-remove-file {
                    background: rgba(239, 68, 68, 0.08);
                    color: #EF4444;
                    border: none;
                    width: 26px;
                    height: 26px;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    transition: var(--pb-transition);
                }
                .pb-btn-remove-file:hover {
                    background: #EF4444;
                    color: #fff;
                }

                /* ── DESKTOP / MOBILE SPLIT ── */
                .lux-desktop-view { display: block; }
                .lux-mobile-view  { display: none; }
                @media (max-width: 768px) {
                    .lux-desktop-view { display: none !important; }
                    .lux-mobile-view  { display: flex !important; flex-direction: column; min-height: 100vh; background: var(--pb-bg); }
                }

                /* ==========================================
                   PREMIUM MOBILE STYLES (NEW OUTPASS)
                   ========================================== */
                .pb-mob-page-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px;
                    background: rgba(255, 255, 255, 0.85);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    position: sticky;
                    top: 0;
                    z-index: 50;
                    border-bottom: 1px solid rgba(59, 130, 246, 0.08);
                }
                .pb-mob-back-btn {
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    background: #fff;
                    border: 1px solid rgba(59, 130, 246, 0.12);
                    color: var(--pb-text);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    flex-shrink: 0;
                    transition: transform 0.2s;
                }
                .pb-mob-back-btn:active { transform: scale(0.9); }
                .pb-mob-header-text {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }
                .pb-mob-header-title {
                    font-size: 1.1rem;
                    font-weight: 800;
                    color: var(--pb-text);
                    letter-spacing: -0.01em;
                }
                .pb-mob-header-subtitle {
                    font-size: 0.72rem;
                    font-weight: 600;
                    color: var(--pb-text-4);
                }

                .pb-mob-scroll-body {
                    flex: 1;
                    overflow-y: auto;
                    padding: 16px 16px 90px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                /* Mobile Step Indicator */
                .pb-mob-step-indicator {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 14px 16px;
                    background: var(--pb-card);
                    border: 1px solid var(--pb-card-border);
                    border-radius: var(--pb-radius);
                    box-shadow: var(--pb-shadow);
                }
                .pb-mob-step-pill {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: var(--pb-text-4);
                    flex: 1;
                }
                .pb-mob-step-pill.active {
                    color: var(--pb-primary);
                }
                .pb-mob-step-num {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: rgba(59, 130, 246, 0.05);
                    color: var(--pb-text-3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.72rem;
                    font-weight: 800;
                    flex-shrink: 0;
                    border: 1px solid rgba(59, 130, 246, 0.1);
                    transition: all 0.2s;
                }
                .pb-mob-step-pill.active .pb-mob-step-num {
                    background: var(--pb-primary);
                    color: #fff;
                    border-color: var(--pb-primary);
                }
                .pb-mob-step-line {
                    flex: 0.3;
                    height: 2px;
                    background: rgba(59, 130, 246, 0.08);
                    border-radius: 2px;
                }

                /* Mobile Alerts */
                .pb-mob-alert-card {
                    display: flex;
                    align-items: flex-start;
                    gap: 10px;
                    padding: 12px 14px;
                    border-radius: 12px;
                    font-size: 0.78rem;
                    font-weight: 500;
                    line-height: 1.45;
                }
                .pb-alert-warning {
                    background: rgba(245, 158, 11, 0.04);
                    color: #92400E;
                    border: 1px solid rgba(245, 158, 11, 0.15);
                }
                .pb-alert-danger  {
                    background: rgba(239, 68, 68, 0.04);
                    color: #991B1B;
                    border: 1px solid rgba(239, 68, 68, 0.15);
                }
                .pb-mob-alert-card svg { flex-shrink: 0; margin-top: 1px; }

                /* Form Card Mobile */
                .pb-mob-form-card {
                    padding: 20px;
                    background: var(--pb-card);
                    border: 1px solid var(--pb-card-border);
                    border-radius: var(--pb-radius);
                    box-shadow: var(--pb-shadow);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                }
                .pb-mob-form-section-title {
                    font-size: 0.88rem;
                    font-weight: 800;
                    color: var(--pb-text);
                    margin: 0 0 16px 0;
                    padding-bottom: 8px;
                    border-bottom: 1px solid rgba(59, 130, 246, 0.06);
                }
                .pb-mob-form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }
                .pb-mob-input, .pb-mob-select, .pb-mob-textarea {
                    width: 100%;
                    height: 40px;
                    padding: 0 12px;
                    border: 1px solid rgba(59, 130, 246, 0.12);
                    border-radius: 10px;
                    font-size: 0.84rem;
                    color: var(--pb-text);
                    background: #fff;
                    font-family: inherit;
                    outline: none;
                    box-sizing: border-box;
                    transition: var(--pb-transition);
                }
                .pb-mob-textarea {
                    height: auto;
                    padding: 10px 12px;
                    resize: vertical;
                    min-height: 80px;
                }
                .pb-mob-input:focus, .pb-mob-select:focus, .pb-mob-textarea:focus {
                    border-color: var(--pb-primary);
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.08);
                }
                .pb-mob-select {
                    appearance: none;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394A3B8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-position: right 10px center;
                    background-size: 14px;
                    padding-right: 32px;
                }
                .pb-mob-form-hint {
                    font-size: 0.7rem;
                    color: var(--pb-text-4);
                    margin-top: 4px;
                    font-weight: 500;
                }
                .pb-char-counter {
                    font-size: 0.7rem;
                    text-align: right;
                    color: var(--pb-text-4);
                    margin: 4px 0 0 0;
                    font-weight: 500;
                }

                /* Mobile Dropzone */
                .pb-mob-dropzone {
                    border: 1.5px dashed rgba(59, 130, 246, 0.15);
                    border-radius: 10px;
                    background: rgba(59, 130, 246, 0.01);
                    min-height: 100px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: var(--pb-transition);
                    cursor: pointer;
                }
                .pb-mob-dropzone.active {
                    border-color: var(--pb-primary);
                    background: rgba(59, 130, 246, 0.04);
                }
                .pb-mob-dropzone.filled {
                    background: rgba(16, 185, 129, 0.04);
                    border-color: #10B981;
                    border-style: solid;
                }
                .pb-mob-dropzone-label {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 6px;
                    text-align: center;
                    cursor: pointer;
                    width: 100%;
                    padding: 16px;
                    color: var(--pb-text-3);
                }
                .pb-mob-dropzone-label svg {
                    color: var(--pb-primary);
                }
                .pb-mob-dropzone-label .pb-primary-text {
                    font-size: 0.8rem;
                    font-weight: 750;
                    color: var(--pb-text);
                }
                .pb-mob-dropzone-label .pb-secondary-text {
                    font-size: 0.68rem;
                    color: var(--pb-text-4);
                }
                .pb-mob-file-preview {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px 14px;
                    width: 100%;
                    box-sizing: border-box;
                }
                .pb-mob-file-preview .pb-file-name {
                    font-size: 0.78rem;
                    font-weight: 700;
                    color: var(--pb-text);
                    flex: 1;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                .pb-mob-file-remove {
                    background: rgba(239, 68, 68, 0.08);
                    color: #EF4444;
                    border: none;
                    border-radius: 50%;
                    width: 24px;
                    height: 24px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.75rem;
                    flex-shrink: 0;
                }

                /* Mobile Buttons */
                .pb-mob-cta-btn {
                    width: 100%;
                    height: 44px;
                    background: linear-gradient(135deg, var(--pb-primary), var(--pb-primary-dark));
                    color: #fff;
                    border: none;
                    border-radius: 12px;
                    font-size: 0.88rem;
                    font-weight: 700;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
                    transition: transform 0.2s;
                    font-family: inherit;
                }
                .pb-mob-cta-btn:disabled {
                    opacity: 0.55;
                    cursor: not-allowed;
                    box-shadow: none;
                }
                .pb-mob-cta-btn:not(:disabled):active { transform: scale(0.97); }

                .pb-mob-cancel-btn {
                    background: rgba(59, 130, 246, 0.05);
                    border: 1px solid rgba(59, 130, 246, 0.1);
                    color: var(--pb-text-2);
                    border-radius: 12px;
                    padding: 0 20px;
                    height: 44px;
                    font-size: 0.85rem;
                    font-weight: 700;
                    cursor: pointer;
                    font-family: inherit;
                    transition: background 0.2s;
                }
                .pb-mob-cancel-btn:active { background: rgba(59, 130, 246, 0.1); }
                .pb-mob-form-nav {
                    display: flex;
                    gap: 10px;
                    margin-top: 20px;
                }

                /* ANIMATIONS */
                @keyframes pbFadeIn {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .pb-animate-stagger-1 { animation: pbFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: 0.05s; }
                .pb-animate-stagger-2 { animation: pbFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: 0.1s; }
                .pb-animate-stagger-3 { animation: pbFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: 0.15s; }
            `}</style>
        </div>
    );
};

export default Outpass;
