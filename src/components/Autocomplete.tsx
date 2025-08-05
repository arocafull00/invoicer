import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search } from 'lucide-react';

interface Option {
  id: string;
  name: string;
  email?: string;
}

interface AutocompleteProps {
  options: Option[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  onAddNew?: (name: string) => void;
}

export const Autocomplete: React.FC<AutocompleteProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Buscar...',
  label,
  error,
  onAddNew,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<Option[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(option => option.id === value);

  useEffect(() => {
    const filtered = options.filter(option =>
      option.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (option.email && option.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredOptions(filtered);
  }, [options, searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option: Option) => {
    onChange(option.id);
    setSearchTerm(option.name);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    setIsOpen(true);
    
    if (!newValue) {
      onChange('');
    }
  };

  const handleAddNew = () => {
    if (onAddNew && searchTerm.trim()) {
      onAddNew(searchTerm.trim());
      setSearchTerm('');
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={wrapperRef}>
      {label && (
        <label className="block text-sm font-medium text-text mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type="text"
          value={searchTerm || selectedOption?.name || ''}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={`input-field w-full pr-10 ${error ? 'border-red-500' : ''}`}
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          <Search className="w-4 h-4 text-textMedium" />
          <ChevronDown className={`w-4 h-4 text-textMedium transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-surface border border-surface rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleSelect(option)}
                className="w-full px-4 py-2 text-left hover:bg-surface/50 transition-colors border-b border-surface/20 last:border-b-0"
              >
                <div className="font-medium text-text">{option.name}</div>
                {option.email && (
                  <div className="text-sm text-textMedium">{option.email}</div>
                )}
              </button>
            ))
          ) : searchTerm ? (
            <div className="px-4 py-2 text-textMedium">
              No se encontraron resultados
              {onAddNew && (
                <button
                  onClick={handleAddNew}
                  className="block w-full mt-2 text-primary hover:text-accent text-left"
                >
                  + Agregar "{searchTerm}"
                </button>
              )}
            </div>
          ) : (
            <div className="px-4 py-2 text-textMedium">
              No hay opciones disponibles
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 