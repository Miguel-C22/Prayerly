import axios from "axios";

interface ReflectionSubmission {
  note: string;
  prayerId: string;
}

async function reflectionSubmission({ note, prayerId }: ReflectionSubmission) {
  try {
    const { data } = await axios.post(
      "/api/reflections",
      {
        note,
        prayer_id: prayerId,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return data;
  } catch (error) {
    console.error("Error submitting reflection:", error);
    throw error;
  }
}

export default reflectionSubmission;
