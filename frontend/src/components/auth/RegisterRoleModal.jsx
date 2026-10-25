import React from 'react';
import { Modal } from 'react-bootstrap';
import { Users, Building2, Stethoscope, ArrowRight, X } from 'lucide-react';

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
        style={{ 
          borderRadius: '24px', 
          backgroundColor: '#ffffff',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)' 
        }}
      >
        {/* Tombol Tutup */}
        <button 
          onClick={onHide}
          className="btn border-0 position-absolute top-0 end-0 m-3 text-secondary p-1" 
          style={{ cursor: 'pointer', borderRadius: '50%' }}
          aria-label="Tutup"
        >
          <X size={20} />
        </button>

        {/* Judul Modal */}
        <div className="mb-3">
          <h4 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-0.02em', fontSize: '1.35rem' }}>
            Registrasi Akun
          </h4>
          <p className="text-muted small mb-0" style={{ fontSize: '0.85rem' }}>
            Silakan pilih peran penugasan Anda dalam sistem layanan kesehatan:
          </p>
        </div>

        {/* Pilihan Peran */}
        <div className="d-flex flex-column gap-2.5 mb-4">
          
          {/* Card 1: Kader Posyandu */}
          <div 
            className="p-3 border rounded-4 d-flex align-items-center gap-3 bg-white"
            onClick={() => onSelectRole('kader')}
            style={{ 
              cursor: 'pointer', 
              borderColor: '#e2e8f0', 
              transition: 'all 0.2s ease',
              borderRadius: '16px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#475569';
              e.currentTarget.style.backgroundColor = '#f8fafc';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.backgroundColor = '#ffffff';
            }}
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
            <div className="flex-grow-1">
              <div className="fw-bold text-dark" style={{ fontSize: '0.98rem' }}>
                Kader Posyandu
              </div>
              <div 
                className="small fw-semibold mt-0.5 d-flex align-items-center gap-1"
                style={{ color: '#475569', fontSize: '0.82rem' }}
              >
                <span>Daftar sebagai Kader</span>
                <ArrowRight size={14} />
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
              borderRadius: '16px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#475569';
              e.currentTarget.style.backgroundColor = '#f8fafc';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.backgroundColor = '#ffffff';
            }}
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
              <Stethoscope size={22} />
            </div>
            <div className="flex-grow-1">
              <div className="fw-bold text-dark" style={{ fontSize: '0.98rem' }}>
                Staf Puskesmas
              </div>
              <div 
                className="small fw-semibold mt-0.5 d-flex align-items-center gap-1"
                style={{ color: '#475569', fontSize: '0.82rem' }}
              >
                <span>Daftar sebagai Staf Puskesmas</span>
                <ArrowRight size={14} />
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
              borderRadius: '16px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#475569';
              e.currentTarget.style.backgroundColor = '#f8fafc';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.backgroundColor = '#ffffff';
            }}
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
            <div className="flex-grow-1">
              <div className="fw-bold text-dark" style={{ fontSize: '0.98rem' }}>
                Dinas Kesehatan
              </div>
              <div 
                className="small fw-semibold mt-0.5 d-flex align-items-center gap-1"
                style={{ color: '#475569', fontSize: '0.82rem' }}
              >
                <span>Daftar sebagai Staf Dinas Kesehatan</span>
                <ArrowRight size={14} />
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="text-center pt-2 border-top">
          <button 
            type="button"
            className="btn btn-link p-0 text-decoration-none text-muted small mt-1"
            style={{ fontSize: '0.88rem' }}
            onClick={() => {
              onHide();
              if (onGoToLogin) onGoToLogin();
            }}
          >
            Sudah memiliki akun? <span className="fw-bold text-dark">Masuk ke Sistem &rarr;</span>
          </button>
        </div>

      </div>
    </Modal>
  );
}
