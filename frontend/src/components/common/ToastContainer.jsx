import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export default function ToastContainer({ toasts, onRemove }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div 
      className="position-fixed top-0 end-0 p-3"
      style={{ zIndex: 10000, maxWidth: '420px', width: '100%', pointerEvents: 'none' }}
    >
      <div className="d-flex flex-column gap-2">
        {toasts.map((toast) => {
          let icon = <CheckCircle2 size={20} className="text-success flex-shrink-0" />;
          let bgClass = 'bg-white border-success-subtle';
          let borderLeftColor = '#10b981';

          if (toast.type === 'warning') {
            icon = <AlertTriangle size={20} className="text-warning flex-shrink-0" />;
            bgClass = 'bg-white border-warning-subtle';
            borderLeftColor = '#f59e0b';
          } else if (toast.type === 'error' || toast.type === 'danger') {
            icon = <AlertCircle size={20} className="text-danger flex-shrink-0" />;
            bgClass = 'bg-white border-danger-subtle';
            borderLeftColor = '#ef4444';
          } else if (toast.type === 'info') {
            icon = <Info size={20} className="text-primary flex-shrink-0" />;
            bgClass = 'bg-white border-primary-subtle';
            borderLeftColor = '#F25B8E';
          }

          return (
            <div
              key={toast.id}
              className={`card shadow-lg border rounded-3 p-3 position-relative ${bgClass}`}
              style={{
                pointerEvents: 'auto',
                borderLeft: `4px solid ${borderLeftColor}`,
                animation: 'customToastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.15), 0 8px 10px -6px rgba(15, 23, 42, 0.1)'
              }}
            >
              <div className="d-flex align-items-start gap-2.5">
                <div className="pt-0.5">{icon}</div>
                <div className="flex-fill">
                  <div className="small text-dark fw-medium" style={{ fontSize: '0.875rem', lineHeight: '1.45' }}>
                    {toast.message}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-link p-0 text-muted ms-1 border-0 shadow-none"
                  onClick={() => onRemove(toast.id)}
                  style={{ textDecoration: 'none' }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
