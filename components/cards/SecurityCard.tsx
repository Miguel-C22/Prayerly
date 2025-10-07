"use client";

import React, { useState } from "react";
import Icon from "../icon/Icon";

interface SecurityCardProps {
  onChangePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

function SecurityCard({ onChangePassword }: SecurityCardProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    try {
      await onChangePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card bg-backgrounds-white shadow-lg border border-border-gray rounded-3xl p-6 sm:p-8 w-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Icon icon="close" className="w-6 h-6 text-text-grayPrimary" />
        <h3 className="text-xl font-semibold text-text-grayPrimary">Security</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Current Password */}
        <fieldset className="fieldset">
          <legend className="fieldset-legend text-sm font-medium text-text-grayPrimary">
            Current Password
          </legend>
          <input
            type="password"
            placeholder="Enter current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full input h-12 border-border-gray text-text-grayPrimary placeholder:text-text-graySecondary focus:border-text-purplePrimary focus:outline-text-purplePrimary text-sm rounded-xl transition-all duration-200"
            required
          />
        </fieldset>

        {/* New Password */}
        <fieldset className="fieldset">
          <legend className="fieldset-legend text-sm font-medium text-text-grayPrimary">
            New Password
          </legend>
          <input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full input h-12 border-border-gray text-text-grayPrimary placeholder:text-text-graySecondary focus:border-text-purplePrimary focus:outline-text-purplePrimary text-sm rounded-xl transition-all duration-200"
            required
          />
        </fieldset>

        {/* Confirm New Password */}
        <fieldset className="fieldset">
          <legend className="fieldset-legend text-sm font-medium text-text-grayPrimary">
            Confirm New Password
          </legend>
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full input h-12 border-border-gray text-text-grayPrimary placeholder:text-text-graySecondary focus:border-text-purplePrimary focus:outline-text-purplePrimary text-sm rounded-xl transition-all duration-200"
            required
          />
        </fieldset>

        {/* Error Message */}
        {error && (
          <div className="alert alert-error bg-red-50 border-red-200 text-red-600">
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Change Password Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="btn bg-text-purplePrimary hover:bg-text-purplePrimary/90 text-white border-none font-semibold text-sm px-8 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
        >
          {isLoading ? "Changing..." : "Change Password"}
        </button>
      </form>
    </div>
  );
}

export default SecurityCard;