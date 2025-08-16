// vault-web/src/lib/noteActions.ts
import { supabase } from "./supabaseClient";

// handles both insert/update functions for either existing or new notes
// called from notes/page.tsx 
// if editing existing note -> updates
// if creating new note -> inserts
// after save -> frontend fetches notes again to refresh sidebar
export const saveNote = async (
  userId: string,
  title: string,
  content: string,
  noteId?: string
): Promise<void> => {
  if (noteId) { // if note exists, check row in Supabase to update row with matching ID
    const { error } = await supabase
      .from("notes")
      .update({ // update attributes
        title,
        content,
        updated_at: new Date().toISOString(),
      })
      .eq("id", noteId);

    if (error) throw new Error("Failed to update note: " + error.message);
  } else { // if saving new note
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
