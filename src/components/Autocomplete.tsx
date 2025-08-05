import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Plus } from 'lucide-react';

interface AutocompleteProps<T> {
  options: T[];
  value: T | null;
  onChange: (value: T) => void;
  getOptionLabel: (option: T) => string;
  placeholder?: string;
  onAddNew?: (label: string) => void;
}

export const Autocomplete = <T,>({
  options,
  value,
  onChange,
  getOptionLabel,
  placeholder = 'Buscar...',
  onAddNew,
}: AutocompleteProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddNew, setShowAddNew] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
        setShowAddNew(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(option =>
    getOptionLabel(option).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (option: T) => {
    onChange(option);
    setIsOpen(false);
    setSearchTerm('');
    setShowAddNew(false);
  };

  const handleAddNewClick = () => {
    if (onAddNew && searchTerm.trim()) {
      onAddNew(searchTerm.trim());
      setSearchTerm('');
      setShowAddNew(false);
      setIsOpen(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsOpen(true);
    setShowAddNew(value.trim() && !filteredOptions.some(option => 
      getOptionLabel(option).toLowerCase() === value.toLowerCase()
    ));
  };

  const handleInputClick = () => {
    setIsOpen(true);
    setShowAddNew(searchTerm.trim() && !filteredOptions.some(option => 
      getOptionLabel(option).toLowerCase() === searchTerm.toLowerCase()
    ));
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={isOpen ? searchTerm : (value ? getOptionLabel(value) : '')}
          onChange={handleInputChange}
          onClick={handleInputClick}
          placeholder={placeholder}
          className="input-field w-full pr-10"
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {isOpen && <Search className="w-4 h-4 text-textMedium" />}
          <ChevronDown className={`w-4 h-4 text-textMedium transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-surface rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
          {filteredOptions.length === 0 && !showAddNew ? (
            <div className="px-3 py-2 text-textMedium text-sm">
              No se encontraron resultados
            </div>
          ) : (
            <>
              {filteredOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleSelect(option)}
                  className="w-full px-3 py-2 text-left hover:bg-surface/50 transition-colors text-text"
                >
                  {getOptionLabel(option)}
                </button>
              ))}
              
              {showAddNew && onAddNew && (
                <button
                  onClick={handleAddNewClick}
                  className="w-full px-3 py-2 text-left hover:bg-surface/50 transition-colors text-primary flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Añadir "{searchTerm}"</span>
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}; 