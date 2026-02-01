export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
    required?: boolean;
}

function Label({
    required,
    children,
    className = '',
    ...props
}: LabelProps) {
    return (
        <label
            className={`block text-sm font-medium text-neutral-700 mb-1 ${className}`.trim()}
            {...props}
        >
            {children}
            {required && <span className="text-error ml-0.5">*</span>}
        </label>
    );
}

export { Label };
