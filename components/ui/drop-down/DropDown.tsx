import React from "react";

interface DropDownProps {
  value?: string;
  onChange?: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  name?: string;
  id?: string;
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
}

function DropDown({
  value,
  onChange,
  options,
  placeholder = "Select an option",
  name,
  id,
  required = false,
  disabled = false,
  error = false,
  errorMessage,
}: DropDownProps) {
  return (
    <div className="w-full">
      <select
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        name={name}
        id={id}
        required={required}
        disabled={disabled}
        className={`w-full h-12 px-4 pr-10 text-base rounded-full transition-all duration-200 focus:outline-none focus:outline-offset-0 border text-text-grayPrimary bg-backgrounds-grayLight ${
          error
            ? "border-red-500 focus:border-2 focus:border-red-500"
            : "border-border-gray focus:border-2 focus:border-text-purplePrimary"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666666' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 1rem center',
          backgroundSize: '12px',
        }}
        aria-invalid={error}
        aria-describedby={errorMessage && id ? `${id}-error` : undefined}
      >
        <option value="" disabled className="text-text-graySecondary">
          {placeholder}
        </option>
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-backgrounds-grayLight text-text-grayPrimary"
          >
            {option.label}
          </option>
        ))}
      </select>
      {error && errorMessage && (
        <p
          id={id ? `${id}-error` : undefined}
          className="mt-1 text-sm text-red-500"
        >
          {errorMessage}
        </p>
      )}
    </div>
  );
}

export default DropDown;
