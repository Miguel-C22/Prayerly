import React from "react";
import StatCard from "./StatCard";

interface ProfileCardProps {
  name: string;
  email: string;
  prayerRequests: number;
  journalEntries: number;
}

function ProfileCard({
  name,
  email,
  prayerRequests,
  journalEntries,
}: ProfileCardProps) {
  // Generate initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="card bg-white shadow-lg border border-gray-100 rounded-3xl p-6 sm:p-8 w-full max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="flex items-center gap-4 sm:gap-6 mb-8 sm:mb-12">
        {/* Avatar */}
        <div className="avatar avatar-placeholder">
          <div className="bg-neutral text-neutral-content w-16 rounded-full">
            <span className="text-xl">{getInitials(name)}</span>
          </div>
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-text-grayPrimary mb-1 sm:mb-2 truncate">
            {name}
          </h2>
          <p className="text-sm sm:text-base text-text-graySecondary truncate">
            {email}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <StatCard
          amount={prayerRequests}
          icon="heart"
          description="Prayer Requests"
        />
        <StatCard
          amount={journalEntries}
          icon="journal"
          description="Journal Entries"
        />
      </div>
    </div>
  );
}

export default ProfileCard;
