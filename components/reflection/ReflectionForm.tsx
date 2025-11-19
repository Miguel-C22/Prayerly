import React, { useState } from "react";
import Icon from "@/components/ui/icon/Icon";
import reflectionSubmission from "@/utils/reflectionSubmission";
import { UIReflection } from "@/utils/client/reflectionsClient";
import LoadingOverlay from "@/components/ui/loading/LoadingOverlay";
import Button from "@/components/ui/button/Button";
import TextArea from "@/components/ui/text-area/TextArea";

interface ReflectionFormProps {
  prayerId: string;
  onAddReflection?: (reflection: UIReflection) => void;
}

function ReflectionForm({ prayerId, onAddReflection }: ReflectionFormProps) {
  const [reflection, setReflection] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!reflection.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      await reflectionSubmission({ note: reflection, prayerId });

      // Create new reflection after successful save
      const newReflection: UIReflection = {
        id: `temp-${Date.now()}`,
        date: new Date().toLocaleDateString(),
        reflection: reflection.trim(),
      };

      onAddReflection?.(newReflection);
      setReflection("");
    } catch (error) {
      console.error("Failed to save reflection:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <LoadingOverlay isLoading={isSubmitting} message="Saving reflection..." />
      <div className="bg-backgrounds-white border border-border-gray rounded-lg p-6">
        {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Icon icon="bible" className="w-5 h-5 text-text-purplePrimary" />
        <h3 className="text-lg font-semibold text-text-grayPrimary">
          Add Reflection
        </h3>
      </div>

      {/* Textarea */}
      <div className="mb-4">
        <TextArea
          placeholder="Write your thoughts, feelings, or any updates about this prayer request..."
          value={reflection}
          setValue={setReflection}
          rows={8}
        />
      </div>

      {/* Save Button */}
      <Button
        variant="primary"
        onClick={handleSave}
        disabled={!reflection.trim()}
      >
        Save Reflection
      </Button>
      </div>
    </>
  );
}

export default ReflectionForm;
