import type { ModalFooterProps } from './types';

function ModalFooter({
    className = '',
    children,
    ...props
}: ModalFooterProps) {
    return (
        <div className={`p-6 pt-0 flex justify-end gap-3 ${className}`.trim()} {...props}>
            {children}
        </div>
    );
}

export { ModalFooter };
