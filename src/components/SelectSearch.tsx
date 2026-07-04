'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';

interface SelectSearchProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; searchText?: string }[];
  placeholder?: string;
  required?: boolean;
}

export default function SelectSearch({ label, value, onChange, options, placeholder = 'Buscar...', required = false }: SelectSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [displayValue, setDisplayValue] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    if (selectedOption) {
      setDisplayValue(selectedOption.label);
    }
  }, [selectedOption]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => {
    const searchLower = search.toLowerCase();
    return (
      opt.label.toLowerCase().includes(searchLower) ||
      (opt.searchText && opt.searchText.toLowerCase().includes(searchLower)) ||
      opt.value.toLowerCase().includes(searchLower)
    );
  });

  const handleSelect = (optValue: string, optLabel: string) => {
    onChange(optValue);
    setDisplayValue(optLabel);
    setSearch('');
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-left flex items-center justify-between hover:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
      >
        <span className={displayValue ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}>
          {displayValue || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-60 overflow-hidden">
          {/* Search input */}
          <div className="p-2 border-b border-gray-100 dark:border-gray-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar..."
                className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                autoFocus
              />
            </div>
          </div>

          {/* Options */}
          <div className="overflow-y-auto max-h-48">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-3 text-sm text-gray-500 dark:text-gray-400">No se encontraron resultados</div>
            ) : (
              filteredOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value, opt.label)}
                  className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                    opt.value === value
                      ? 'bg-brand-primary/10 text-brand-primary font-medium'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
