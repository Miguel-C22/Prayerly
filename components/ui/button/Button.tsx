import React from "react";

interface ButtonProps {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  type?: "button" | "submit" | "reset";
  children: React.ReactNode;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

function Button({
  variant = "primary",
  size = "md",
  type = "button",
  children,
  onClick,
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = "left",
}: ButtonProps) {
  const baseStyles =
    "font-semibold !rounded-full transition-all duration-200 focus:outline-none focus:outline-offset-0 inline-flex items-center justify-center gap-2 border-2 no-underline";

  const variantStyles = {
    primary:
      "bg-text-purplePrimary hover:bg-text-purplePrimary/90 text-white border-text-purplePrimary shadow-lg hover:shadow-xl",
    secondary:
      "bg-transparent hover:bg-backgrounds-grayLight text-text-grayPrimary border-border-gray",
    danger:
      "bg-red-500 hover:bg-red-600 text-white border-red-500 shadow-lg hover:shadow-xl",
    ghost:
      "bg-transparent hover:bg-backgrounds-grayLight text-text-grayPrimary border-transparent",
    outline:
      "bg-transparent hover:bg-backgrounds-grayLight text-text-grayPrimary border-black dark:border-white",
  };

  const sizeStyles = {
    sm: "h-10 px-4 text-sm",
    md: "h-12 px-6 text-base",
    lg: "h-14 px-8 text-lg",
  };

  const disabledStyles =
    disabled || loading ? "opacity-50 cursor-not-allowed" : "";

  const widthStyles = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledStyles} ${widthStyles}`}
    >
      {loading && <span className="loading loading-spinner loading-sm"></span>}
      {icon && iconPosition === "left" && icon}
      {children}
      {icon && iconPosition === "right" && icon}
    </button>
  );
}

export default Button;
