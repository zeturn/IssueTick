import type { ComponentType, ReactNode } from 'react';
import { Select as WcSelectBase } from '@zeturn/watercolor-react';

const WcSelect = WcSelectBase as unknown as ComponentType<{
  label?: string;
  options?: { value: string | number; label?: ReactNode; disabled?: boolean }[];
  value?: string | number | readonly (string | number)[];
  placeholder?: ReactNode;
  error?: boolean;
  errorMessage?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
  onChange?: (e: { target: { name: string; value: string | number } }) => void;
  [key: string]: unknown;
}>;

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  value?: string;
  className?: string;
  id?: string;
  onChange?: (e: { target: { value: string } }) => void;
}

export default function Select({
  label,
  error,
  options,
  placeholder,
  value,
  className = '',
  onChange,
}: SelectProps) {
  return (
    <WcSelect
      label={label}
      options={options}
      value={value}
      placeholder={placeholder}
      error={!!error}
      errorMessage={error}
      size="md"
      fullWidth
      className={className}
      onChange={onChange as never}
    />
  );
}
