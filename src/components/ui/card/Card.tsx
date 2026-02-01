import type { CardProps } from './types';
import { variantStyles } from './styles';

function Card({
    variant = 'default',
    className = '',
    children,
    ...props
}: CardProps) {
    return (
        <div
            className={`${variantStyles[variant]} ${className}`.trim()}
            {...props}
        >
            {children}
        </div>
    );
}

export { Card };
