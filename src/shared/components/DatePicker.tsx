import React, { useMemo, useState } from 'react';
import { Calendar } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-day-picker/dist/style.css';

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

  const selectedDate = useMemo(() => {
    return value ? new Date(value) : undefined;
  }, [value]);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="input-field w-full flex items-center justify-between"
      >
        <span className={value ? 'text-text' : 'text-textMedium'}>
          {value ? new Date(value).toLocaleDateString('es-ES') : placeholder}
        </span>
        <Calendar className="w-4 h-4 text-textMedium" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-surface border border-surface rounded-lg shadow-lg z-10 p-4 min-w-[280px]">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              if (!date) return;
              onChange(format(date, 'yyyy-MM-dd'));
              setIsOpen(false);
            }}
            locale={es}
            className="text-text"
            classNames={{
              caption: 'flex items-center justify-between mb-3',
              nav: 'flex items-center gap-2',
              months: 'space-y-2',
              month: 'space-y-2',
              weekdays: 'grid grid-cols-7 gap-1 text-xs text-textMedium',
              week: 'grid grid-cols-7 gap-1',
              day: 'w-8 h-8 rounded-full text-sm hover:bg-surface transition-colors',
              day_selected: 'bg-primary text-white',
              day_today: 'border border-primary text-primary',
              head_cell: 'w-8 h-8 flex items-center justify-center font-medium',
            }}
          />
        </div>
      )}
    </div>
  );
};