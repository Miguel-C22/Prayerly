"use client";

import ProfileCard from "@/components/cards/ProfileCard";
import AccountInfoCard from "@/components/cards/AccountInfoCard";
import SecurityCard from "@/components/cards/SecurityCard";
import DataPrivacyCard from "@/components/cards/DataPrivacyCard";
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

  const handleUpdateProfile = async (name: string, email: string) => {
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      email: email,
      data: { full_name: name },
    });
    if (error) throw error;
    router.refresh();
  };

  const handleChangePassword = async (
    currentPassword: string,
    newPassword: string
  ) => {
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
  };

  const handleExportJournal = async () => {
    // Implement PDF export functionality
  };

  const handleDownloadData = async () => {
    // Implement data download functionality
  };

  const handleDeleteAccount = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.admin.deleteUser(
      (await supabase.auth.getUser()).data.user?.id || ""
    );
    if (error) throw error;
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
      <AccountInfoCard
        currentName={userName}
        currentEmail={email}
        onUpdateProfile={handleUpdateProfile}
      />

      {/* Security */}
      <SecurityCard onChangePassword={handleChangePassword} />

      {/* Data & Privacy */}
      <DataPrivacyCard
        onExportJournal={handleExportJournal}
        onDownloadData={handleDownloadData}
        onDeleteAccount={handleDeleteAccount}
        onSignOut={handleSignOut}
      />
    </div>
  );
}

export default ProfilePageClient;
