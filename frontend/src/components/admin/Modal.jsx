import React, { useEffect } from 'react';

export default function Modal({ open, title, onClose, children, size = '' }) {
  useEffect(() => {
    document.body.classList.toggle('admin-modal-open', open);
    return () => document.body.classList.remove('admin-modal-open');
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div className="modal-backdrop show"></div>
      <div className="modal show d-block" tabIndex="-1" onClick={onClose}>
        <div className={`modal-dialog modal-dialog-centered ${size}`} onClick={e => e.stopPropagation()}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title fw-bold">{title}</h5>
              <button type="button" className="btn-close" onClick={onClose} aria-label="بستن"></button>
            </div>
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
