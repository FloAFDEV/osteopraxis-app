
import React from "react";

interface SpecializedSphereSectionsProps {
  sections: Array<{ title: string; value: string | null | undefined }>;
}

export function SpecializedSphereSections({ sections }: SpecializedSphereSectionsProps) {
  if (!sections.some(s => s.value && String(s.value).trim() !== "")) return null;
  return (
    <div className="border-orange-300 dark:border-orange-700 bg-orange-50/50 dark:bg-orange-900/20 rounded-lg mb-6">
      <div className="px-6 py-4 border-b border-orange-200 dark:border-orange-700">
        <span className="text-lg flex items-center gap-2 font-semibold">
          Sphères spécialisées
          <span className="text-sm font-normal text-orange-700 dark:text-orange-200">
            (nouveaux champs)
          </span>
        </span>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map(
            (s) =>
              s.value &&
              String(s.value).trim() !== "" && (
                <div
                  key={s.title}
                  className="bg-white dark:bg-slate-800 rounded p-4 border border-muted-200 dark:border-muted-700 flex flex-col shadow-sm"
                >
                  <span className="font-semibold text-base mb-1 text-orange-900 dark:text-orange-200">{s.title}</span>
                  <span className="text-gray-700 dark:text-gray-100 whitespace-pre-line break-words">{s.value}</span>
                </div>
              )
          )}
        </div>
      </div>
    </div>
  );
}
