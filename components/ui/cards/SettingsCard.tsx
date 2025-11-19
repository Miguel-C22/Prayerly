"use client";

import React, { useState } from "react";
import Icon from "@/components/ui/icon/Icon";
import Input from "@/components/ui/input/Input";
import Button from "@/components/ui/button/Button";
import { cardStyles } from "./cardStyles";
import { icons } from "@/consts/icons";

// Form field definition
interface FormField {
  name: string;
  type: "text" | "email" | "password";
  placeholder: string;
  value: string;
  required?: boolean;
}

// Action button definition
interface ActionButton {
  label: string;
  onClick: () => Promise<void>;
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline";
  icon?: React.ReactNode;
}

interface SettingsCardProps {
  variant: "form" | "actions";
  title: string;
  icon: keyof typeof icons;
  description?: string;

  // Form variant props
  fields?: FormField[];
  onSubmit?: (formData: Record<string, string>) => Promise<void>;
  submitButtonText?: string;
  errorMessage?: string;

  // Actions variant props
  actions?: ActionButton[];
}

function SettingsCard({
  variant,
  title,
  icon,
  description,
  fields = [],
  onSubmit,
  submitButtonText = "Submit",
  errorMessage,
  actions = [],
}: SettingsCardProps) {
  const [formValues, setFormValues] = useState<Record<string, string>>(
    fields.reduce((acc, field) => ({ ...acc, [field.name]: field.value }), {})
  );
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStates, setLoadingStates] = useState<Record<number, boolean>>({});

  // Handle form field change
  const handleFieldChange = (fieldName: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [fieldName]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSubmit) return;

    setIsLoading(true);
    try {
      await onSubmit(formValues);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle action button click
  const handleActionClick = async (index: number, onClick: () => Promise<void>) => {
    setLoadingStates((prev) => ({ ...prev, [index]: true }));
    try {
      await onClick();
    } finally {
      setLoadingStates((prev) => ({ ...prev, [index]: false }));
    }
  };

  // Render form variant
  if (variant === "form") {
    return (
      <div className={`${cardStyles.settings} p-6 sm:p-8 w-full`}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Icon icon={icon} className="w-6 h-6 text-text-grayPrimary" />
          <h3 className="text-xl font-semibold text-text-grayPrimary">{title}</h3>
        </div>

        {description && (
          <p className="text-text-graySecondary mb-6">{description}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form fields */}
          {fields.map((field) => (
            <Input
              key={field.name}
              type={field.type}
              placeholder={field.placeholder}
              value={formValues[field.name] || ""}
              setValue={(value) => {
                const newValue = typeof value === "function" ? value(formValues[field.name] || "") : value;
                handleFieldChange(field.name, newValue);
              }}
              required={field.required}
            />
          ))}

          {/* Error Message */}
          {errorMessage && (
            <div className="alert alert-error bg-red-50 border-red-200 text-red-600">
              <span className="text-sm">{errorMessage}</span>
            </div>
          )}

          {/* Submit Button */}
          <Button type="submit" variant="primary" loading={isLoading}>
            {submitButtonText}
          </Button>
        </form>
      </div>
    );
  }

  // Render actions variant
  return (
    <div className={`${cardStyles.settings} p-6 sm:p-8 w-full`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Icon icon={icon} className="w-6 h-6 text-text-grayPrimary" />
        <h3 className="text-xl font-semibold text-text-grayPrimary">{title}</h3>
      </div>

      {description && (
        <p className="text-text-graySecondary mb-6">{description}</p>
      )}

      {/* Action buttons */}
      <div className="space-y-4">
        {actions.map((action, index) => (
          <Button
            key={index}
            onClick={() => handleActionClick(index, action.onClick)}
            variant={action.variant || "outline"}
            size="lg"
            loading={loadingStates[index]}
            fullWidth
            icon={action.icon}
          >
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

export default SettingsCard;
