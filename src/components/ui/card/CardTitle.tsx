import type { CardTitleProps } from './types';

function CardTitle({
    className = '',
    children,
    ...props
}: CardTitleProps) {
    return (
        <h3
            className={`text-lg font-bold text-neutral-900 ${className}`.trim()}
            {...props}
        >
            {children}
        </h3>
    );
}

export { CardTitle };
