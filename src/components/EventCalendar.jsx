import { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useContent } from '../contexts/ContentContext';
import { ChevronLeft, ChevronRight, CalendarDays, X, Clock, MapPin, Ticket, Languages, Shirt, Euro, FileText } from 'lucide-react';
import clsx from 'clsx';

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

function toDateKey(year, month, day) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function formatDateLabel(dateKey) {
    const d = new Date(dateKey + 'T00:00:00');
    return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

const EMPTY_EVENT = {
    title: '',
    description: '',
    location: '',
    doorTime: '',
    startTime: '',
    endTime: '',
    price: '',
    dressCode: '',
    language: '',
    ticketLink: '',
    ticketSalesOpen: '',
};

export default function EventCalendar({ onEventSave, className }) {
    const { isLoggedIn } = useAuth();
    const { getContent, updateContent } = useContent();

    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [selectedDate, setSelectedDate] = useState(null);
    const [formData, setFormData] = useState({ ...EMPTY_EVENT });

    const events = getContent('calendar-events', {});

    const calendarDays = useMemo(() => {
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const daysInMonth = lastDay.getDate();

        let startDow = firstDay.getDay() - 1;
        if (startDow < 0) startDow = 6;

        const days = [];

        const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
        for (let i = startDow - 1; i >= 0; i--) {
            days.push({ day: prevMonthLastDay - i, inMonth: false, dateKey: null });
        }

        for (let d = 1; d <= daysInMonth; d++) {
            days.push({
                day: d,
                inMonth: true,
                dateKey: toDateKey(currentYear, currentMonth, d),
            });
        }

        const remaining = 7 - (days.length % 7);
        if (remaining < 7) {
            for (let i = 1; i <= remaining; i++) {
                days.push({ day: i, inMonth: false, dateKey: null });
            }
        }

        return days;
    }, [currentMonth, currentYear]);

    const goToPrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(y => y - 1);
        } else {
            setCurrentMonth(m => m - 1);
        }
    };

    const goToNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(y => y + 1);
        } else {
            setCurrentMonth(m => m + 1);
        }
    };

    const goToToday = () => {
        setCurrentMonth(today.getMonth());
        setCurrentYear(today.getFullYear());
    };

    const isToday = (dateKey) => {
        return dateKey === toDateKey(today.getFullYear(), today.getMonth(), today.getDate());
    };

    const hasEvents = (dateKey) => {
        return dateKey && events[dateKey] && events[dateKey].length > 0;
    };

    const handleDateClick = (dateKey) => {
        if (!dateKey || !isLoggedIn) return;
        setSelectedDate(dateKey);
        // Pre-fill if there's an existing event on this date
        const existing = events[dateKey]?.[0];
        setFormData(existing ? { ...EMPTY_EVENT, ...existing } : { ...EMPTY_EVENT });
    };

    const handleCloseSidebar = () => {
        setSelectedDate(null);
        setFormData({ ...EMPTY_EVENT });
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        if (!selectedDate) return;
        const updatedEvents = { ...events };
        updatedEvents[selectedDate] = [formData];
        updateContent('calendar-events', updatedEvents);
        if (onEventSave) onEventSave(selectedDate, formData);
        handleCloseSidebar();
    };

    const handleDelete = () => {
        if (!selectedDate) return;
        const updatedEvents = { ...events };
        delete updatedEvents[selectedDate];
        updateContent('calendar-events', updatedEvents);
        handleCloseSidebar();
    };

    return (
        <div className={clsx('flex gap-0 w-full', className)}>
            {/* Calendar Side */}
            <div className={clsx(
                'transition-all duration-300',
                selectedDate ? 'w-1/2 flex-shrink-0' : 'w-full'
            )}>
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <CalendarDays className="w-5 h-5 text-[#a41e32]" />
                        <h3 className="text-xl font-bold text-white">
                            {MONTH_NAMES[currentMonth]} {currentYear}
                        </h3>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={goToToday}
                            className="px-2.5 py-1 text-xs font-medium text-gray-400 hover:text-white border border-white/10 hover:border-white/20 rounded-full transition-all bg-transparent"
                        >
                            Today
                        </button>
                        <button
                            onClick={goToPrevMonth}
                            className="p-1.5 rounded-full border border-white/10 hover:border-white/20 hover:bg-white/5 text-gray-400 hover:text-white transition-all bg-transparent"
                            aria-label="Previous month"
                        >
                            <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={goToNextMonth}
                            className="p-1.5 rounded-full border border-white/10 hover:border-white/20 hover:bg-white/5 text-gray-400 hover:text-white transition-all bg-transparent"
                            aria-label="Next month"
                        >
                            <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                {/* Day-of-week Headers */}
                <div className="grid grid-cols-7 mb-1">
                    {DAYS_OF_WEEK.map(day => (
                        <div
                            key={day}
                            className="text-center text-[10px] font-semibold text-gray-500 uppercase tracking-wider py-1.5"
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Day Grid */}
                <div className="grid grid-cols-7 gap-px bg-white/5 rounded-xl overflow-hidden border border-white/5">
                    {calendarDays.map((cell, idx) => {
                        const todayCell = cell.inMonth && isToday(cell.dateKey);
                        const hasEvt = cell.inMonth && hasEvents(cell.dateKey);
                        const clickable = cell.inMonth && isLoggedIn;
                        const isSelected = cell.dateKey === selectedDate;

                        return (
                            <button
                                key={idx}
                                onClick={() => handleDateClick(cell.dateKey)}
                                disabled={!clickable}
                                className={clsx(
                                    'relative flex flex-col items-center justify-center py-2.5 md:py-3 transition-all duration-150 bg-[#0d0d0d]',
                                    cell.inMonth ? 'text-gray-300' : 'text-gray-700',
                                    clickable && 'hover:bg-[#1a1a1a] cursor-pointer',
                                    !clickable && 'cursor-default',
                                    todayCell && 'bg-[#a41e32]/10',
                                    isSelected && 'bg-[#a41e32]/20 ring-1 ring-[#a41e32]/50'
                                )}
                            >
                                <span
                                    className={clsx(
                                        'relative z-10 text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full transition-colors',
                                        todayCell && 'bg-[#a41e32] text-white font-bold shadow-[0_0_12px_rgba(164,30,50,0.4)]'
                                    )}
                                >
                                    {cell.day}
                                </span>

                                {hasEvt && (
                                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                                        {events[cell.dateKey].slice(0, 3).map((_, i) => (
                                            <span key={i} className="w-1 h-1 rounded-full bg-[#a41e32]" />
                                        ))}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {isLoggedIn && !selectedDate && (
                    <p className="text-xs text-gray-600 mt-3 text-center italic">
                        Click on a date to add or manage events
                    </p>
                )}
            </div>

            {/* Event Form Sidebar */}
            {selectedDate && (
                <div className="w-1/2 flex-shrink-0 border-l border-white/10 pl-6 ml-6 animate-in slide-in-from-right">
                    {/* Sidebar Header */}
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h4 className="text-lg font-bold text-white">New Event</h4>
                            <p className="text-xs text-gray-500 mt-0.5">{formatDateLabel(selectedDate)}</p>
                        </div>
                        <button
                            onClick={handleCloseSidebar}
                            className="p-1.5 rounded-full hover:bg-white/5 text-gray-500 hover:text-white transition-colors bg-transparent border-none cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
                        {/* WHAT */}
                        <FormField icon={<CalendarDays className="w-3.5 h-3.5" />} label="WHAT?">
                            <input
                                type="text"
                                placeholder="Event name"
                                value={formData.title}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                                className="form-input"
                            />
                        </FormField>

                        {/* DESCRIPTION */}
                        <FormField icon={<FileText className="w-3.5 h-3.5" />} label="DESCRIPTION">
                            <textarea
                                placeholder="Describe the event..."
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                className="form-input min-h-[80px] resize-y"
                                rows={3}
                            />
                        </FormField>

                        {/* WHERE */}
                        <FormField icon={<MapPin className="w-3.5 h-3.5" />} label="WHERE?">
                            <input
                                type="text"
                                placeholder="Location"
                                value={formData.location}
                                onChange={(e) => handleInputChange('location', e.target.value)}
                                className="form-input"
                            />
                        </FormField>

                        {/* WHEN */}
                        <FormField icon={<Clock className="w-3.5 h-3.5" />} label="WHEN?">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-gray-600 w-14 flex-shrink-0">Doors</span>
                                    <input
                                        type="time"
                                        value={formData.doorTime}
                                        onChange={(e) => handleInputChange('doorTime', e.target.value)}
                                        className="form-input"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-gray-600 w-14 flex-shrink-0">Start</span>
                                    <input
                                        type="time"
                                        value={formData.startTime}
                                        onChange={(e) => handleInputChange('startTime', e.target.value)}
                                        className="form-input"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-gray-600 w-14 flex-shrink-0">End</span>
                                    <input
                                        type="time"
                                        value={formData.endTime}
                                        onChange={(e) => handleInputChange('endTime', e.target.value)}
                                        className="form-input"
                                    />
                                </div>
                            </div>
                        </FormField>

                        {/* PRICE */}
                        <FormField icon={<Euro className="w-3.5 h-3.5" />} label="PRICE">
                            <input
                                type="text"
                                placeholder="e.g. 25€ / Free"
                                value={formData.price}
                                onChange={(e) => handleInputChange('price', e.target.value)}
                                className="form-input"
                            />
                        </FormField>

                        {/* DRESS CODE */}
                        <FormField icon={<Shirt className="w-3.5 h-3.5" />} label="DC">
                            <input
                                type="text"
                                placeholder="Dress code"
                                value={formData.dressCode}
                                onChange={(e) => handleInputChange('dressCode', e.target.value)}
                                className="form-input"
                            />
                        </FormField>

                        {/* LANGUAGE */}
                        <FormField icon={<Languages className="w-3.5 h-3.5" />} label="LANGUAGE">
                            <input
                                type="text"
                                placeholder="e.g. English, Finnish"
                                value={formData.language}
                                onChange={(e) => handleInputChange('language', e.target.value)}
                                className="form-input"
                            />
                        </FormField>

                        {/* TICKETS */}
                        <FormField icon={<Ticket className="w-3.5 h-3.5" />} label="TICKETS">
                            <div className="space-y-2">
                                <input
                                    type="url"
                                    placeholder="Ticket sales link"
                                    value={formData.ticketLink}
                                    onChange={(e) => handleInputChange('ticketLink', e.target.value)}
                                    className="form-input"
                                />
                                <input
                                    type="text"
                                    placeholder="Sales open (e.g. Mar 10, 12:00)"
                                    value={formData.ticketSalesOpen}
                                    onChange={(e) => handleInputChange('ticketSalesOpen', e.target.value)}
                                    className="form-input"
                                />
                            </div>
                        </FormField>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-5 pt-4 border-t border-white/5">
                        {hasEvents(selectedDate) && (
                            <button
                                onClick={handleDelete}
                                className="px-3 py-2 text-xs font-medium text-red-400 hover:text-red-300 border border-red-900/30 hover:bg-red-900/10 rounded-lg transition-colors bg-transparent cursor-pointer"
                            >
                                Delete
                            </button>
                        )}
                        <div className="flex-grow" />
                        <button
                            onClick={handleCloseSidebar}
                            className="px-3 py-2 text-xs font-medium text-gray-400 hover:text-white border border-white/10 hover:border-white/20 rounded-lg transition-colors bg-transparent cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 text-xs font-medium text-white bg-[#a41e32] hover:bg-[#8e192b] rounded-lg transition-colors border-none cursor-pointer shadow-[0_0_10px_rgba(164,30,50,0.2)]"
                        >
                            Save Event
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function FormField({ icon, label, children }) {
    return (
        <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-[#a41e32] uppercase tracking-wider mb-1.5">
                {icon}
                {label}
            </label>
            {children}
        </div>
    );
}
