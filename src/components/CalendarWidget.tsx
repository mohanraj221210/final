import React, { useState } from 'react';

const CalendarWidget: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const renderDays = () => {
        const days = [];
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-${i}`} className="cal-day empty"></div>);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            const isToday = new Date().getDate() === i && new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear();
            days.push(
                <div key={i} className={`cal-day ${isToday ? 'today' : ''}`}>
                    {i}
                </div>
            );
        }
        return days;
    };

    return (
        <div className="lux-widget-card lux-calendar-widget">
            <div className="cal-header">
                <button onClick={prevMonth} className="cal-nav-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                <h3>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
                <button onClick={nextMonth} className="cal-nav-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
            </div>
            <div className="cal-grid">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <div key={day} className="cal-day-name">{day}</div>
                ))}
                {renderDays()}
            </div>
            <style>{`
                .lux-calendar-widget { 
                    padding: 24px; 
                    display: flex; 
                    flex-direction: column; 
                    gap: 16px; 
                    background: rgba(255, 255, 255, 0.85) !important;
                    backdrop-filter: blur(12px) !important;
                    -webkit-backdrop-filter: blur(12px) !important;
                    border: 1px solid rgba(77, 166, 255, 0.15) !important;
                    border-radius: 24px !important;
                    box-shadow: 0 10px 30px rgba(77, 166, 255, 0.04) !important;
                }
                .cal-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 8px; border-bottom: 1px solid rgba(15, 23, 42, 0.05); }
                .cal-header h3 { margin: 0; font-size: 16px; font-weight: 800; color: #0F172A; }
                .cal-nav-btn { background: rgba(77, 166, 255, 0.1); border: none; width: 36px; height: 36px; border-radius: 12px; color: #2563EB; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
                .cal-nav-btn:hover { background: #4DA6FF; color: white; transform: scale(1.05); }
                .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 10px; text-align: center; }
                .cal-day-name { font-size: 12px; font-weight: 800; color: #64748B; margin-bottom: 8px; text-transform: uppercase; }
                .cal-day { font-size: 14px; font-weight: 700; color: #0F172A; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 12px; margin: 0 auto; transition: all 0.2s; }
                .cal-day.empty { background: transparent; pointer-events: none; }
                .cal-day:not(.empty):hover { background: rgba(77, 166, 255, 0.15); cursor: pointer; color: #2563EB; transform: scale(1.1); }
                .cal-day.today { background: linear-gradient(135deg, #4DA6FF, #2563EB); color: white; box-shadow: 0 4px 16px rgba(37, 99, 235, 0.3); transform: scale(1.05); }
            `}</style>
        </div>
    );
};

export default CalendarWidget;
