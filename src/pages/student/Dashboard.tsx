import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RECENT_DOWNLOADS, type User } from '../../data/sampleData';
import axios from 'axios';
import { useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import StudentHeader from '../../components/StudentHeader';
import { isProfileComplete } from '../../utils/profileHelper';

// Event types for calendar
type EventType = 'working' | 'leave' | 'college_event' | 'cia_exam';

interface CalendarEvent {
    id: string;
    date: Date;
    type: EventType;
    title: string;
    description?: string;
    time?: string;
    leaveReason?: string;
}

const Dashboard: React.FC = () => {
    const [Loading, setLoading] = React.useState(true);
    const [user, setUser] = React.useState<User>({
        name: "",
        registerNumber: "",
        staffid: {
            id: "",
            name: "",
        },
        department: "",
        year: "",
        semester: 0,
        email: "",
        phone: "",
        photo: "",
        batch: "",
        gender: "male",
        parentnumber: "",
        residencetype: "day scholar",
        hostelname: "",
        hostelroomno: "",
        busno: "",
        boardingpoint: "",
    });
    const navigate = useNavigate();
    const [zoomingPath, setZoomingPath] = React.useState<string | null>(null);
    // Calendar state
    const [currentDate, setCurrentDate] = React.useState(new Date());
    const [selectedEvent, setSelectedEvent] = React.useState<CalendarEvent | null>(null);
    const [hoveredDate, setHoveredDate] = React.useState<number | null>(null);

    // Sample events data
    const [events] = React.useState<CalendarEvent[]>([
        { id: '1', date: new Date(2026, 0, 5), type: 'cia_exam', title: 'CIA 1 - AI & ML', description: 'AI & ML', time: '8:45 AM - 9:15 AM' },
        { id: '2', date: new Date(2026, 0, 6), type: 'cia_exam', title: 'CIA 1 - FDS', description: 'FDS', time: '8:45 AM - 9:15 AM' },
        { id: '3', date: new Date(2026, 0, 7), type: 'cia_exam', title: 'CIA 1 - oops', description: 'oops', time: '8:45 AM - 9:15 AM' },
        { id: '4', date: new Date(2026, 0, 8), type: 'cia_exam', title: 'CIA 1 - Data Structures', description: 'Data Structures', time: '8:45 AM - 9:15 AM' },
        { id: '5', date: new Date(2026, 0, 9), type: 'college_event', title: 'event - DBMS and pongal festival', description: 'DBMS and pongal festival', time: '8:45 AM - 9:15 AM' },
        { id: '6', date: new Date(2026, 0, 10), type: 'cia_exam', title: 'CIA 1 - tamil', description: 'tamil', time: '8:45 AM - 9:15 AM' },
        { id: '7', date: new Date(2026, 0, 26), type: 'leave', title: 'Republic Day', leaveReason: 'National Holiday' },
        { id: '8', date: new Date(2026, 0, 19), type: 'cia_exam', title: 'CIA 1 - english', description: 'english', time: '8:45 AM - 9:15 AM' },
        { id: '9', date: new Date(2026, 0, 11), type: 'leave', title: 'holiday', leaveReason: 'pongal festival' },
        { id: '10', date: new Date(2026, 0, 12), type: 'leave', title: 'holiday', leaveReason: 'pongal festival' },
        { id: '11', date: new Date(2026, 0, 13), type: 'leave', title: 'holiday', leaveReason: 'pongal festival' },
        { id: '12', date: new Date(2026, 0, 14), type: 'leave', title: 'holiday', leaveReason: 'pongal festival' },
        { id: '13', date: new Date(2026, 0, 15), type: 'leave', title: 'holiday', leaveReason: 'pongal festival' },
        { id: '14', date: new Date(2026, 0, 16), type: 'leave', title: 'holiday', leaveReason: 'pongal festival' },
        { id: '15', date: new Date(2026, 0, 17), type: 'leave', title: 'holiday', leaveReason: 'pongal festival' },
        { id: '16', date: new Date(2026, 0, 18), type: 'leave', title: 'holiday', leaveReason: 'pongal festival' },
        { id: '16', date: new Date(2026, 1, 27), type: 'college_event', title: 'Sports Day', description: 'Sports Day', time: '8:45 AM - 9:15 AM' },
    ]);

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/profile`, {
                    headers: {
                        authorization: `Bearer ${token}`,
                    },
                });
                if (response.status == 200) {
                    setUser(response.data.user);
                    toast.success("User profile fetched successfully");
                } else {
                    toast.error("Failed to fetch user profile");
                }
            } catch (error) {
                toast.error('Failed to fetch user data');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const handleQuickAction = (path: string) => {
        const restrictedPaths = ['/staffs', '/student-notice', '/subjects', '/outpass', '/new-outpass'];

        if (restrictedPaths.includes(path) && !isProfileComplete(user)) {
            toast.warn("Complete your profile to enable " + path.replace('/', ''), {
                position: "top-center",
                autoClose: 3000,
            });
            return;
        }

        setZoomingPath(path);
        setTimeout(() => {
            navigate(path);
        }, 700); // Wait for animation to finish
    };

    // Calendar utilities
    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const getEventsForDate = (day: number) => {
        return events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate.getDate() === day &&
                eventDate.getMonth() === currentDate.getMonth() &&
                eventDate.getFullYear() === currentDate.getFullYear();
        });
    };

    const isToday = (day: number) => {
        const today = new Date();
        return day === today.getDate() &&
            currentDate.getMonth() === today.getMonth() &&
            currentDate.getFullYear() === today.getFullYear();
    };

    const changeMonth = (delta: number) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const getEventSymbol = (type: EventType) => {
        switch (type) {
            case 'working':
                return <span className="event-symbol working">●</span>;
            case 'leave':
                return <span className="event-symbol leave">●</span>;
            case 'college_event':
                return <span className="event-symbol college-event">★</span>;
            case 'cia_exam':
                return <span className="event-symbol cia-exam">▲</span>;
        }
    };

    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        const days = [];
        const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        // Week day headers
        weekDays.forEach(day => {
            days.push(
                <div key={`header-${day}`} className="calendar-header-day">
                    {day}
                </div>
            );
        });

        // Empty cells for days before month starts
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayEvents = getEventsForDate(day);
            const today = isToday(day);

            days.push(
                <div
                    key={`day-${day}`}
                    className={`calendar-day ${today ? 'today' : ''} ${dayEvents.length > 0 ? 'has-events' : ''}`}
                    onMouseEnter={() => setHoveredDate(day)}
                    onMouseLeave={() => setHoveredDate(null)}
                    onClick={() => {
                        if (dayEvents.length > 0) {
                            setSelectedEvent(dayEvents[0]);
                        }
                    }}
                >
                    <span className="day-number">{day}</span>
                    <div className="event-symbols">
                        {dayEvents.map(event => (
                            <React.Fragment key={event.id}>
                                {getEventSymbol(event.type)}
                            </React.Fragment>
                        ))}
                    </div>
                    {hoveredDate === day && dayEvents.length > 0 && (
                        <div className="event-tooltip">
                            {dayEvents.map(event => (
                                <div key={event.id} className="tooltip-event">
                                    <strong>{event.title}</strong>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        return days;
    };

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    if (Loading) {
        return <div className="card staff-card">Loading...</div>;
    }



    return (
        <div className="page-container dashboard-page">
            <ToastContainer position="bottom-right" />
            {/* Custom Dashboard Header */}
            <StudentHeader user={user} />

            <div className="content-wrapper-custom">
                {/* Hero Section */}
                <div className="dashboard-hero">
                    <div className="hero-welcome">
                        <div>
                            <span className="badge">Welcome Back</span>
                        </div>
                        <div>
                            <h1 style={{ color: 'skyblue' }}>Hello, {user.name}! 👋</h1>
                            <p style={{ color: 'skyblue' }}>
                                {user.year} • {user.department}
                            </p>
                        </div>
                    </div>
                    <div className="hero-stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon blue">📚</div>
                            <div className="stat-info">
                                <span className="stat-value">8 </span>
                                <span className="stat-label">Subjects</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon orange">⬇️</div>
                            <div className="stat-info">
                                <span className="stat-value">12 </span>
                                <span className="stat-label">Downloads</span>
                            </div>

                        </div>
                        {/* <div className="stat-card">
                            <div className="stat-icon green">✅</div>
                            <div className="stat-info">
                                <span className="stat-value">95%</span>
                                <span className="stat-label">Attendance</span>
                            </div>
                        </div> */}
                    </div>
                </div>

                <div className="dashboard-layout">
                    {/* Main Content */}
                    <div className="main-content">
                        {/* Quick Actions */}
                        <section className="section">
                            <h2 className="section-title">Quick Actions</h2>
                            <div className="quick-links-grid">
                                <div
                                    className={`action-card ${zoomingPath === '/staffs' ? 'zooming' : ''}`}
                                    onClick={() => handleQuickAction('/staffs')}
                                >
                                    <span className="action-icon">👥</span>
                                    <span className="action-text">Find Staff</span>
                                </div>
                                {/* <div
                                    className={`action-card ${zoomingPath === '/student-notice' ? 'zooming' : ''}`}
                                    onClick={() => handleQuickAction('/student-notice')}
                                >
                                    <span className="action-icon">📢</span>
                                    <span className="action-text">Notices</span>
                                </div> */}
                                <div
                                    className={`action-card ${zoomingPath === '/subjects' ? 'zooming' : ''}`}
                                    onClick={() => handleQuickAction('/subjects')}
                                >
                                    <span className="action-icon">📚</span>
                                    <span className="action-text">My Subjects</span>
                                </div>
                                <div
                                    className={`action-card ${zoomingPath === '/profile' ? 'zooming' : ''}`}
                                    onClick={() => handleQuickAction('/profile')}
                                >
                                    <span className="action-icon">👤</span>
                                    <span className="action-text">Edit Profile</span>
                                </div>
                                <div
                                    className={`action-card ${zoomingPath === '/outpass' ? 'zooming' : ''}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleQuickAction('/outpass');
                                    }}
                                    style={{
                                        opacity: !isProfileComplete(user) ? 0.7 : 1,
                                        cursor: !isProfileComplete(user) ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    <span className="action-icon">📝</span>
                                    <span className="action-text">Outpass</span>
                                </div>
                            </div>
                        </section>

                        {/* Department Info */}
                        <section className="section">
                            <div className="card info-card">
                                <div className="card-header">
                                    <div className="header-icon">🏛️</div>
                                    <div>
                                        <h3>Department of Information Technology</h3>
                                        <p className="card-subtitle">Academic Overview</p>
                                    </div>
                                    <span className="badge">IT Dept</span>
                                </div>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <div className="info-icon">👨‍🏫</div>
                                        <div className="info-content">
                                            <label>Head of Department</label>
                                            <p>Dr. Selvam</p>
                                        </div>
                                    </div>
                                    <div className="info-item">
                                        <div className="info-icon">👩‍🏫</div>
                                        <div className="info-content">
                                            <label>Class Advisor</label>
                                            <p>{user.staffid.name}</p>
                                        </div>
                                    </div>
                                    <div className="info-item">
                                        <div className="info-icon">🎓</div>
                                        <div className="info-content">
                                            <label>Total Students</label>
                                            <p>120</p>
                                        </div>
                                    </div>
                                    <div className="info-item">
                                        <div className="info-icon">📅</div>
                                        <div className="info-content">
                                            <label>Semester</label>
                                            <p>{user.semester}th</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Monthly Calendar */}
                        <section className="section">
                            <div className="calendar-container-main">
                                <div className="calendar-card">
                                    <div className="calendar-header">
                                        <div className="calendar-title">
                                            <h2>📅 Monthly Calendar</h2>
                                            <p className="calendar-subtitle">Track your schedule and events</p>
                                        </div>
                                        <div className="calendar-controls">
                                            <button className="btn-nav" onClick={() => changeMonth(-1)}>
                                                ← Previous
                                            </button>
                                            <button className="btn-today" onClick={goToToday}>
                                                Today
                                            </button>
                                            <button className="btn-nav" onClick={() => changeMonth(1)}>
                                                Next →
                                            </button>
                                        </div>
                                    </div>

                                    <div className="calendar-month-year">
                                        <h3>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
                                    </div>

                                    <div className="calendar-grid">
                                        {renderCalendar()}
                                    </div>

                                    {/* Legend */}
                                    <div className="calendar-legend">
                                        <h4>Legend</h4>
                                        <div className="legend-items">
                                            <div className="legend-item">
                                                <span className="event-symbol working">●</span>
                                                <span>Working Day</span>
                                            </div>
                                            <div className="legend-item">
                                                <span className="event-symbol leave">●</span>
                                                <span>Leave / Holiday</span>
                                            </div>
                                            <div className="legend-item">
                                                <span className="event-symbol college-event">★</span>
                                                <span>College Events</span>
                                            </div>
                                            <div className="legend-item">
                                                <span className="event-symbol cia-exam">▲</span>
                                                <span>CIA Exams</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Event Details Panel */}
                                {selectedEvent && (
                                    <div className="event-details-panel">
                                        <div className="panel-header">
                                            <h3>Event Details</h3>
                                            <button className="btn-close" onClick={() => setSelectedEvent(null)}>
                                                ✕
                                            </button>
                                        </div>
                                        <div className="panel-content">
                                            <div className="event-type-badge">
                                                {getEventSymbol(selectedEvent.type)}
                                                <span className="type-label">
                                                    {selectedEvent.type === 'working' && 'Working Day'}
                                                    {selectedEvent.type === 'leave' && 'Leave / Holiday'}
                                                    {selectedEvent.type === 'college_event' && 'College Event'}
                                                    {selectedEvent.type === 'cia_exam' && 'CIA Exam'}
                                                </span>
                                            </div>
                                            <h4 className="event-title">{selectedEvent.title}</h4>
                                            <div className="event-info">
                                                <div className="info-row">
                                                    <span className="info-label">📅 Date:</span>
                                                    <span className="info-value">
                                                        {selectedEvent.date.toLocaleDateString('en-US', {
                                                            weekday: 'long',
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                                {selectedEvent.time && (
                                                    <div className="info-row">
                                                        <span className="info-label">🕐 Time:</span>
                                                        <span className="info-value">{selectedEvent.time}</span>
                                                    </div>
                                                )}
                                                {selectedEvent.description && (
                                                    <div className="info-row">
                                                        <span className="info-label">📝 Description:</span>
                                                        <span className="info-value">{selectedEvent.description}</span>
                                                    </div>
                                                )}
                                                {selectedEvent.leaveReason && (
                                                    <div className="info-row">
                                                        <span className="info-label">ℹ️ Reason:</span>
                                                        <span className="info-value">{selectedEvent.leaveReason}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Vision & Mission */}
                        <section className="section">
                            <div className="card vision-card">
                                <div className="card-header">
                                    <div className="header-icon">🚀</div>
                                    <h3 className="text-white">Vision & Mission</h3>
                                </div>
                                <div className="vision-content">
                                    <div className="vision-block">
                                        <h4>Vision</h4>
                                        <p>Jeppiaar Institute of Technology aspires to provide technical education in futuristic technologies with the perspective of innovative, industrial, and social applications for the betterment of humanity.</p>
                                    </div>
                                    <div className="vision-divider"></div>
                                    <div className="vision-block">
                                        <h4>Mission</h4>
                                        <ul>
                                            <li style={{ color: '#d0c9c9ff' }}>To produce competent and disciplined high-quality professionals.</li>
                                            <li style={{ color: '#d0c9c9ff' }}>To improve the quality of education through excellence in teaching.</li>
                                            <li style={{ color: '#d0c9c9ff' }}>To provide excellent infrastructure and stimulating environment.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Sidebar */}
                    <aside className="sidebar">
                        {/* Events
                        <div className="card sidebar-card">
                            <h3>Upcoming Events</h3>
                            <div className="events-list">
                                {EVENTS_DATA.map(event => (
                                    <div key={event.id} className="event-item">
                                        <div className={`event-date ${event.type}`}>
                                            <span>{event.date.split(' ')[0]}</span>
                                            <strong>{event.date.split(' ')[1].replace(',', '')}</strong>
                                        </div>
                                        <div className="event-details">
                                            <p className="event-title">{event.title}</p>
                                            <span className="event-type">{event.type}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div> */}

                        {/* Recent Downloads */}
                        <div className="card sidebar-card">
                            <h3>Recent Downloads</h3>
                            <div className="downloads-list">
                                {RECENT_DOWNLOADS.map(download => (
                                    <div key={download.id} className="download-item">
                                        <div className="download-icon">📄</div>
                                        <div className="download-info">
                                            <p className="download-title">{download.title}</p>
                                            <span className="download-meta">{download.subject} • {download.date}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="btn btn-ghost btn-sm w-full mt-4">View All Downloads</button>
                        </div>
                    </aside>
                </div>
            </div>

            <style>{`
                /* Custom Dashboard Header */
                .dashboard-header-custom {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 70px;
                    background: white;
                    border-bottom: 1px solid #e2e8f0;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
                    z-index: 1000;
                }

                .mobile-menu-btn {
                    display: none;
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #1e293b;
                    padding: 8px;
                    z-index: 1001;
                }

                .header-container-custom {
                    max-width: 1400px;
                    margin: 0 auto;
                    height: 100%;
                    padding: 0 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .header-left-custom {
                    display: flex;
                    align-items: center;
                }

                .brand-custom {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .brand-icon-custom {
                    font-size: 28px;
                }

                .brand-text-custom {
                    font-size: 1.3rem;
                    font-weight: 700;
                    background: linear-gradient(135deg, #0047AB, #2563eb);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .header-nav-custom {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .nav-item-custom {
                    padding: 10px 20px;
                    border: none;
                    background: transparent;
                    color: #64748b;
                    font-weight: 600;
                    font-size: 0.95rem;
                    cursor: pointer;
                    border-radius: 10px;
                    transition: all 0.3s;
                }

                .nav-item-custom:hover {
                    background: #f1f5f9;
                    color: #0047AB;
                }

                .logout-btn-custom {
                    padding: 10px 24px;
                    border: 2px solid #ef4444;
                    background: white;
                    color: #ef4444;
                    font-weight: 600;
                    font-size: 0.95rem;
                    cursor: pointer;
                    border-radius: 10px;
                    transition: all 0.3s;
                    margin-left: 12px;
                }

                .logout-btn-custom:hover {
                    background: #ef4444;
                    color: white;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
                }

                .content-wrapper-custom {
                    margin-top: 70px;
                    margin-right: 20px;
                    margin-left: 20px;
                    padding: 0;
                }

                /* Calendar Styles */
                .calendar-container-main {
                    display: grid;
                    grid-template-columns: 1fr 350px;
                    gap: 24px;
                }

                .calendar-card {
                    background: white;
                    border-radius: 24px;
                    padding: 32px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.06);
                    border: 1px solid rgba(0, 0, 0, 0.05);
                    animation: fadeInUp 0.6s ease-out;
                }

                .calendar-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                    padding-bottom: 20px;
                    border-bottom: 2px solid #f1f5f9;
                }

                .calendar-title h2 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #1e293b;
                    margin: 0 0 4px 0;
                }

                .calendar-subtitle {
                    color: #64748b;
                    font-size: 0.9rem;
                    margin: 0;
                }

                .calendar-controls {
                    display: flex;
                    gap: 12px;
                }

                .btn-nav, .btn-today {
                    padding: 10px 20px;
                    border-radius: 12px;
                    border: none;
                    font-weight: 600;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .btn-nav {
                    background: #f1f5f9;
                    color: #475569;
                }

                .btn-nav:hover {
                    background: #0047AB;
                    color: white;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 71, 171, 0.3);
                }

                .btn-today {
                    background: linear-gradient(135deg, #0047AB, #1e3a8a);
                    color: white;
                }

                .btn-today:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(0, 71, 171, 0.4);
                }

                .calendar-month-year {
                    text-align: center;
                    margin-bottom: 24px;
                }

                .calendar-month-year h3 {
                    font-size: 1.75rem;
                    font-weight: 700;
                    color: #0f172a;
                    margin: 0;
                    background: linear-gradient(135deg, #0047AB, #60a5fa);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .calendar-grid {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    gap: 8px;
                    margin-bottom: 24px;
                    overflow: visible;
                }

                .calendar-header-day {
                    text-align: center;
                    font-weight: 700;
                    color: #64748b;
                    padding: 12px;
                    font-size: 0.85rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .calendar-day {
                    aspect-ratio: 1;
                    border-radius: 16px;
                    padding: 12px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: flex-start;
                    gap: 8px;
                    background: #f8fafc;
                    border: 2px solid transparent;
                    cursor: pointer;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: visible;
                }

                @media (max-width: 768px) {
                    .mobile-menu-btn {
                        display: block;
                    }

                    .header-nav-custom {
                        position: absolute;
                        top: 70px;
                        left: 0;
                        right: 0;
                        background: white;
                        flex-direction: column;
                        padding: 0;
                        border-bottom: 1px solid #e2e8f0;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                        overflow: hidden;
                        max-height: 0;
                        transition: max-height 0.3s ease-in-out, padding 0.3s ease-in-out;
                        gap: 0;
                    }

                    .header-nav-custom.mobile-open {
                        max-height: 500px;
                        padding: 16px 0;
                    }

                    .nav-item-custom, .logout-btn-custom {
                        width: 100%;
                        text-align: left;
                        padding: 12px 24px;
                        border-radius: 0;
                        margin: 0;
                    }

                    .logout-btn-custom {
                        border: none;
                        border-top: 1px solid #fee2e2;
                        color: #ef4444;
                        margin-top: 8px;
                    }

                    .content-wrapper-custom {
                        margin-top: 70px;
                    }
                }

                .calendar-day.empty {
                    background: transparent;
                    cursor: default;
                }

                .calendar-day:not(.empty):hover {
                    background: #eff6ff;
                    border-color: #93c5fd;
                    transform: translateY(-4px) scale(1.05);
                    box-shadow: 0 8px 24px rgba(59, 130, 246, 0.2);
                    z-index: 500;
                }

                .calendar-day.today {
                    background: linear-gradient(135deg, #0047AB, #1e3a8a);
                    color: white;
                    border-color: #0047AB;
                    box-shadow: 0 4px 16px rgba(0, 71, 171, 0.3);
                }

                .calendar-day.today .day-number {
                    color: green;
                    font-weight: 800;
                }

                .calendar-day.has-events {
                    background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
                }

                .day-number {
                    font-size: 1rem;
                    font-weight: 600;
                    color: #1e293b;
                    position: relative;
                    z-index: 10;
                }

                .event-symbols {
                    display: flex;
                    gap: 4px;
                    flex-wrap: wrap;
                    justify-content: center;
                    position: relative;
                    z-index: 5;
                }

                .event-symbol {
                    font-size: 1.2rem;
                    line-height: 1;
                    animation: popIn 0.3s ease-out;
                }

                .event-symbol.working {
                    color: #10b981;
                    filter: drop-shadow(0 2px 4px rgba(16, 185, 129, 0.3));
                }

                .event-symbol.leave {
                    color: #ef4444;
                    filter: drop-shadow(0 2px 4px rgba(239, 68, 68, 0.3));
                }

                .event-symbol.college-event {
                    color: #3b82f6;
                    filter: drop-shadow(0 2px 4px rgba(59, 130, 246, 0.3));
                }

                .event-symbol.cia-exam {
                    color: #f59e0b;
                    filter: drop-shadow(0 2px 4px rgba(245, 158, 11, 0.3));
                }

                .event-tooltip {
                    position: absolute;
                    top: 100%;
                    left: 50%;
                    transform: translateX(-50%);
                    margin-top: 8px;
                    background: rgba(15, 23, 42, 0.95);
                    backdrop-filter: blur(12px);
                    color: white;
                    padding: 12px 16px;
                    border-radius: 12px;
                    font-size: 0.85rem;
                    white-space: nowrap;
                    z-index: 1000;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                    animation: tooltipFadeIn 0.2s ease-out;
                    pointer-events: none;
                }

                .event-tooltip::before {
                    content: '';
                    position: absolute;
                    bottom: 100%;
                    left: 50%;
                    transform: translateX(-50%);
                    border: 6px solid transparent;
                    border-bottom-color: rgba(15, 23, 42, 0.95);
                }

                .tooltip-event {
                    margin: 4px 0;
                }

                .calendar-legend {
                    background: linear-gradient(135deg, #f8fafc, #f1f5f9);
                    border-radius: 16px;
                    padding: 20px;
                    border: 1px solid #e2e8f0;
                }

                .calendar-legend h4 {
                    font-size: 1rem;
                    font-weight: 700;
                    color: #1e293b;
                    margin: 0 0 16px 0;
                }

                .legend-items {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px;
                }

                .legend-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 0.9rem;
                    color: #475569;
                    font-weight: 500;
                }

                .event-details-panel {
                    background: white;
                    border-radius: 24px;
                    padding: 0;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
                    border: 1px solid rgba(0, 0, 0, 0.05);
                    animation: slideInRight 0.4s ease-out;
                    overflow: hidden;
                    max-height: fit-content;
                }

                .panel-header {
                    background: linear-gradient(135deg, #0047AB, #1e3a8a);
                    color: white;
                    padding: 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .panel-header h3 {
                    margin: 0;
                    color: white;
                    font-size: 1.25rem;
                    font-weight: 700;
                }

                .btn-close {
                    background: rgba(255, 255, 255, 0.2);
                    border: none;
                    color: white;
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    font-size: 1.2rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .btn-close:hover {
                    background: rgba(255, 255, 255, 0.3);
                    transform: rotate(90deg);
                }

                .panel-content {
                    padding: 24px;
                }

                .event-type-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 16px;
                    border-radius: 12px;
                    background: #f1f5f9;
                    margin-bottom: 16px;
                    font-weight: 600;
                    font-size: 0.9rem;
                    color: #475569;
                }

                .event-title {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #0f172a;
                    margin: 0 0 20px 0;
                }

                .event-info {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .info-row {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    padding: 16px;
                    background: #f8fafc;
                    border-radius: 12px;
                    border-left: 4px solid #0047AB;
                }

                .info-label {
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .info-value {
                    font-size: 1rem;
                    color: #1e293b;
                    font-weight: 500;
                }

                @keyframes popIn {
                    0% {
                        transform: scale(0);
                        opacity: 0;
                    }
                    50% {
                        transform: scale(1.2);
                    }
                    100% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }

                @keyframes tooltipFadeIn {
                    from {
                        opacity: 0;
                        transform: translateX(-50%) translateY(-5px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(-50%) translateY(0);
                    }
                }

                @media (max-width: 1200px) {
                    .calendar-container-main {
                        grid-template-columns: 1fr;
                    }

                    .event-details-panel {
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        width: 90%;
                        max-width: 500px;
                        z-index: 1000;
                        animation: scaleIn 0.3s ease-out;
                    }
                }

                @media (max-width: 768px) {
                    .calendar-grid {
                        gap: 3px;
                    }

                    .calendar-day {
                        padding: 6px 4px;
                        border-radius: 8px;
                    }

                    .day-number {
                        font-size: 0.8rem;
                    }

                    .event-symbol {
                        font-size: 0.8rem;
                    }

                    .calendar-controls {
                        flex-direction: row;
                        width: 100%;
                        gap: 8px;
                    }

                    .btn-nav, .btn-today {
                        width: auto;
                        flex: 1;
                        padding: 8px 12px;
                        font-size: 0.75rem;
                    }

                    .legend-items {
                        grid-template-columns: 1fr;
                        gap: 8px;
                    }
                    
                    .calendar-card {
                        padding: 16px;
                    }
                    
                    .calendar-header-day {
                        padding: 6px 4px;
                        font-size: 0.7rem;
                    }
                }

                @media (max-width: 480px) {
                    /* Department Card - Extra Small Screens */
                    .info-card {
                        padding: 16px;
                    }
                    
                    .card-header h3 {
                        font-size: 1rem;
                    }
                    
                    .card-subtitle {
                        font-size: 0.75rem;
                    }
                    
                    .header-icon {
                        font-size: 28px;
                        padding: 8px;
                    }
                    
                    .info-item {
                        padding: 12px;
                        gap: 10px;
                    }
                    
                    .info-icon {
                        font-size: 18px;
                        padding: 7px;
                    }
                    
                    .info-content label {
                        font-size: 0.65rem;
                    }
                    
                    .info-content p {
                        font-size: 0.85rem;
                    }
                    
                    /* Calendar - Extra Small Screens */
                    .calendar-card {
                        padding: 12px;
                    }
                    
                    .calendar-header-day {
                        padding: 4px 2px;
                        font-size: 0.6rem;
                    }
                    
                    .calendar-day {
                        padding: 4px 2px;
                        gap: 1px;
                    }
                    
                    .day-number {
                        font-size: 0.7rem;
                    }
                    
                    .event-symbol {
                        font-size: 0.65rem;
                    }
                    
                    .calendar-month-year h3 {
                        font-size: 1.1rem;
                    }
                    
                    .btn-nav, .btn-today {
                        padding: 6px 8px;
                        font-size: 0.7rem;
                    }
                    
                    .calendar-title h2 {
                        font-size: 1.2rem;
                    }
                    
                    .calendar-subtitle {
                        font-size: 0.75rem;
                    }
                }

                @keyframes scaleIn {
                    from {
                        transform: translate(-50%, -50%) scale(0.9);
                        opacity: 0;
                    }
                    to {
                        transform: translate(-50%, -50%) scale(1);
                        opacity: 1;
                    }
                }

                .dashboard-hero {
                    background: linear-gradient(-45deg, #0047AB, #00214D, #1e3a8a, #0f172a);
                    background-size: 400% 400%;
                    animation: aurora 15s ease infinite;
                    border-radius: 24px;
                    padding: 40px;
                    margin-bottom: 32px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.4);
                    position: relative;
                    overflow: hidden;
                    color: white;
                }

                .dashboard-hero::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: 
                        radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%),
                        radial-gradient(circle at 80% 80%, rgba(255,255,255,0.05) 0%, transparent 40%);
                    animation: pulse-glow 8s ease-in-out infinite alternate;
                    z-index: 0;
                }

                /* 3D Stat Card Effect */
                .hero-stats-grid {
                    display: flex;
                    gap: 24px;
                    position: relative;
                    z-index: 1;
                    perspective: 1000px;
                }

                .stat-card {
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(12px);
                    padding: 20px 28px;
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    min-width: 180px;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    transform-style: preserve-3d;
                }

                .stat-card:hover {
                    transform: translateY(-5px) rotateX(5deg) scale(1.05);
                    background: rgba(255, 255, 255, 0.2);
                    box-shadow: 
                        0 20px 40px rgba(0,0,0,0.3),
                        0 0 20px rgba(255,255,255,0.2) inset;
                    border-color: rgba(255,255,255,0.6);
                }

                /* Section Spacing */
                .section {
                    margin-bottom: 32px;
                }

                .section-title {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: #1e293b;
                    margin-bottom: 20px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                /* Quick Actions Grid with 3D Perspective */
                .quick-links-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 20px;
                    perspective: 1000px;
                    padding-bottom: 20px;
                }

                .action-card {
                    background: white;
                    padding: 24px;
                    border-radius: 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 16px;
                    text-align: center;
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    border: 1px solid rgba(0, 0, 0, 0.05);
                    box-shadow: 0 4px 20px rgba(0,0,0,0.02);
                    position: relative;
                    overflow: hidden;
                    z-index: 1;
                    cursor: pointer;
                }

                /* Zoom Effect */
                .action-card.zooming {
                    animation: zoom-in-nav 0.6s cubic-bezier(0.7, 0, 0.3, 1) forwards;
                    z-index: 100;
                    pointer-events: none;
                }

                @keyframes zoom-in-nav {
                    0% {
                        transform: scale(1);
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.8;
                    }
                    100% {
                        transform: scale(20);
                        opacity: 0;
                    }
                }

                .action-card:hover {
                    transform: translateY(-8px) scale(1.02);
                    box-shadow: 0 20px 50px rgba(255, 255, 255, 0.17);
                }
                
                .action-icon {
                    font-size: 36px;
                    background: linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%);
                    width: 72px;
                    height: 72px;
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
                    color: var(--primary);
                    border: 1px solid rgba(0, 0, 0, 0.03);
                    position: relative;
                    z-index: 2;
                }

                .action-card:hover .action-icon {
                    background: #8eb7f0ff;
                    color: white;
                    transform: scale(1.15) rotate(10deg);
                    box-shadow: 0 15px 30px rgba(0, 70, 168, 0.78);
                }

                /* Enhanced Info Card */
                .info-card {
                    background: white;
                    border-radius: 24px;
                    padding: 32px;
                    border: 1px solid rgba(0, 0, 0, 0.05);
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.02);
                    position: relative;
                    overflow: hidden;
                }
                
                .info-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 6px;
                    background: linear-gradient(90deg, #0047AB, #60a5fa);
                }
                
                .card-header {
                    display: flex;
                    align-items: flex-start;
                    gap: 16px;
                    margin-bottom: 32px;
                    border-bottom: 1px solid #f1e4e4ff;
                    padding-bottom: 24px;
                }

                .header-icon {
                    font-size: 28px;
                    background: #eff6ff;
                    padding: 12px;
                    border-radius: 12px;
                }

                .card-subtitle {
                    color: #64748b;
                    font-size: 0.9rem;
                    margin-top: 4px;
                }

                .info-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 24px;
                }

                .info-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 16px;
                    padding: 16px;
                    background: #f8fafc;
                    border-radius: 16px;
                    transition: all 0.3s ease;
                }

                .info-item:hover {
                    background: #eff6ff;
                    transform: translateY(-2px);
                }

                .info-icon {
                    font-size: 24px;
                    background: white;
                    padding: 10px;
                    border-radius: 12px;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.02);
                }

                .info-content label {
                    display: block;
                    color: #64748b;
                    font-size: 0.8rem;
                    font-weight: 500;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 4px;
                }

                .info-content p {
                    color: #0f172a;
                    font-weight: 600;
                    font-size: 1rem;
                    margin: 0;
                }

                /* Vision Card Enhancements */
                .vision-card {
                    background: linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%);
                    color: white;
                    border-radius: 24px;
                    padding: 32px;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.4);
                }

                /* Shimmer Glow Border */
                .vision-card::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    border-radius: 24px; 
                    padding: 2px; 
                    background: linear-gradient(45deg, transparent, rgba(96, 165, 250, 0.8), rgba(251, 191, 36, 0.8), transparent); 
                    background-size: 200% 200%; 
                    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                    -webkit-mask-composite: xor;
                    mask-composite: exclude;
                    animation: shimmer-border 3s linear infinite;
                    pointer-events: none;
                }

                /* Background Blur/Glow behind */
                .vision-card::after {
                    content: '';
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: radial-gradient(circle at 50% 50%, rgba(96, 165, 250, 0.1), transparent 60%);
                    animation: rotate-glow 10s linear infinite;
                    pointer-events: none;
                    z-index: 0;
                }

                .vision-card .card-header {
                    border-bottom-color: rgba(255,255,255,0.1);
                    align-items: center;
                    position: relative;
                    z-index: 1;
                }
                
                .vision-card .header-icon {
                    background: rgba(255, 255, 255, 0.1);
                }

                .vision-card h3 {
                    color: white;
                }

                .vision-content {
                    display: grid;
                    grid-template-columns: 1fr auto 1fr;
                    gap: 32px;
                    align-items: start;
                    position: relative;
                    z-index: 1;
                }

                .vision-divider {
                    width: 1px;
                    height: 100%;
                    background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.2), transparent);
                }

                .vision-block h4 {
                    color: #60a5fa; /* Light Blue */
                    font-size: 1.1rem;
                    margin-bottom: 16px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .vision-block p, .vision-block li {
                    color: #cbd5e1; /* Slate 300 - readable on dark */
                    line-height: 1.6;
                    font-size: 0.95rem;
                }

                .vision-block ul {
                    padding-left: 20px;
                }

                .vision-block li {
                    margin-bottom: 8px;
                }

                @media (max-width: 768px) {
                    /* Department Info Card Mobile Styles */
                    .info-card {
                        padding: 20px;
                        border-radius: 16px;
                    }
                    
                    
                    .card-header {
                        flex-direction: row;
                        flex-wrap: wrap;
                        gap: 12px;
                        margin-bottom: 16px;
                        padding-bottom: 12px;
                        align-items: center;
                    }
                    
                    .header-icon {
                        font-size: 28px;
                        padding: 8px;
                        flex-shrink: 0;
                    }
                    
                    .card-header > div:nth-child(2) {
                        flex: 1;
                        min-width: 0;
                    }
                    
                    .card-header h3 {
                        font-size: 1rem;
                        line-height: 1.3;
                        margin: 0 0 2px 0;
                    }
                    
                    .card-subtitle {
                        font-size: 0.75rem;
                        margin-top: 0;
                    }
                    
                    .card-header .badge {
                        font-size: 0.7rem;
                        padding: 4px 10px;
                        white-space: nowrap;
                    }
                    
                    .info-grid {
                        grid-template-columns: 1fr;
                        gap: 12px;
                    }
                    
                    .info-item {
                        padding: 14px;
                        gap: 12px;
                    }
                    
                    .info-icon {
                        font-size: 20px;
                        padding: 8px;
                        flex-shrink: 0;
                    }
                    
                    .info-content label {
                        font-size: 0.7rem;
                    }
                    
                    .info-content p {
                        font-size: 0.9rem;
                    }
                    
                    .vision-content {
                        grid-template-columns: 1fr;
                    }
                    .vision-divider {
                        display: none;
                    }
                }
                
                @keyframes shimmer-border {
                    0% { background-position: 0% 50%; }
                    100% { background-position: 200% 50%; }
                }

                @keyframes rotate-glow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }


                /* Keyframes */
                @keyframes aurora {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }

                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @keyframes fadeInRight {
                    from { opacity: 0; transform: translateX(-20px); }
                    to { opacity: 1; transform: translateX(0); }
                }

                @keyframes slideInRight {
                    from { opacity: 0; transform: translateX(30px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                
                @keyframes pulse-glow {
                    0%, 100% { opacity: 0.5; transform: scale(1); }
                    50% { opacity: 0.8; transform: scale(1.1); }
                }

                @keyframes typing {
                    from { width: 0 }
                    to { width: 100% }
                }
                
                @keyframes blink-caret {
                    from, to { border-color: transparent }
                    50% { border-color: white; }
                }

                .hero-welcome .badge {
                    animation: pulse-glow 3s infinite;
                    margin-bottom: 5px;
                }
                
                /* Typing effect for H1 */
                .hero-welcome h1 {
                    display: inline-block;
                    overflow: hidden;
                    white-space: nowrap;
                    border-right: 3px solid white;
                    animation: 
                        fadeInUp 0.8s ease-out 0.2s backwards,
                        typing 2s steps(30, end) 0.5s both,
                        blink-caret 0.75s step-end infinite;
                    max-width: fit-content;
                    padding-top: 15px 
                }

                /* Staggered Action Cards */
                .action-card {
                    animation: fadeInUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) backwards;
                }
                .action-card:nth-child(1) { animation-delay: 0.3s; }
                .action-card:nth-child(2) { animation-delay: 0.4s; }
                .action-card:nth-child(3) { animation-delay: 0.5s; }
                .action-card:nth-child(4) { animation-delay: 0.6s; }

                /* Tablet and below */
                @media (max-width: 968px) {
                    .dashboard-layout { grid-template-columns: 1fr; }
                    .dashboard-hero { flex-direction: column; align-items: flex-start; gap: 24px; padding: 24px; }
                    .hero-stats-grid { 
                        display: flex;
                        flex-direction: column;
                        width: 100%; 
                        overflow-x: auto; 
                        padding-bottom: 12px; 
                        justify-content: flex-start;
                        gap: 16px;
                    }
                    .stat-card {
                        min-width: 160px;
                        flex: 0 0 auto;
                    }
                    .sidebar { animation: fadeInUp 0.8s ease-out 0.4s backwards; }
                }

                @media (max-width: 768px) {
                    .quick-links-grid {
                         grid-template-columns: repeat(2, 1fr);
                         gap: 16px;
                    }
                    h3{
                      font-size:
                    }
                    .action-card {
                         padding: 16px;
                    }
                    .action-icon {
                         width: 56px;
                         height: 56px;
                         font-size: 28px;
                    }
                    .calendar-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 16px;
                    }
                    .calendar-card {
                        padding: 16px;
                        border-radius: 16px;
                    }
                    .calendar-header-day{
                        padding: 4px 2px;
                        font-size: 0.65rem;
                    }
                    .calendar-controls {
                        width: 100%;
                        justify-content: space-between;
                        flex-direction: row;
                        gap: 8px;
                    }
                    .btn-nav, .btn-today {
                        padding: 8px 12px;
                        font-size: 0.75rem;
                        flex: 1;
                    }
                    .calendar-month-year h3 {
                        font-size: 1.25rem;
                    }
                    .calendar-grid {
                        gap: 4px;
                    }
                    .calendar-day {
                        padding: 4px;
                        border-radius: 8px;
                        gap: 2px;
                    }
                    .day-number {
                        font-size: 0.75rem;
                    }
                    .event-symbol {
                        font-size: 0.7rem;
                    }
                    .calendar-legend {
                        padding: 12px;
                    }
                    .calendar-legend h4 {
                        font-size: 0.85rem;
                        margin-bottom: 8px;
                    }
                    .legend-item {
                        font-size: 0.75rem;
                        gap: 6px;
                    }
                    .vision-content {
                        grid-template-columns: 1fr;
                        gap: 24px;
                    }
                    .vision-divider {
                         display: none;
                    }
                    .dashboard-hero h1 {
                        font-size: 1.5rem;
                    }
                }

                /* Recent Downloads Premium Styles */
                .sidebar-card {
                    background: white;
                    border-radius: 24px;
                    padding: 24px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.02);
                    border: 1px solid rgba(0,0,0,0.05);
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                    margin-bottom: 24px;
                }

                .sidebar-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.08);
                }

                .sidebar-card h3 {
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: #1e293b;
                    margin-bottom: 20px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .downloads-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .download-item {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 12px;
                    border-radius: 16px;
                    background: #f8fafc;
                    border: 1px solid transparent;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    cursor: pointer;
                    animation: slideInRight 0.5s ease backwards;
                }

                .download-item:nth-child(1) { animation-delay: 0.1s; }
                .download-item:nth-child(2) { animation-delay: 0.2s; }
                .download-item:nth-child(3) { animation-delay: 0.3s; }
                .download-item:nth-child(4) { animation-delay: 0.4s; }
                .download-item:nth-child(5) { animation-delay: 0.5s; }

                .download-item:hover {
                    background: #eff6ff;
                    border-color: rgba(59, 130, 246, 0.3);
                    transform: translateX(5px) scale(1.02);
                    box-shadow: 0 8px 20px rgba(59, 130, 246, 0.1);
                }

                .download-icon {
                    width: 42px;
                    height: 42px;
                    background: white;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
                    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.3s ease, color 0.3s ease;
                    color: #64748b;
                }

                .download-item:hover .download-icon {
                    transform: scale(1.15) rotate(-8deg);
                    background: #3b82f6;
                    color: white;
                }

                .download-info {
                    flex: 1;
                    min-width: 0;
                }

                .download-title {
                    font-weight: 600;
                    color: #334155;
                    font-size: 0.9rem;
                    margin-bottom: 2px;
                    transition: color 0.2s ease;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .download-item:hover .download-title {
                    color: #1d4ed8;
                }

                .download-meta {
                    font-size: 0.75rem;
                    color: #94a3b8;
                    display: block;
                }
            `}</style>

        </div>
    );
};

export default Dashboard;
