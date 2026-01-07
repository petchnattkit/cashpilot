export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'glass';
}

export type CardHeaderProps = React.HTMLAttributes<HTMLDivElement>;
export type CardTitleProps = React.HTMLAttributes<HTMLHeadingElement>;
export type CardContentProps = React.HTMLAttributes<HTMLDivElement>;
export type CardFooterProps = React.HTMLAttributes<HTMLDivElement>;

const variantStyles: Record<string, string> = {
    default: 'bg-white rounded-lg shadow-soft border border-neutral-200',
    glass: 'bg-white/80 backdrop-blur-lg rounded-lg shadow-glass border border-white/20',
};

export const Card = ({
    variant = 'default',
    className = '',
    children,
    ...props
}: CardProps) => {
    return (
        <div
            className={`${variantStyles[variant]} ${className}`.trim()}
            {...props}
        >
            {children}
        </div>
    );
};

export const CardHeader = ({
    className = '',
    children,
    ...props
}: CardHeaderProps) => {
    return (
        <div
            className={`p-4 md:p-6 border-b border-neutral-100 ${className}`.trim()}
            {...props}
        >
            {children}
        </div>
    );
};

export const CardTitle = ({
    className = '',
    children,
    ...props
}: CardTitleProps) => {
    return (
        <h3
            className={`text-lg font-bold text-neutral-900 ${className}`.trim()}
            {...props}
        >
            {children}
        </h3>
    );
};

export const CardContent = ({
    className = '',
    children,
    ...props
}: CardContentProps) => {
    return (
        <div
            className={`p-4 md:p-6 ${className}`.trim()}
            {...props}
        >
            {children}
        </div>
    );
};

export const CardFooter = ({
    className = '',
    children,
    ...props
}: CardFooterProps) => {
    return (
        <div
            className={`p-4 md:p-6 border-t border-neutral-100 bg-neutral-50 ${className}`.trim()}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
