import type { CardContentProps } from './types';

function CardContent({
    className = '',
    children,
    ...props
}: CardContentProps) {
    return (
        <div
            className={`p-4 md:p-6 ${className}`.trim()}
            {...props}
        >
            {children}
        </div>
    );
}

export { CardContent };
