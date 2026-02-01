import type { ModalHeaderProps } from './types';

function ModalHeader({
    className = '',
    children,
    ...props
}: ModalHeaderProps) {
    return (
        <div className={`p-6 pb-2 ${className}`.trim()} {...props}>
            {children}
        </div>
    );
}

export { ModalHeader };
