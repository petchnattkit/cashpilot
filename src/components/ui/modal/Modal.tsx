import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import type { ModalProps } from './types';
import { sizeClasses } from './styles';

function Modal({
    isOpen,
    onClose,
    children,
    size = 'md',
    className = '',
    showCloseButton = true,
}: ModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    // Close on ESC
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    // Focus trap
    useEffect(() => {
        if (isOpen && modalRef.current) {
            const focusableElements = modalRef.current.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );

            if (focusableElements.length > 0) {
                (focusableElements[0] as HTMLElement).focus();
            } else {
                modalRef.current.focus();
            }

            const handleTab = (e: KeyboardEvent) => {
                if (e.key === 'Tab') {
                    const firstElement = focusableElements[0] as HTMLElement;
                    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

                    if (e.shiftKey) {
                        if (document.activeElement === firstElement) {
                            e.preventDefault();
                            lastElement.focus();
                        }
                    } else {
                        if (document.activeElement === lastElement) {
                            e.preventDefault();
                            firstElement.focus();
                        }
                    }
                }
            };

            const currentRef = modalRef.current;
            currentRef.addEventListener('keydown', handleTab);

            return () => {
                currentRef.removeEventListener('keydown', handleTab);
            };
        }
    }, [isOpen]);

    // Lock body scroll
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
            role="presentation"
        >
            <div
                ref={modalRef}
                className={`bg-white rounded-lg shadow-xl w-full relative outline-none ${sizeClasses[size]} ${className}`}
                role="dialog"
                aria-modal="true"
                tabIndex={-1}
            >
                {showCloseButton && (
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 text-neutral-400 hover:text-neutral-600 transition-colors"
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>
                )}
                {children}
            </div>
        </div>,
        document.body
    );
}

export { Modal };
