import React, { createContext, useContext, useState, useCallback } from 'react';
import CustomPopupModal from '../components/common/CustomPopupModal';
import ToastContainer from '../components/common/ToastContainer';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  // Modal / Popup state
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'info', // 'success' | 'warning' | 'error' | 'info' | 'confirm'
    title: '',
    message: '',
    confirmText: 'OK',
    cancelText: 'Batal',
    isConfirm: false,
    roleTheme: 'default',
    onConfirm: null,
    onCancel: null,
  });

  // Toast stack state
  const [toasts, setToasts] = useState([]);

  // Close Popup
  const closeModal = useCallback(() => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Show generic custom alert / modal
  const showModal = useCallback(({
    type = 'info',
    title = '',
    message = '',
    confirmText = 'OK',
    cancelText = 'Batal',
    isConfirm = false,
    roleTheme = 'default',
    onConfirm = null,
    onCancel = null
  }) => {
    setModalState({
      isOpen: true,
      type,
      title,
      message,
      confirmText,
      cancelText,
      isConfirm,
      roleTheme,
      onConfirm: () => {
        closeModal();
        if (onConfirm) onConfirm();
      },
      onCancel: () => {
        closeModal();
        if (onCancel) onCancel();
      }
    });
  }, [closeModal]);

  // Convenience methods
  const showSuccess = useCallback((titleOrMessage, messageOptional, options = {}) => {
    const title = messageOptional !== undefined ? titleOrMessage : 'Berhasil';
    const message = messageOptional !== undefined ? messageOptional : titleOrMessage;
    showModal({
      type: 'success',
      title,
      message,
      confirmText: options.confirmText || 'Selesai',
      ...options
    });
  }, [showModal]);

  const showWarning = useCallback((titleOrMessage, messageOptional, options = {}) => {
    const title = messageOptional !== undefined ? titleOrMessage : 'Perhatian';
    const message = messageOptional !== undefined ? messageOptional : titleOrMessage;
    showModal({
      type: 'warning',
      title,
      message,
      confirmText: options.confirmText || 'Mengerti',
      ...options
    });
  }, [showModal]);

  const showError = useCallback((titleOrMessage, messageOptional, options = {}) => {
    const title = messageOptional !== undefined ? titleOrMessage : 'Terjadi Kesalahan';
    const message = messageOptional !== undefined ? messageOptional : titleOrMessage;
    showModal({
      type: 'error',
      title,
      message,
      confirmText: options.confirmText || 'Tutup',
      ...options
    });
  }, [showModal]);

  const showInfo = useCallback((titleOrMessage, messageOptional, options = {}) => {
    const title = messageOptional !== undefined ? titleOrMessage : 'Informasi';
    const message = messageOptional !== undefined ? messageOptional : titleOrMessage;
    showModal({
      type: 'info',
      title,
      message,
      confirmText: options.confirmText || 'Tutup',
      ...options
    });
  }, [showModal]);

  // Confirm dialog (returns Promise or accepts callbacks)
  const showConfirm = useCallback(({
    title = 'Konfirmasi Tindakan',
    message = 'Apakah Anda yakin ingin melanjutkan?',
    type = 'warning', // 'warning' | 'danger' | 'primary' | 'success'
    confirmText = 'Ya, Lanjutkan',
    cancelText = 'Batal',
    roleTheme = 'default',
    onConfirm,
    onCancel
  }) => {
    return new Promise((resolve) => {
      showModal({
        type,
        title,
        message,
        confirmText,
        cancelText,
        isConfirm: true,
        roleTheme,
        onConfirm: () => {
          if (onConfirm) onConfirm();
          resolve(true);
        },
        onCancel: () => {
          if (onCancel) onCancel();
          resolve(false);
        }
      });
    });
  }, [showModal]);

  // Toast notifications
  const showToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 4);
    const newToast = { id, message, type };
    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        showModal,
        showSuccess,
        showWarning,
        showError,
        showInfo,
        showConfirm,
        showToast,
        closeModal
      }}
    >
      {children}
      <CustomPopupModal modalState={modalState} onClose={closeModal} />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
