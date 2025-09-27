import { Prayer } from "@/types/prayer";
import React, { useState, useEffect } from "react";
import Icon from "../icon/Icon";
import PrayerCard from "../cards/PrayerCard";
import BibleVerse from "../bible-verse/BibleVerse";
import ReflectionForm from "../reflection/ReflectionForm";
import ReflectionContainer from "../reflection/ReflectionContainer";
import {
  getReflections,
  UIReflection,
  updateReflection,
} from "@/utils/client/reflectionsClient";
import { updatePrayer } from "@/utils/client/prayersClient";
import { useRouter } from "next/navigation";

interface ViewPrayerDrawerProps {
  prayerDetails: Prayer | null;
  refetchPrayers: () => void;
}

function ViewPrayerDrawer({
  prayerDetails,
  refetchPrayers,
}: ViewPrayerDrawerProps) {
  const router = useRouter();
  const [currentReflections, setCurrentReflections] = useState<UIReflection[]>(
    []
  );
  const [, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editablePrayer, setEditablePrayer] = useState({
    title: prayerDetails?.title || "",
    description: prayerDetails?.description || "",
  });
  const [editableReflections, setEditableReflections] = useState<
    Record<string, string>
  >({});

  // Load reflections when prayerDetails changes
  useEffect(() => {
    const loadReflections = async () => {
      if (!prayerDetails?.id) return;

      setIsLoading(true);
      try {
        const reflections = await getReflections(prayerDetails.id);
        setCurrentReflections(reflections);
        // Initialize editable reflections
        const reflectionsMap = reflections.reduce(
          (acc, reflection) => ({
            ...acc,
            [reflection.id]: reflection.reflection,
          }),
          {}
        );
        setEditableReflections(reflectionsMap);
      } catch (error) {
        console.error("Failed to load reflections:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadReflections();
    setHasChanges(false);

    // Initialize editable prayer data
    if (prayerDetails) {
      setEditablePrayer({
        title: prayerDetails.title || "",
        description: prayerDetails.description || "",
      });
    }
  }, [prayerDetails]);

  const handleAddReflection = (newReflection: UIReflection) => {
    setCurrentReflections((prev) => [newReflection, ...prev]);
    setHasChanges(true);
    // Initialize reflection in editable state
    setEditableReflections((prev) => ({
      ...prev,
      [newReflection.id]: newReflection.reflection,
    }));
  };

  const markedAsAnswered = async () => {
    await updatePrayer(prayerDetails?.id || "", {
      is_answered: !prayerDetails?.is_answered,
    });
    setHasChanges(true);
  };

  const closeDrawer = () => {
    if (hasChanges) {
      refetchPrayers();
      setHasChanges(false);
    }
    setEditMode(false);
  };

  const handleClick = () => {
    closeDrawer();
    router.push("/journal");
  };

  const editPrayer = () => {
    setEditMode(!editMode);
  };

  const savePrayer = async () => {
    if (!prayerDetails?.id) return;

    try {
      await updatePrayer(prayerDetails.id, {
        title: editablePrayer.title,
        description: editablePrayer.description,
      });
      setHasChanges(true);
    } catch (error) {
      console.error("Failed to update prayer:", error);
    }
  };

  const saveReflection = async (reflectionId: string, newText: string) => {
    try {
      await updateReflection(reflectionId, newText);
      setEditableReflections((prev) => ({
        ...prev,
        [reflectionId]: newText,
      }));
      setHasChanges(true);
    } catch (error) {
      console.error("Failed to update reflection:", error);
    }
  };

  const saveAllChanges = async () => {
    await savePrayer();

    // Save all changed reflections
    for (const [reflectionId, newText] of Object.entries(editableReflections)) {
      const originalReflection = currentReflections.find(
        (r) => r.id === reflectionId
      );
      if (originalReflection && originalReflection.reflection !== newText) {
        await saveReflection(reflectionId, newText);
      }
    }

    setEditMode(false);
  };

  const cancelEditedChanges = () => {
    // Reset editable states to original values
    if (prayerDetails) {
      setEditablePrayer({
        title: prayerDetails.title || "",
        description: prayerDetails.description || "",
      });
    }
    const reflectionsMap = currentReflections.reduce(
      (acc, reflection) => ({
        ...acc,
        [reflection.id]: reflection.reflection,
      }),
      {}
    );
    setEditableReflections(reflectionsMap);
    setEditMode(false);
  };

  return (
    <div className="drawer z-40">
      <input id="view-prayer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-side">
        <label
          htmlFor="view-prayer"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <div className="text-base-content min-h-full w-full flex flex-col bg-backgrounds-light">
          {/* Header with back button */}
          <div className="flex place-content-between p-6 pb-0">
            <div className="flex justify-between items-center mb-4 text-black">
              <label
                htmlFor="view-prayer"
                className="btn btn-ghost text-black flex items-center gap-2 hover:bg-transparent hover:shadow-none hover:scale-100 hover:border-transparent focus:border-transparent focus:outline-none"
                onClick={closeDrawer}
              >
                <Icon icon="backArrow" className="w-5 h-5" />
                Back
              </label>
            </div>
            {editMode ? (
              <div className="flex gap-2">
                <button className="btn btn-ghost" onClick={cancelEditedChanges}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={saveAllChanges}>
                  Save
                </button>
              </div>
            ) : (
              <button className="btn" onClick={editPrayer}>
                Edit
              </button>
            )}
          </div>

          {/* Centered form content */}
          <div className="pb-20 flex justify-center">
            <div className="w-full mx-8 md:w-full lg:w-full 2xl:w-3/4 lg:px-0">
              <div className="flex flex-col gap-4">
                <PrayerCard
                  key={prayerDetails?.id}
                  id={prayerDetails?.id || ""}
                  title={
                    editMode ? editablePrayer.title : prayerDetails?.title || ""
                  }
                  description={
                    editMode
                      ? editablePrayer.description
                      : prayerDetails?.description || ""
                  }
                  date={new Date(
                    prayerDetails?.created_at || ""
                  ).toLocaleDateString()}
                  category={prayerDetails?.category || undefined}
                  edit={editMode}
                  hideBtn={true}
                  onTitleChange={(title) =>
                    setEditablePrayer((prev) => ({ ...prev, title }))
                  }
                  onDescriptionChange={(description) =>
                    setEditablePrayer((prev) => ({ ...prev, description }))
                  }
                />
                <BibleVerse
                  verse="The prayer of a righteous person is powerful and effective."
                  chapter="James 5:16"
                />
                <ReflectionForm
                  prayerId={prayerDetails?.id || ""}
                  onAddReflection={handleAddReflection}
                />
                <ReflectionContainer
                  reflections={
                    editMode
                      ? currentReflections.map((r) => ({
                          ...r,
                          reflection:
                            editableReflections[r.id] !== undefined
                              ? editableReflections[r.id]
                              : r.reflection,
                        }))
                      : currentReflections
                  }
                  edit={editMode}
                  onReflectionChange={(reflectionId, newText) =>
                    setEditableReflections((prev) => ({
                      ...prev,
                      [reflectionId]: newText,
                    }))
                  }
                />

                {/* Action Buttons */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex gap-4">
                    <button
                      className="btn bg-text-purplePrimary hover:bg-purple-600 text-white border-none flex-1"
                      onClick={markedAsAnswered}
                    >
                      <Icon icon="heart" className="w-4 h-4" />
                      Mark as Answered
                    </button>
                    <button
                      className="btn btn-outline border-gray-300 text-text-grayPrimary hover:bg-gray-50 flex-1"
                      onClick={handleClick}
                    >
                      <Icon icon="bible" className="w-4 h-4" />
                      View All Reflections
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewPrayerDrawer;
