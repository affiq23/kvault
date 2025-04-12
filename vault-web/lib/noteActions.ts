// vault-web/src/lib/noteActions.ts
import { supabase } from "./supabaseClient";

export const saveNote = async (
  userId: string,
  title: string,
  content: string,
  noteId?: string
): Promise<void> => {
  if (noteId) {
    const { error } = await supabase
      .from("notes")
      .update({
        title,
        content,
        updated_at: new Date().toISOString(),
      })
      .eq("id", noteId);

    if (error) throw new Error("Failed to update note: " + error.message);
  } else {
    const { error } = await supabase.from("notes").insert([
      {
        title,
        content,
        branch: "main",
        user_id: userId,
      },
    ]);

    if (error) throw new Error("Failed to save note: " + error.message);
  }
};

export const deleteNote = async (noteId: string): Promise<void> => {
  const { error } = await supabase.from("notes").delete().eq("id", noteId);
  if (error) throw new Error("Failed to delete note: " + error.message);
};
