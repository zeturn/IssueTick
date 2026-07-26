import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Button as WcButton, type ButtonProps as WcButtonProps } from '@zeturn/watercolor-react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'warning';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
  children?: ReactNode;
}

// Map the app's variant vocabulary onto watercolor's variant + buttonStyle contract.
// watercolor renders a "filled" colored button only when buttonStyle="filled".
const styleMap: Record<ButtonVariant, { variant: WcButtonProps['variant']; buttonStyle: 'default' | 'outlined' | 'filled' }> = {
  primary: { variant: 'primary', buttonStyle: 'filled' },
  secondary: { variant: 'secondary', buttonStyle: 'outlined' },
  ghost: { variant: 'text', buttonStyle: 'default' },
  success: { variant: 'success', buttonStyle: 'filled' },
  warning: { variant: 'warning', buttonStyle: 'filled' },
  danger: { variant: 'error', buttonStyle: 'filled' },
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  fullWidth = false,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const mapped = styleMap[variant];
  return (
    <WcButton
      variant={mapped.variant}
      buttonStyle={mapped.buttonStyle}
      size={size}
      loading={loading}
      fullWidth={fullWidth}
      startIcon={icon}
      className={className}
      {...props}
    >
      {children}
    </WcButton>
  );
}
