import type { ModalTitleProps } from './types';

function ModalTitle({
    className = '',
    children,
    ...props
}: ModalTitleProps) {
    return (
        <h2 className={`text-xl font-bold text-neutral-900 ${className}`.trim()} {...props}>
            {children}
        </h2>
    );
}

export { ModalTitle };
