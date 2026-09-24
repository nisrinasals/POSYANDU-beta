import React, { useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  HelpCircle, 
  X 
} from 'lucide-react';

export default function CustomPopupModal({ modalState, onClose }) {
  const { 
    isOpen, 
    type = 'info', 
    title = '', 
    message = '', 
    confirmText = 'OK', 
    cancelText = 'Batal', 
    isConfirm = false,
    onConfirm, 
    onCancel 
  } = modalState;

  // Handle ESC key to dismiss
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        if (isConfirm && onCancel) {
          onCancel();
        } else {
          onClose();
        }
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isConfirm, onCancel, onClose]);

  if (!isOpen) return null;

  // Clean Theme Configuration
  const getModalConfig = () => {
    const primaryThemeColor = modalState.themeColor || 
      (typeof document !== 'undefined' && document.querySelector('.role-dinkes') ? '#1e3a8a' : 
       typeof document !== 'undefined' && document.querySelector('.role-puskesmas') ? '#428A75' : '#2b2e4a');
    const primaryThemeHover = 
      (primaryThemeColor === '#1e3a8a' ? '#172554' : 
       primaryThemeColor === '#428A75' ? '#2E4E52' : '#1e2137');
    const primaryThemeSubtle = 
      (primaryThemeColor === '#1e3a8a' ? '#eff6ff' : 
       primaryThemeColor === '#428A75' ? 'rgba(66, 138, 117, 0.1)' : '#fdf2f8');

    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle2 size={32} style={{ color: '#059669' }} strokeWidth={2.2} />,
          bgBadge: '#ecfdf5',
          borderBadge: '#a7f3d0',
          btnBg: primaryThemeColor !== '#2b2e4a' ? primaryThemeColor : '#059669',
          btnHover: primaryThemeColor !== '#2b2e4a' ? primaryThemeHover : '#047857'
        };
      case 'warning':
        return {
          icon: <AlertTriangle size={32} style={{ color: '#d97706' }} strokeWidth={2.2} />,
          bgBadge: '#fffbeb',
          borderBadge: '#fde68a',
          btnBg: primaryThemeColor !== '#2b2e4a' ? primaryThemeColor : '#d97706',
          btnHover: primaryThemeColor !== '#2b2e4a' ? primaryThemeHover : '#b45309'
        };
      case 'danger':
      case 'error':
        return {
          icon: <AlertCircle size={32} style={{ color: '#dc2626' }} strokeWidth={2.2} />,
          bgBadge: '#fef2f2',
          borderBadge: '#fecaca',
          btnBg: '#dc2626',
          btnHover: '#b91c1c'
        };
      case 'confirm':
      case 'primary':
      default:
        return {
          icon: isConfirm ? (
            <HelpCircle size={32} style={{ color: primaryThemeColor }} strokeWidth={2.2} />
          ) : (
            <CheckCircle2 size={32} style={{ color: primaryThemeColor }} strokeWidth={2.2} />
          ),
          bgBadge: primaryThemeSubtle,
          borderBadge: primaryThemeColor,
          btnBg: primaryThemeColor,
          btnHover: primaryThemeHover
        };
    }
  };

  const config = getModalConfig();

  return (
    <div 
      className="custom-modal-backdrop d-flex align-items-center justify-content-center p-3"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          if (isConfirm && onCancel) onCancel();
          else onClose();
        }
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(4px)',
        animation: 'customFadeIn 0.15s ease-out'
      }}
    >
      <div 
        className="custom-popup-card bg-white rounded-4 shadow-lg position-relative"
        style={{
          maxWidth: '400px',
          width: '100%',
          border: '1px solid #e2e8f0',
          animation: 'customPopScale 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: '0 20px 30px -10px rgba(0, 0, 0, 0.15)'
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            if (isConfirm && onCancel) onCancel();
            else onClose();
          }}
          className="btn btn-sm position-absolute top-0 end-0 m-3 p-1 text-muted border-0 shadow-none rounded-circle"
          style={{ width: '28px', height: '28px' }}
          aria-label="Tutup"
        >
          <X size={16} />
        </button>

        <div className="p-4 text-center">
          {/* Icon Badge */}
          <div className="d-flex justify-content-center mb-3">
            <div 
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{
                width: '60px',
                height: '60px',
                backgroundColor: config.bgBadge,
                border: `1.5px solid ${config.borderBadge}`
              }}
            >
              {config.icon}
            </div>
          </div>

          {/* Title */}
          <h5 className="fw-bold text-dark mb-2" style={{ fontSize: '1.1rem' }}>
            {title}
          </h5>

          {/* Message Content - Clean & Short */}
          <p className="text-secondary small mb-4 px-2" style={{ fontSize: '0.88rem', lineHeight: '1.5', whiteSpace: 'pre-line' }}>
            {message}
          </p>

          {/* Action Buttons */}
          <div className="d-flex align-items-center justify-content-center gap-2">
            {isConfirm && (
              <button
                type="button"
                className="btn btn-light px-3 py-2 rounded-3 fw-semibold small flex-fill border text-secondary"
                onClick={() => {
                  if (onCancel) onCancel();
                  else onClose();
                }}
                style={{ fontSize: '0.875rem' }}
              >
                {cancelText}
              </button>
            )}

            <button
              type="button"
              className="btn text-white px-3 py-2 rounded-3 fw-bold small flex-fill shadow-none"
              onClick={() => {
                if (onConfirm) onConfirm();
                else onClose();
              }}
              style={{
                backgroundColor: config.btnBg,
                borderColor: config.btnBg,
                fontSize: '0.875rem',
                minWidth: isConfirm ? '110px' : '140px'
              }}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
