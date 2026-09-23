import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="flex items-start space-x-4">
        <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm text-slate-600 mb-6">{message}</p>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
              {cancelText}
            </Button>
            <Button variant="danger" size="sm" onClick={onConfirm} isLoading={isLoading}>
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
