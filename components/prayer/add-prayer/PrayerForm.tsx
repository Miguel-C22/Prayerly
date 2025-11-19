"use client";

import React, { useState } from "react";
import CustomValidator from "@/components/utils/CustomValidator";
import prayerSubmission from "@/utils/prayerSubmission";
import LoadingOverlay from "@/components/ui/loading/LoadingOverlay";
import Input from "@/components/ui/input/Input";
import Button from "@/components/ui/button/Button";
import TextArea from "@/components/ui/text-area/TextArea";
import DropDown from "@/components/ui/drop-down/DropDown";

interface PrayerFormProps {
  onPrayerSubmitted?: (prayerData: any, response: any) => void;
}

function PrayerForm({ onPrayerSubmitted }: PrayerFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [recurrenceType, setRecurrenceType] = useState("");
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
      <div>
        <Input
          type="text"
          value={title}
          setValue={setTitle}
          placeholder="Prayer title"
          error={errors.title}
        />
        <CustomValidator error={errors.title} hint="Enter in prayer title" />
      </div>

      {/* Category Select */}
      <div>
        <DropDown
          value={category}
          onChange={setCategory}
          options={[
            { value: "personal", label: "Personal" },
            { value: "family", label: "Family" },
            { value: "friends", label: "Friends" },
            { value: "other", label: "Other" },
          ]}
          placeholder="Choose a category"
          error={!!errors.category}
        />
        <CustomValidator error={errors.category} hint="Select a category" />
      </div>

      {/* Description Textarea */}
      <div>
        <TextArea
          id="description"
          value={description}
          setValue={setDescription}
          placeholder="Share more details about your prayer request..."
          rows={8}
        />
      </div>

      {/* Reminder Frequency */}
      <div>
        <DropDown
          value={recurrenceType}
          onChange={setRecurrenceType}
          options={[
            { value: "daily", label: "Daily" },
            { value: "weekly", label: "Weekly" },
            { value: "none", label: "None" },
          ]}
          placeholder="Choose frequency"
          error={!!errors.recurrenceType}
        />
        <CustomValidator error={errors.recurrenceType} hint="Select a option" />
      </div>

      {/* Submit Button */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Button type="submit" variant="primary" fullWidth>
            Add Prayer
          </Button>
        </div>
        <div className="flex-1">
          <label
            htmlFor="add-prayer"
            className="font-semibold !rounded-full transition-all duration-200 focus:outline-none focus:outline-offset-0 inline-flex items-center justify-center gap-2 border-2 bg-transparent hover:bg-backgrounds-grayLight text-text-grayPrimary border-border-gray h-12 px-6 text-base cursor-pointer w-full"
          >
            Cancel
          </label>
        </div>
      </div>
      </form>
    </>
  );
}

export default PrayerForm;
