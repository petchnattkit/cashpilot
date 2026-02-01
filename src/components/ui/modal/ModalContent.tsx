import type { ModalContentProps } from './types';

function ModalContent({
    className = '',
    children,
    ...props
}: ModalContentProps) {
    return (
        <div className={`p-6 pt-2 ${className}`.trim()} {...props}>
            {children}
        </div>
    );
}

export { ModalContent };
