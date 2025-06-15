
import { StickyNote } from "lucide-react";

export const NotesBlock = ({ notes }: { notes?: string | null }) => (
  <div className="text-sm text-gray-700 dark:text-gray-300 border-t border-gray-100 dark:border-gray-700 pt-3 mt-2 min-h-[48px]">
    <div className="flex items-center gap-1 font-medium text-gray-800 dark:text-white mb-1">
      <StickyNote className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      <span>Notes :</span>
    </div>
    {notes && notes.trim() !== "" ? (
      <span>{notes}</span>
    ) : (
      <span className="italic text-gray-500 dark:text-gray-400">
        Pas encore de notes pour cet acte.
      </span>
    )}
  </div>
);
