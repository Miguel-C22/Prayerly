"use client";

import ProfileCard from "@/components/ui/cards/ProfileCard";
import SettingsCard from "@/components/ui/cards/SettingsCard";
import Icon from "@/components/ui/icon/Icon";
import { Prayer } from "@/types/prayer";
import React from "react";
import { ReflectionEntry } from "../journal/JournalPageClient";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface ProfilePageClientProps {
  userName: string;
  email: string;
  prayers: Prayer[];
  reflections: ReflectionEntry[];
}

function ProfilePageClient({
  userName,
  email,
  prayers,
  reflections,
}: ProfilePageClientProps) {
  const router = useRouter();
  const [securityError, setSecurityError] = React.useState("");

  const handleUpdateProfile = async (name: string, email: string) => {
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      email: email,
      data: { full_name: name },
    });
    if (error) throw error;
    router.refresh();
  };

  const handleChangePassword = async (formData: Record<string, string>) => {
    setSecurityError("");

    const { newPassword, confirmPassword } = formData;

    if (newPassword !== confirmPassword) {
      setSecurityError("New passwords do not match");
      throw new Error("New passwords do not match");
    }

    if (newPassword.length < 6) {
      setSecurityError("New password must be at least 6 characters");
      throw new Error("New password must be at least 6 characters");
    }

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) {
      setSecurityError(error.message);
      throw error;
    }
  };

  const handleExportJournal = async () => {
    // Implement PDF export functionality
  };

  const handleDownloadData = async () => {
    // Implement data download functionality
  };

  const handleDeleteAccount = async () => {
    // Call server-side API to delete account
    const response = await fetch("/api/user/delete-account", {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to delete account");
    }

    // Redirect to home page
    router.push("/");
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Profile Overview */}
      <ProfileCard
        name={userName}
        email={email}
        prayerRequests={prayers.length}
        journalEntries={reflections.length}
      />

      {/* Account Information */}
      <SettingsCard
        variant="form"
        title="Account Information"
        icon="profile"
        fields={[
          { name: "name", type: "text", placeholder: "Full Name", value: userName, required: true },
          { name: "email", type: "email", placeholder: "Email Address", value: email, required: true }
        ]}
        onSubmit={async (formData) => await handleUpdateProfile(formData.name, formData.email)}
        submitButtonText="Update Profile"
      />

      {/* Security */}
      <SettingsCard
        variant="form"
        title="Security"
        icon="close"
        fields={[
          { name: "currentPassword", type: "password", placeholder: "Enter current password", value: "", required: true },
          { name: "newPassword", type: "password", placeholder: "Enter new password", value: "", required: true },
          { name: "confirmPassword", type: "password", placeholder: "Confirm new password", value: "", required: true }
        ]}
        onSubmit={handleChangePassword}
        submitButtonText="Change Password"
        errorMessage={securityError}
      />

      {/* Data & Privacy */}
      <SettingsCard
        variant="actions"
        title="Data & Privacy"
        icon="backArrow"
        actions={[
          { label: "Export Prayer Journal (PDF)", onClick: handleExportJournal, variant: "outline" },
          { label: "Download All Data", onClick: handleDownloadData, variant: "outline" },
          { label: "Delete Account", onClick: async () => {
              if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
                await handleDeleteAccount();
              }
            }, variant: "danger" }
        ]}
      />

      {/* Sign Out */}
      <SettingsCard
        variant="actions"
        title="Sign Out"
        icon="backArrow"
        actions={[
          { label: "Sign Out", onClick: handleSignOut, variant: "outline", icon: <Icon icon="backArrow" className="w-5 h-5" /> }
        ]}
      />
    </div>
  );
}

export default ProfilePageClient;
