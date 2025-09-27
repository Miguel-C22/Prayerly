import React from "react";
import ReflectionCard from "@/components/cards/ReflectionCard";
import { UIReflection } from "@/utils/client/reflectionsClient";

interface ReflectionContainerProps {
  reflections?: UIReflection[];
  edit?: boolean;
  onReflectionChange?: (reflectionId: string, newText: string) => void;
}

function ReflectionContainer({
  reflections = [],
  edit,
  onReflectionChange,
}: ReflectionContainerProps) {
  const displayReflections = reflections;
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      {/* Header */}
      <h3 className="text-lg font-semibold text-text-grayPrimary mb-6">
        Previous Reflections
      </h3>

      {/* Reflections List */}
      <div className="space-y-4">
        {displayReflections?.length > 0 ? (
          displayReflections.map((reflection) => (
            <ReflectionCard
              key={reflection.id}
              date={reflection.date}
              reflection={reflection.reflection}
              edit={edit}
              onReflectionChange={(newText) =>
                onReflectionChange?.(reflection.id, newText)
              }
            />
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-text-graySecondary">No reflections yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReflectionContainer;
