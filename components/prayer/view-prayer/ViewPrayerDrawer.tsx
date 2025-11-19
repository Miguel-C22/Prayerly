import { Prayer } from "@/types/prayer";
import React, { useState, useEffect } from "react";
import Icon from "@/components/ui/icon/Icon";
import ContentCard from "@/components/ui/cards/ContentCard";
import ReflectionForm from "@/components/reflection/ReflectionForm";
import ReflectionContainer from "@/components/reflection/ReflectionContainer";
import {
  getReflections,
  UIReflection,
  updateReflection,
} from "@/utils/client/reflectionsClient";
import { updatePrayer } from "@/utils/client/prayersClient";
import { useRouter } from "next/navigation";
import LoadingOverlay from "@/components/ui/loading/LoadingOverlay";
import AIBibleVerse from "@/components/bible/AIBibleVerse";
import Button from "@/components/ui/button/Button";
import DropDown from "@/components/ui/drop-down/DropDown";

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
  const [isLoading, setIsLoading] = useState(false);
  const [isMarkingAnswered, setIsMarkingAnswered] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editablePrayer, setEditablePrayer] = useState({
    title: prayerDetails?.title || "",
    description: prayerDetails?.description || "",
    recurrenceType: "",
  });
  const [editableReflections, setEditableReflections] = useState<
    Record<string, string>
  >({});
  const [currentPrayerDetails, setCurrentPrayerDetails] =
    useState<Prayer | null>(prayerDetails);
  const [currentReminder, setCurrentReminder] = useState<any>(null);

  // Load reflections and reminder when prayerDetails changes
  useEffect(() => {
    const loadData = async () => {
      if (!prayerDetails?.id) return;

      setIsLoading(true);
      try {
        // Fetch reflections
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

        // Fetch reminder for this prayer
        const response = await fetch(`/api/reminders?prayer_id=${prayerDetails.id}`);
        if (response.ok) {
          const data = await response.json();
          setCurrentReminder(data.reminder);

          // Initialize editable prayer with reminder data
          setEditablePrayer({
            title: prayerDetails.title || "",
            description: prayerDetails.description || "",
            recurrenceType: data.reminder?.recurrence_type || "none",
          });
        } else {
          // No reminder found
          setEditablePrayer({
            title: prayerDetails.title || "",
            description: prayerDetails.description || "",
            recurrenceType: "none",
          });
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    setHasChanges(false);
    setCurrentPrayerDetails(prayerDetails);
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
    setIsMarkingAnswered(true);
    try {
      await updatePrayer(prayerDetails?.id || "", {
        is_answered: !prayerDetails?.is_answered,
      });
      setHasChanges(true);
    } catch (error) {
      console.error("Failed to mark as answered:", error);
    } finally {
      setIsMarkingAnswered(false);
    }
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
      // Update currentPrayerDetails with the saved changes
      setCurrentPrayerDetails((prev) =>
        prev
          ? {
              ...prev,
              title: editablePrayer.title,
              description: editablePrayer.description,
            }
          : null
      );
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
    setIsSaving(true);
    try {
      await savePrayer();

      // Save all changed reflections
      for (const [reflectionId, newText] of Object.entries(
        editableReflections
      )) {
        const originalReflection = currentReflections.find(
          (r) => r.id === reflectionId
        );
        if (originalReflection && originalReflection.reflection !== newText) {
          await saveReflection(reflectionId, newText);
        }
      }

      // Handle reminder changes
      await saveReminder();

      setEditMode(false);
    } catch (error) {
      console.error("Failed to save changes:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const saveReminder = async () => {
    if (!prayerDetails?.id) return;

    const newRecurrenceType = editablePrayer.recurrenceType;
    const oldRecurrenceType = currentReminder?.recurrence_type;

    // Case 1: Recurrence changed from none to daily/weekly - CREATE reminder
    if (
      (!oldRecurrenceType || oldRecurrenceType === "none") &&
      newRecurrenceType &&
      newRecurrenceType !== "none"
    ) {
      await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prayer_id: prayerDetails.id,
          recurrence_type: newRecurrenceType,
          channels: ["email"],
        }),
      });
      setHasChanges(true);
    }
    // Case 2: Recurrence changed to none - DELETE reminder
    else if (newRecurrenceType === "none" && currentReminder?.id) {
      await fetch(`/api/reminders/${currentReminder.id}`, {
        method: "DELETE",
      });
      setHasChanges(true);
    }
    // Case 3: Recurrence type changed (daily <-> weekly) - UPDATE reminder
    else if (
      oldRecurrenceType &&
      newRecurrenceType &&
      oldRecurrenceType !== "none" &&
      newRecurrenceType !== "none" &&
      oldRecurrenceType !== newRecurrenceType
    ) {
      await fetch(`/api/reminders/${currentReminder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recurrence_type: newRecurrenceType,
        }),
      });
      setHasChanges(true);
    }
  };

  const cancelEditedChanges = () => {
    // Reset editable states to original values
    if (prayerDetails) {
      setEditablePrayer({
        title: prayerDetails.title || "",
        description: prayerDetails.description || "",
        recurrenceType: currentReminder?.recurrence_type || "none",
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
    <>
      <LoadingOverlay
        isLoading={isMarkingAnswered}
        message="Marking as answered..."
      />
      <LoadingOverlay isLoading={isSaving} message="Saving changes..." />
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
              <div className="flex justify-between items-center mb-4">
                <label
                  htmlFor="view-prayer"
                  className="font-semibold !rounded-full transition-all duration-200 focus:outline-none focus:outline-offset-0 inline-flex items-center justify-center gap-2 border-2 bg-transparent hover:bg-backgrounds-grayLight text-text-grayPrimary border-transparent h-10 px-4 text-sm cursor-pointer"
                  onClick={closeDrawer}
                >
                  <Icon icon="backArrow" className="w-5 h-5" />
                  Back
                </label>
              </div>
              {editMode ? (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    onClick={cancelEditedChanges}
                  >
                    Cancel
                  </Button>
                  <Button variant="primary" onClick={saveAllChanges}>
                    Save
                  </Button>
                </div>
              ) : (
                <Button variant="secondary" onClick={editPrayer}>
                  Edit
                </Button>
              )}
            </div>

            {/* Centered form content */}
            <div className="pb-20 flex justify-center">
              <div className="w-full mx-8 md:w-full lg:w-full 2xl:w-3/4 lg:px-0">
                <div className="flex flex-col gap-4">
                  <ContentCard
                    variant="prayer"
                    key={currentPrayerDetails?.id}
                    id={currentPrayerDetails?.id || ""}
                    title={
                      editMode
                        ? editablePrayer.title
                        : currentPrayerDetails?.title || ""
                    }
                    description={
                      editMode
                        ? editablePrayer.description
                        : currentPrayerDetails?.description || ""
                    }
                    date={new Date(
                      currentPrayerDetails?.created_at || ""
                    ).toLocaleDateString()}
                    category={currentPrayerDetails?.category || undefined}
                    edit={editMode}
                    hideBtn={true}
                    onTitleChange={(title) =>
                      setEditablePrayer((prev) => ({ ...prev, title }))
                    }
                    onDescriptionChange={(description) =>
                      setEditablePrayer((prev) => ({ ...prev, description }))
                    }
                  />

                  {/* Reminder frequency dropdown - only show in edit mode */}
                  {editMode && (
                    <div className="bg-backgrounds-grayLight rounded-2xl p-4">
                      <h3 className="text-sm font-semibold text-text-grayPrimary mb-3">
                        Reminder Frequency
                      </h3>
                      <DropDown
                        value={editablePrayer.recurrenceType}
                        onChange={(value) =>
                          setEditablePrayer((prev) => ({
                            ...prev,
                            recurrenceType: value,
                          }))
                        }
                        options={[
                          { value: "daily", label: "Daily" },
                          { value: "weekly", label: "Weekly" },
                          { value: "none", label: "None" },
                        ]}
                        placeholder="Choose frequency"
                      />
                    </div>
                  )}

                  {!editMode && (
                    <div className="flex flex-col gap-6">
                      <div className="flex flex-col gap-3">
                        <h3 className="text-lg font-semibold text-text-grayPrimary">
                          Related Bible Verses
                        </h3>
                        <AIBibleVerse
                          prayerDetails={currentPrayerDetails}
                          generateType="verses"
                        />
                      </div>
                      <div className="flex flex-col gap-3">
                        <h3 className="text-lg font-semibold text-text-grayPrimary">
                          AI-Generated Prayer
                        </h3>
                        <AIBibleVerse
                          prayerDetails={currentPrayerDetails}
                          generateType="prayer"
                        />
                      </div>
                    </div>
                  )}
                  <ReflectionForm
                    prayerId={prayerDetails?.id || ""}
                    onAddReflection={handleAddReflection}
                  />
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <span className="loading loading-spinner text-primary"></span>
                    </div>
                  ) : (
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
                  )}

                  {/* Action Buttons */}
                  <div className="bg-backgrounds-white border border-border-gray rounded-lg p-6">
                    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4">
                      <div className="sm:flex-1">
                      <Button
                        variant="primary"
                        onClick={markedAsAnswered}
                        icon={<Icon icon="heart" className="w-4 h-4" />}
                        fullWidth
                      >
                        Mark as Answered
                      </Button>
                      </div>
                      <div className="sm:flex-1">
                      <Button
                        variant="outline"
                        onClick={handleClick}
                        icon={<Icon icon="bible" className="w-4 h-4" />}
                        fullWidth
                      >
                        View All Reflections
                      </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ViewPrayerDrawer;
