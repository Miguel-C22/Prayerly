"use client";

import React, { useState } from "react";
import Icon from "../icon/Icon";

interface DataPrivacyCardProps {
  onExportJournal: () => Promise<void>;
  onDownloadData: () => Promise<void>;
  onDeleteAccount: () => Promise<void>;
  onSignOut: () => Promise<void>;
}

function DataPrivacyCard({
  onExportJournal,
  onDownloadData,
  onDeleteAccount,
  onSignOut
}: DataPrivacyCardProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleExportJournal = async () => {
    setIsExporting(true);
    try {
      await onExportJournal();
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadData = async () => {
    setIsDownloading(true);
    try {
      await onDownloadData();
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      setIsDeleting(true);
      try {
        await onDeleteAccount();
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await onSignOut();
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Data & Privacy Card */}
      <div className="card bg-white shadow-lg border border-gray-100 rounded-3xl p-6 sm:p-8 w-full">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Icon icon="backArrow" className="w-6 h-6 text-text-grayPrimary rotate-90" />
          <h3 className="text-xl font-semibold text-text-grayPrimary">Data & Privacy</h3>
        </div>

        <div className="space-y-4">
          {/* Export Prayer Journal */}
          <button
            onClick={handleExportJournal}
            disabled={isExporting}
            className="btn btn-outline w-full h-14 border-gray-200 text-text-grayPrimary hover:bg-backgrounds-grayLight hover:border-gray-300 rounded-xl text-sm font-medium transition-all duration-200"
          >
            {isExporting ? "Exporting..." : "Export Prayer Journal (PDF)"}
          </button>

          {/* Download All Data */}
          <button
            onClick={handleDownloadData}
            disabled={isDownloading}
            className="btn btn-outline w-full h-14 border-gray-200 text-text-grayPrimary hover:bg-backgrounds-grayLight hover:border-gray-300 rounded-xl text-sm font-medium transition-all duration-200"
          >
            {isDownloading ? "Downloading..." : "Download All Data"}
          </button>

          {/* Delete Account */}
          <button
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            className="btn w-full h-14 bg-red-500 hover:bg-red-600 text-white border-none rounded-xl text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {isDeleting ? "Deleting..." : "Delete Account"}
          </button>
        </div>
      </div>

      {/* Sign Out Card */}
      <div className="card bg-white shadow-lg border border-gray-100 rounded-3xl p-6 sm:p-8 w-full">
        <button
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="btn btn-outline w-full h-14 border-gray-200 text-text-grayPrimary hover:bg-backgrounds-grayLight hover:border-gray-300 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-3"
        >
          <Icon icon="backArrow" className="w-5 h-5" />
          {isSigningOut ? "Signing Out..." : "Sign Out"}
        </button>
      </div>
    </div>
  );
}

export default DataPrivacyCard;