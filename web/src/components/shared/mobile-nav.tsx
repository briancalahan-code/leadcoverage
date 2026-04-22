"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "./sidebar-nav";

interface MobileNavProps {
  items: NavItem[];
  orgName: string;
  userName: string;
}

export function MobileNav({ items, orgName, userName }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Hamburger button — visible only on small screens */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-3 left-3 z-40 md:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-gray-900 text-white shadow-lg"
        aria-label="Open navigation"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Overlay + slide-out panel */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <aside className="relative w-64 h-full bg-gray-900 text-white flex flex-col animate-fade-in">
            {/* Header */}
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold text-blue-400">
                  LeadCoverage
                </h1>
                <p className="text-xs text-gray-400 mt-1">{orgName}</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-white"
                aria-label="Close navigation"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Nav items */}
            <nav className="flex-1 p-2">
              {items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive
                        ? "bg-gray-800 text-white"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    }`}
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-800">
              <p className="text-sm text-gray-400">{userName}</p>
              <form action="/api/auth/signout" method="POST">
                <button
                  type="submit"
                  className="text-xs text-gray-500 hover:text-gray-300 mt-1"
                >
                  Sign out
                </button>
              </form>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
