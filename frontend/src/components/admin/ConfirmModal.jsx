import React from 'react';
import Modal from './Modal';

export default function ConfirmModal({ open, title, message, onConfirm, onCancel, confirmLabel = 'تایید', danger = true }) {
  return (
    <Modal open={open} title={title} onClose={onCancel} size="modal-sm">
      <div className="modal-body">
        <p className="mb-0 text-muted">{message}</p>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>انصراف</button>
        <button type="button" className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
