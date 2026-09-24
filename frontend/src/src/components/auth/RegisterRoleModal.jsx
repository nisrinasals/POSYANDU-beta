import React from 'react';
import { Modal } from 'react-bootstrap';
import { Users, Building2, ArrowRight, X } from 'lucide-react';

export default function RegisterRoleModal({ show, onHide, onSelectRole, onGoToLogin }) {
  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      centered 
      borderless 
      dialogClassName="modal-dialog-centered"
      contentClassName="border-0 shadow-lg"
    >
      <div 
        className="card border-0 p-4 position-relative" 
        style={{ borderRadius: '20px', backgroundColor: '#ffffff' }}
      >
        {/* Close Button */}
        <button 
          onClick={onHide}
          className="btn border-0 position-absolute top-0 end-0 m-3 text-secondary p-1" 
          style={{ cursor: 'pointer' }}
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Modal Title */}
        <h4 className="fw-bold mb-3.5 text-dark" style={{ letterSpacing: '-0.01em', fontSize: '1.3rem' }}>
          Registrasi
        </h4>

        {/* Selection Cards */}
        <div className="d-flex flex-column gap-2.5 mb-4">
          
          {/* Card 1: Kader Posyandu */}
          <div 
            className="p-3 border rounded-4 d-flex align-items-center gap-3 bg-white"
            onClick={() => onSelectRole('kader')}
            style={{ 
              cursor: 'pointer', 
              borderColor: '#e2e8f0', 
              transition: 'all 0.2s ease',
              borderRadius: '14px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
          >
            <div 
              className="d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ 
                width: '46px', 
                height: '46px', 
                borderRadius: '12px', 
                backgroundColor: '#f1f5f9', 
                color: '#334155' 
              }}
            >
              <Users size={22} />
            </div>
            <div>
              <div className="fw-bold text-dark" style={{ fontSize: '0.95rem' }}>
                Kader Posyandu
              </div>
              <div 
                className="small fw-semibold mt-0.5 d-flex align-items-center gap-1"
                style={{ color: '#e11d48', fontSize: '0.82rem' }}
              >
                <span>Daftar sebagai Kader</span>
                <ArrowRight size={13} />
              </div>
            </div>
          </div>

          {/* Card 2: Staf Puskesmas */}
          <div 
            className="p-3 border rounded-4 d-flex align-items-center gap-3 bg-white"
            onClick={() => onSelectRole('puskesmas')}
            style={{ 
              cursor: 'pointer', 
              borderColor: '#e2e8f0', 
              transition: 'all 0.2s ease',
              borderRadius: '14px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
          >
            <div 
              className="d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ 
                width: '46px', 
                height: '46px', 
                borderRadius: '12px', 
                backgroundColor: '#f1f5f9', 
                color: '#334155' 
              }}
            >
              <Building2 size={22} />
            </div>
            <div>
              <div className="fw-bold text-dark" style={{ fontSize: '0.95rem' }}>
                Staf Puskesmas
              </div>
              <div 
                className="small fw-semibold mt-0.5 d-flex align-items-center gap-1"
                style={{ color: '#e11d48', fontSize: '0.82rem' }}
              >
                <span>Daftar sebagai Staf Puskesmas</span>
                <ArrowRight size={13} />
              </div>
            </div>
          </div>

          {/* Card 3: Dinas Kesehatan */}
          <div 
            className="p-3 border rounded-4 d-flex align-items-center gap-3 bg-white"
            onClick={() => onSelectRole('dinkes')}
            style={{ 
              cursor: 'pointer', 
              borderColor: '#e2e8f0', 
              transition: 'all 0.2s ease',
              borderRadius: '14px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
          >
            <div 
              className="d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ 
                width: '46px', 
                height: '46px', 
                borderRadius: '12px', 
                backgroundColor: '#e0e7ff', 
                color: '#3730a3' 
              }}
            >
              <Building2 size={22} />
            </div>
            <div>
              <div className="fw-bold text-dark" style={{ fontSize: '0.95rem' }}>
                Dinas Kesehatan
              </div>
              <div 
                className="small fw-semibold mt-0.5 d-flex align-items-center gap-1"
                style={{ color: '#e11d48', fontSize: '0.82rem' }}
              >
                <span>Daftar sebagai Staf Dinas Kesehatan</span>
                <ArrowRight size={13} />
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="text-center pt-2">
          <button 
            type="button"
            className="btn btn-link p-0 text-decoration-none text-muted small"
            style={{ fontSize: '0.85rem' }}
            onClick={() => {
              onHide();
              if (onGoToLogin) onGoToLogin();
            }}
          >
            Sudah punya akun? <span className="fw-semibold" style={{ color: '#e11d48' }}>Masuk &rarr;</span>
          </button>
        </div>

      </div>
    </Modal>
  );
}
