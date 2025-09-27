"use client";

import React, { useState } from "react";
import CustomValidator from "../custom-validator/CustomValidator";
import prayerSubmission from "@/utils/prayerSubmission";

interface PrayerFormProps {
  onPrayerSubmitted?: (prayerData: any, response: any) => void;
}

function PrayerForm({ onPrayerSubmitted }: PrayerFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [recurrenceType, setRecurrenceType] = useState("");
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
      try {
        const prayerData = { title, description, category, recurrenceType };
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

        // Close the drawer
        const drawer = document.getElementById("my-drawer") as HTMLInputElement;
        if (drawer) drawer.checked = false;
      } catch (error) {
        console.error("Failed to submit prayer:", error);
        // You could show an error toast here
      }
    }
  };

  return (
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

      {/* Reminder */}
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
            Prayer Reminder
          </option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="none">None</option>
        </select>
        <span className="label">
          We'll send gentle email reminders to pray for this prayer
        </span>
        <CustomValidator error={errors.recurrenceType} hint="Select a option" />
      </fieldset>

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
  );
}

export default PrayerForm;
