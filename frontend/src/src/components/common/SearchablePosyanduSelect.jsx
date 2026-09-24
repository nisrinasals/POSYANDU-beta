import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Check, X, MapPin } from 'lucide-react';
import { daftarPosyandu2026 } from '../../data/mockData';

export default function SearchablePosyanduSelect({
  value = '',
  onChange,
  placeholder = 'Ketik untuk mencari nama Posyandu / Kelurahan...',
  disabled = false,
  required = false,
  name = 'posyandu',
  id,
  className = '',
  onSelectPosyandu
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Sync searchTerm with current selected value when dropdown is closed
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm(value || '');
    }
  }, [value, isOpen]);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm(value || '');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value]);

  // Filtered posyandu list based on search term
  const filteredList = useMemo(() => {
    if (!searchTerm || !searchTerm.trim()) {
      return daftarPosyandu2026.slice(0, 40); // Show first 40 when blank
    }
    const term = searchTerm.toLowerCase().trim();
    return daftarPosyandu2026.filter((item) => {
      const matchNama = (item.nama || '').toLowerCase().includes(term);
      const matchKel = (item.kelurahan || '').toLowerCase().includes(term);
      const matchKec = (item.kecamatan || '').toLowerCase().includes(term);
      const matchPkm = (item.puskesmas || '').toLowerCase().includes(term);
      return matchNama || matchKel || matchKec || matchPkm;
    }).slice(0, 60); // Cap at top 60 for instant rendering performance
  }, [searchTerm]);

  const handleSelect = (posyandu) => {
    if (onChange) {
      // Pass synthetic event compatible with standard form handlers
      onChange({
        target: {
          name: name,
          value: posyandu.nama
        }
      }, posyandu);
    }
    if (onSelectPosyandu) {
      onSelectPosyandu(posyandu);
    }
    setSearchTerm(posyandu.nama);
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setSearchTerm('');
    if (onChange) {
      onChange({
        target: {
          name: name,
          value: ''
        }
      }, null);
    }
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < filteredList.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredList.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredList[highlightedIndex]) {
        handleSelect(filteredList[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm(value || '');
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (isOpen && listRef.current && listRef.current.children[highlightedIndex]) {
      listRef.current.children[highlightedIndex].scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [highlightedIndex, isOpen]);

  return (
    <div className={`position-relative ${className}`} ref={containerRef} style={{ width: '100%' }}>
      {/* Input Field with Search Icon & Dropdown Arrow */}
      <div 
        className={`input-group ${disabled ? 'bg-light' : 'bg-white'} border rounded-3 overflow-hidden shadow-xs`}
        style={{
          borderColor: isOpen ? '#F25B8E' : '#d1d5db',
          boxShadow: isOpen ? '0 0 0 3px rgba(242, 91, 142, 0.25)' : 'none',
          transition: 'all 0.15s ease'
        }}
      >
        <span className="input-group-text bg-transparent border-0 text-muted ps-3 pe-2">
          <Search size={15} />
        </span>
        <input
          ref={inputRef}
          id={id}
          name={name}
          type="text"
          className="form-control border-0 bg-transparent text-dark small py-2 px-1"
          placeholder={placeholder}
          value={isOpen ? searchTerm : (value || '')}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!isOpen) setIsOpen(true);
            setHighlightedIndex(0);
          }}
          onFocus={() => {
            if (!disabled) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          required={required && !value}
          autoComplete="off"
          style={{ fontSize: '0.85rem' }}
        />
        {value && !disabled && (
          <button
            type="button"
            className="btn btn-link text-muted p-1 me-1 text-decoration-none border-0"
            onClick={handleClear}
            title="Hapus pilihan"
            tabIndex={-1}
          >
            <X size={14} />
          </button>
        )}
        <button
          type="button"
          className="btn btn-link text-muted px-2.5 text-decoration-none border-0"
          onClick={() => {
            if (!disabled) {
              setIsOpen(!isOpen);
              if (!isOpen) inputRef.current?.focus();
            }
          }}
          tabIndex={-1}
        >
          <ChevronDown 
            size={16} 
            style={{ 
              transform: isOpen ? 'rotate(180deg)' : 'none', 
              transition: 'transform 0.2s ease' 
            }} 
          />
        </button>
      </div>

      {/* Floating Dropdown Results Menu */}
      {isOpen && (
        <div
          className="position-absolute start-0 end-0 mt-1 bg-white rounded-3 shadow-lg border overflow-hidden"
          style={{
            zIndex: 1050,
            maxHeight: '280px',
            animation: 'fadeIn 0.15s ease'
          }}
        >
          {/* Header Info */}
          <div className="d-flex align-items-center justify-content-between px-3 py-1.5 bg-light border-bottom text-muted" style={{ fontSize: '0.725rem' }}>
            <span>
              {searchTerm 
                ? `Hasil pencarian "${searchTerm}" (${filteredList.length})` 
                : `Menampilkan ${filteredList.length} dari 611 Posyandu`}
            </span>
            <span>Ketik untuk menyaring</span>
          </div>

          {/* Results List */}
          <div 
            ref={listRef} 
            className="overflow-y-auto" 
            style={{ maxHeight: '235px' }}
          >
            {filteredList.length > 0 ? (
              filteredList.map((item, index) => {
                const isSelected = item.nama === value;
                const isHighlighted = index === highlightedIndex;
                return (
                  <div
                    key={item.no || item.id || index}
                    className={`d-flex align-items-center justify-content-between px-3 py-2 cursor-pointer border-bottom border-light ${
                      isSelected 
                        ? 'bg-primary-subtle text-primary' 
                        : isHighlighted 
                        ? 'bg-light text-dark' 
                        : 'text-dark'
                    }`}
                    style={{ 
                      cursor: 'pointer',
                      transition: 'background-color 0.1s ease'
                    }}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    onClick={() => handleSelect(item)}
                  >
                    <div className="overflow-hidden py-0.5">
                      <div className={`small text-truncate ${isSelected ? 'text-primary fw-medium' : 'text-dark'}`} style={{ fontWeight: isSelected ? 600 : 400, fontSize: '0.85rem' }}>
                        {item.nama}
                      </div>
                      <div className="text-muted d-flex align-items-center gap-1 text-truncate" style={{ fontSize: '0.725rem', fontWeight: 400 }}>
                        <MapPin size={11} className="flex-shrink-0 text-muted" />
                        <span className="text-truncate">Kel. {item.kelurahan} • Pkm. {item.puskesmas}</span>
                      </div>
                    </div>

                    {isSelected && (
                      <Check size={15} className="text-primary flex-shrink-0 ms-2" />
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-4 px-3 text-muted">
                <Search size={24} className="mb-2 text-secondary opacity-50" />
                <div className="small fw-semibold">Tidak ditemukan Posyandu</div>
                <div className="small text-muted" style={{ fontSize: '0.75rem' }}>
                  Tidak ada posyandu/kelurahan yang cocok dengan kata kunci &quot;{searchTerm}&quot;
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
