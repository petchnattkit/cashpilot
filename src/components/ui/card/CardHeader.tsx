import type { CardHeaderProps } from './types';

function CardHeader({
    className = '',
    children,
    ...props
}: CardHeaderProps) {
    return (
        <div
            className={`p-4 md:p-6 border-b border-neutral-100 ${className}`.trim()}
            {...props}
        >
            {children}
        </div>
    );
}

export { CardHeader };
