"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "brain", label: "Brain" },
  { href: "pipeline", label: "Pipeline" },
  { href: "engine", label: "Engine" },
  { href: "reports", label: "Reports" },
  { href: "settings", label: "Settings" },
];

export function ClientTabs({ clientId }: { clientId: string }) {
  const pathname = usePathname();

  return (
    <nav className="flex gap-6">
      {TABS.map((tab) => {
        const href = `/clients/${clientId}/${tab.href}`;
        const isActive = pathname.startsWith(href);
        return (
          <Link
            key={tab.href}
            href={href}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors duration-200 ${
              isActive
                ? "border-blue-700 text-blue-700"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
