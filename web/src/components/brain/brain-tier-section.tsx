"use client";

import { useState } from "react";

interface Props {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function BrainTierSection({
  title,
  children,
  defaultOpen = false,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mb-6">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3 hover:text-gray-900"
      >
        <span
          className={`transition-transform duration-200 ${open ? "rotate-90" : ""}`}
        >
          &#9654;
        </span>
        {title}
      </button>
      {open && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-[fadeIn_200ms_ease-in]">
          {children}
        </div>
      )}
    </div>
  );
}
