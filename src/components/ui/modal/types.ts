export type ModalSize = 'sm' | 'md' | 'lg';

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    size?: ModalSize;
    className?: string;
    showCloseButton?: boolean;
}

export type ModalHeaderProps = React.HTMLAttributes<HTMLDivElement>;
export type ModalTitleProps = React.HTMLAttributes<HTMLHeadingElement>;
export type ModalContentProps = React.HTMLAttributes<HTMLDivElement>;
export type ModalFooterProps = React.HTMLAttributes<HTMLDivElement>;
