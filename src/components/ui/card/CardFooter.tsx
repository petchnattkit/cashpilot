import type { CardFooterProps } from './types';

function CardFooter({
    className = '',
    children,
    ...props
}: CardFooterProps) {
    return (
        <div
            className={`p-4 md:p-6 border-t border-neutral-100 ${className}`.trim()}
            {...props}
        >
            {children}
        </div>
    );
}

export { CardFooter };
