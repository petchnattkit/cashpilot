---
description: React component coding standards for CashPilot project
---

# React Component Standards

## Function Component Syntax

**Use simple function components** for all UI components unless there's a specific need for `forwardRef`.

### ✅ Standard Pattern (Default)

```tsx
export const Button = ({
  variant = 'primary',
  children,
  className = '',
  ...props
}: ButtonProps) => {
  return (
    <button className={`${baseStyles} ${className}`} {...props}>
      {children}
    </button>
  );
};
```

### 🔧 When to Use `forwardRef`

Only use `forwardRef` when:
1. The component needs to expose its DOM element to parent components
2. Third-party libraries require ref access (e.g., animation libraries, focus management)
3. Explicit requirement in the issue/task specifies ref forwarding

```tsx
// Only when ref access is explicitly required
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return <input ref={ref} className={className} {...props} />;
  }
);
Input.displayName = 'Input';
```

## Component Props Pattern

1. **Extend native HTML attributes** for flexibility:
   ```tsx
   interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
     variant?: 'primary' | 'secondary';
   }
   ```

2. **Support `className` prop** for style overrides
3. **Spread remaining props** (`...props`) to the root element
4. **Provide sensible defaults** for optional props

## File Structure

```
src/components/ui/
├── Button.tsx           # Component implementation
├── Button.test.tsx      # Unit tests (target >60% coverage)
└── index.ts             # Exports
```

## Naming Conventions

- **PascalCase** for component names: `Button`, `Card`, `DataTable`
- **camelCase** for props and variables
- Export both named export and default export for flexibility
