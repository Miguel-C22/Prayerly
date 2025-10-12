"use client";

import React, { useState } from "react";
import CustomValidator from "../custom-validator/CustomValidator";
import prayerSubmission from "@/utils/prayerSubmission";
import LoadingOverlay from "../loading/LoadingOverlay";

interface PrayerFormProps {
  onPrayerSubmitted?: (prayerData: any, response: any) => void;
}

function PrayerForm({ onPrayerSubmitted }: PrayerFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [recurrenceType, setRecurrenceType] = useState("");
  const [selectedChannels, setSelectedChannels] = useState<string[]>(["email"]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({
    title: false,
    category: false,
    recurrenceType: false,
  });

  const validateForm = () => {
    const newErrors = {
      title: title.trim() === "",
      category: category.trim() === "",
      recurrenceType: recurrenceType.trim() === "",
    };
    setErrors(newErrors);
    return !newErrors.title && !newErrors.category && !newErrors.recurrenceType;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = validateForm();
    if (isValid) {
      setIsSubmitting(true);
      try {
        const prayerData = {
          title,
          description,
          category,
          recurrenceType,
          channels: recurrenceType === 'none' ? [] : selectedChannels
        };
        const response = await prayerSubmission(prayerData);

        // Call the callback to update the parent state optimistically
        if (onPrayerSubmitted) {
          onPrayerSubmitted(prayerData, response);
        }

        // Clear form
        setTitle("");
        setDescription("");
        setCategory("");
        setRecurrenceType("");
        setSelectedChannels(["email"]);

        // Close the drawer
        const drawer = document.getElementById("my-drawer") as HTMLInputElement;
        if (drawer) drawer.checked = false;
      } catch (error) {
        console.error("Failed to submit prayer:", error);
        // You could show an error toast here
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <>
      <LoadingOverlay isLoading={isSubmitting} message="Adding prayer..." />
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Title Input */}
      <fieldset>
        <legend className="text-sm font-medium mb-2">Prayer Title *</legend>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Prayer title"
          className={`input w-full ${errors.title ? "input-error" : ""}`}
        />
        <CustomValidator error={errors.title} hint="Enter in prayer title" />
      </fieldset>

      {/* Category Select */}
      <fieldset className="fieldset">
        <legend className="fieldset-legend">Category *</legend>
        <select
          className={`select w-full ${errors.category ? "select-error" : ""}`}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="" disabled>
            Choose a category
          </option>
          <option value="personal">Personal</option>
          <option value="family">Family</option>
          <option value="friends">Friends</option>
          <option value="other">Other</option>
        </select>
        <CustomValidator error={errors.category} hint="Select a category" />
      </fieldset>

      {/* Description Textarea */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-2">
          Prayer Notes
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="textarea w-full h-32"
          placeholder="Share more details about your prayer request..."
        />
      </div>

      {/* Reminder Frequency */}
      <fieldset className="fieldset">
        <legend className="fieldset-legend">Prayer Reminders *</legend>
        <select
          className={`select w-full ${
            errors.recurrenceType ? "select-error" : ""
          }`}
          value={recurrenceType}
          onChange={(e) => setRecurrenceType(e.target.value)}
        >
          <option value="" disabled>
            Choose frequency
          </option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="none">None</option>
        </select>
        <CustomValidator error={errors.recurrenceType} hint="Select a option" />
      </fieldset>

      {/* Notification Channels - Only show if reminder is not 'none' */}
      {recurrenceType && recurrenceType !== 'none' && (
        <fieldset className="fieldset">
          <legend className="fieldset-legend">Notification Channels</legend>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="checkbox"
                checked={selectedChannels.includes('email')}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedChannels([...selectedChannels, 'email']);
                  } else {
                    setSelectedChannels(selectedChannels.filter(c => c !== 'email'));
                  }
                }}
              />
              <span className="text-sm">Email reminders</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="checkbox"
                checked={selectedChannels.includes('push')}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedChannels([...selectedChannels, 'push']);
                  } else {
                    setSelectedChannels(selectedChannels.filter(c => c !== 'push'));
                  }
                }}
              />
              <span className="text-sm">Push notifications</span>
            </label>
          </div>
          <span className="label text-xs text-text-graySecondary mt-2">
            Choose how you want to receive reminders for this prayer
          </span>
        </fieldset>
      )}

      {/* Submit Button */}
      <div className="flex gap-2">
        <button type="submit" className="btn btn-primary flex-1">
          Add Prayer
        </button>
        <label htmlFor="my-drawer" className="btn btn-outline flex-1">
          Cancel
        </label>
      </div>
      </form>
    </>
  );
}

export default PrayerForm;
