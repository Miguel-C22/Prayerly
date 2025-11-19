import React from "react";

interface InputProps {
  type?: "text" | "email" | "password" | "number" | "tel" | "url";
  placeholder?: string;
  value?: string;
  setValue?: React.Dispatch<React.SetStateAction<string>>;
  name?: string;
  id?: string;
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
}

function Input({
  type = "text",
  placeholder,
  value,
  setValue,
  name,
  id,
  required = false,
  disabled = false,
  error = false,
  errorMessage,
}: InputProps) {
  return (
    <div className="w-full">
      <input
        type={type}
        value={value ?? ""}
        placeholder={placeholder}
        name={name}
        id={id}
        required={required}
        disabled={disabled}
        className={`input w-full h-12 px-4 text-base !rounded-full transition-all duration-200 focus:outline-none focus:outline-offset-0 border ${
          error
            ? "border-red-500 dark:border-red-400 focus:border-2 focus:border-red-500 dark:focus:border-red-400"
            : "border-black dark:border-white focus:border-2 focus:border-black dark:focus:border-white"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        onChange={(e) => setValue?.(e.target.value)}
        aria-invalid={error}
        aria-describedby={errorMessage && id ? `${id}-error` : undefined}
      />
      {error && errorMessage && (
        <p
          id={id ? `${id}-error` : undefined}
          className="mt-1 text-sm text-red-500 dark:text-red-400"
        >
          {errorMessage}
        </p>
      )}
    </div>
  );
}

export default Input;
