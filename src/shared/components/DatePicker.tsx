import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = 'Seleccionar fecha',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(() => {
    return value ? new Date(value) : new Date();
  });

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const handleDateSelect = (day: number) => {
    const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    onChange(formatDate(selectedDate));
    setIsOpen(false);
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const renderCalendarDays = () => {
    const days = [];
    
    // Días vacíos al inicio
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8" />);
    }
    
    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = value === formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
      const isToday = formatDate(new Date()) === formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
      
      days.push(
        <button
          key={day}
          onClick={() => handleDateSelect(day)}
          className={`w-8 h-8 rounded-full text-sm transition-colors ${
            isSelected
              ? 'bg-primary text-white'
              : isToday
              ? 'bg-surface text-primary border border-primary'
              : 'hover:bg-surface text-text'
          }`}
        >
          {day}
        </button>
      );
    }
    
    return days;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="input-field w-full flex items-center justify-between"
      >
        <span className={value ? 'text-text' : 'text-textMedium'}>
          {value ? new Date(value).toLocaleDateString('es-ES') : placeholder}
        </span>
        <Calendar className="w-4 h-4 text-textMedium" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-surface border border-surface rounded-lg shadow-lg z-10 p-4 min-w-[280px]">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={goToPreviousMonth}
              className="p-1 hover:bg-surface/50 rounded"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h3 className="font-medium text-text">
              {months[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <button
              onClick={goToNextMonth}
              className="p-1 hover:bg-surface/50 rounded"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
              <div key={day} className="w-8 h-8 flex items-center justify-center text-xs text-textMedium font-medium">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {renderCalendarDays()}
          </div>
        </div>
      )}
    </div>
  );
}; 