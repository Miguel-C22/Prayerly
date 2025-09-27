"use client";

import React, { useState } from "react";
import Icon from "../icon/Icon";

interface AccountInfoCardProps {
  currentName: string;
  currentEmail: string;
  onUpdateProfile: (name: string, email: string) => Promise<void>;
}

function AccountInfoCard({ currentName, currentEmail, onUpdateProfile }: AccountInfoCardProps) {
  const [name, setName] = useState(currentName);
  const [email, setEmail] = useState(currentEmail);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onUpdateProfile(name, email);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card bg-white shadow-lg border border-gray-100 rounded-3xl p-6 sm:p-8 w-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Icon icon="profile" className="w-6 h-6 text-text-grayPrimary" />
        <h3 className="text-xl font-semibold text-text-grayPrimary">Account Information</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Full Name */}
        <fieldset className="fieldset">
          <legend className="fieldset-legend text-sm font-medium text-text-grayPrimary">
            Full Name
          </legend>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full input h-12 border-gray-200 text-text-grayPrimary placeholder:text-text-graySecondary focus:border-text-purplePrimary focus:outline-text-purplePrimary text-sm rounded-xl transition-all duration-200"
            required
          />
        </fieldset>

        {/* Email Address */}
        <fieldset className="fieldset">
          <legend className="fieldset-legend text-sm font-medium text-text-grayPrimary">
            Email Address
          </legend>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full input h-12 border-gray-200 text-text-grayPrimary placeholder:text-text-graySecondary focus:border-text-purplePrimary focus:outline-text-purplePrimary text-sm rounded-xl transition-all duration-200"
            required
          />
        </fieldset>

        {/* Update Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="btn bg-text-purplePrimary hover:bg-text-purplePrimary/90 text-white border-none font-semibold text-sm px-8 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
        >
          {isLoading ? "Updating..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
}

export default AccountInfoCard;