import React from 'react';
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from '../modal';
import { Button } from '../button/Button';
import { AlertTriangle, Info } from 'lucide-react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'info' | 'warning';
  isLoading?: boolean;
}

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}: ConfirmDialogProps) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <AlertTriangle className="text-error" size={24} />,
          confirmButtonVariant: 'danger' as const,
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="text-warning" size={24} />,
          confirmButtonVariant: 'primary' as const, // Or a specific warning variant if available
        };
      case 'info':
      default:
        return {
          icon: <Info className="text-primary" size={24} />,
          confirmButtonVariant: 'primary' as const,
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" showCloseButton={false}>
      <ModalHeader>
        <div className="flex items-center gap-3">
          {styles.icon}
          <ModalTitle>{title}</ModalTitle>
        </div>
      </ModalHeader>
      <ModalContent>
        {description && <div className="text-neutral-600">{description}</div>}
      </ModalContent>
      <ModalFooter>
        <Button variant="ghost" onClick={onClose} disabled={isLoading}>
          {cancelText}
        </Button>
        <Button variant={styles.confirmButtonVariant} onClick={onConfirm} isLoading={isLoading}>
          {confirmText}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ConfirmDialog;
