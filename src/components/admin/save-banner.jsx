"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export function SaveBanner({ show }) {
  const [visible, setVisible] = useState(show);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!show) return;
    setVisible(true);
    const t = setTimeout(() => {
      setVisible(false);
      router.replace(pathname);
    }, 3000);
    return () => clearTimeout(t);
  }, [show, pathname, router]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-md shadow-lg text-sm font-medium"
    >
      <span aria-hidden="true">✓</span> Saved
    </div>
  );
}
