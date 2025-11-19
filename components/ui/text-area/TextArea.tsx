import React from "react";

interface TextAreaProps {
  placeholder?: string;
  value?: string;
  setValue?: React.Dispatch<React.SetStateAction<string>>;
  name?: string;
  id?: string;
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
  rows?: number;
}

function TextArea({
  placeholder,
  value,
  setValue,
  name,
  id,
  required = false,
  disabled = false,
  error = false,
  errorMessage,
  rows = 4,
}: TextAreaProps) {
  return (
    <div className="w-full">
      <textarea
        value={value ?? ""}
        placeholder={placeholder}
        name={name}
        id={id}
        required={required}
        disabled={disabled}
        rows={rows}
        className={`w-full px-4 py-3 text-base rounded-2xl transition-all duration-200 focus:outline-none focus:outline-offset-0 border ${
          error
            ? "border-red-500 dark:border-red-400 focus:border-2 focus:border-red-500 dark:focus:border-red-400"
            : "border-black dark:border-white focus:border-2 focus:border-black dark:focus:border-white"
        } disabled:opacity-50 disabled:cursor-not-allowed resize-none bg-transparent`}
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

export default TextArea;
