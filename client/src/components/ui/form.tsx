import { forwardRef, useId, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { CircleAlert, CircleCheck } from 'lucide-react';

const FIELD_BASE =
  'w-full rounded-xl border bg-white px-4 text-[0.95rem] text-ink-800 placeholder:text-ink-400/70 transition-colors duration-200 focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:bg-ink-400/5';

function fieldClasses(error?: boolean): string {
  return cn(
    FIELD_BASE,
    error
      ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10'
      : 'border-ink-800/12 focus:border-navy-700 focus:ring-navy-700/10',
  );
}

export function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={htmlFor} className="text-sm font-semibold text-ink-800">
        {label}
        {required ? (
          <span className="ml-1 text-clay-500" aria-hidden>
            *
          </span>
        ) : (
          <span className="ml-1 text-ink-400/70 text-xs font-normal">(optionnel)</span>
        )}
      </label>
      {children}
      {hint && !error ? <p className="text-xs text-ink-500">{hint}</p> : null}
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="flex items-center gap-1.5 text-xs font-medium text-red-600">
          <CircleAlert className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      ) : null}
    </div>
  );
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, icon, className, id, required, ...rest },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const input = (
    <div className="relative">
      {icon ? (
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" aria-hidden>
          {icon}
        </span>
      ) : null}
      <input
        ref={ref}
        id={inputId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={cn(
          fieldClasses(Boolean(error)),
          'h-12',
          icon && 'pl-11',
          className,
        )}
        {...rest}
      />
    </div>
  );

  if (!label) return input;
  return (
    <Field label={label} htmlFor={inputId} error={error} hint={hint} required={required}>
      {input}
    </Field>
  );
});

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, hint, className, id, required, rows = 5, ...rest },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const textarea = (
    <textarea
      ref={ref}
      id={inputId}
      rows={rows}
      required={required}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `${inputId}-error` : undefined}
      className={cn(fieldClasses(Boolean(error)), 'resize-y py-3 leading-relaxed', className)}
      {...rest}
    />
  );

  if (!label) return textarea;
  return (
    <Field label={label} htmlFor={inputId} error={error} hint={hint} required={required}>
      {textarea}
    </Field>
  );
});

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  placeholder?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, hint, className, id, required, options, placeholder, ...rest },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const select = (
    <div className="relative">
      <select
        ref={ref}
        id={inputId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={cn(
          fieldClasses(Boolean(error)),
          'h-12 appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236b7280\' stroke-width=\'2\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")] bg-[length:18px] bg-[right_1rem_center] bg-no-repeat pr-11',
          className,
        )}
        {...rest}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );

  if (!label) return select;
  return (
    <Field label={label} htmlFor={inputId} error={error} hint={hint} required={required}>
      {select}
    </Field>
  );
});

export function Checkbox({
  label,
  id,
  error,
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { label: ReactNode; id: string; error?: string }) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex items-start gap-3">
        <input
          id={id}
          type="checkbox"
          className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border-ink-800/20 text-clay-500 accent-clay-500 focus:ring-2 focus:ring-clay-500/30"
          {...rest}
        />
        <label htmlFor={id} className="cursor-pointer text-sm leading-relaxed text-ink-700">
          {label}
        </label>
      </div>
      {error ? (
        <p role="alert" className="flex items-center gap-1.5 text-xs font-medium text-red-600">
          <CircleAlert className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function FormStatus({
  type,
  message,
}: {
  type: 'success' | 'error' | 'info';
  message: string;
}) {
  if (type === 'success') {
    return (
      <div
        role="status"
        className="flex items-start gap-3 rounded-xl border border-olive-600/20 bg-olive-50 p-4 text-sm text-olive-800"
      >
        <CircleCheck className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
        <p className="leading-relaxed">{message}</p>
      </div>
    );
  }
  if (type === 'error') {
    return (
      <div
        role="alert"
        className="flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800"
      >
        <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
        <p className="leading-relaxed">{message}</p>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-3 rounded-xl border border-sky-300 bg-sky-50 p-4 text-sm text-sky-900">
      <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
      <p className="leading-relaxed">{message}</p>
    </div>
  );
}
