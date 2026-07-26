import type { ReactNode } from 'react';
import { Modal as WcModal } from '@zeturn/watercolor-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxWidth?: string;
}

export default function Modal({ open, onClose, title, children, maxWidth = 'md' }: ModalProps) {
  return (
    <WcModal
      open={open}
      onClose={onClose}
      title={title}
      size={(maxWidth as 'sm' | 'md' | 'lg' | 'xl') || 'md'}
      maskClosable
      showCloseButton
      lockScroll
    >
      {children}
    </WcModal>
  );
}
