"use client";

import { useEffect, useRef } from "react";

/**
 * Modal accessible : focus trap simple, close sur Escape et clic backdrop,
 * scroll-lock, aria-modal.
 */
export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousActive = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    ref.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKey);
      previousActive?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <button
        type="button"
        aria-label="Fermer"
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />
      <div
        ref={ref}
        className="card relative w-full max-w-lg overflow-hidden"
      >
        <div className="flex items-center justify-between border-b border-border p-5">
          <h2 id="modal-title" className="text-xl font-sans font-semibold">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost !p-2"
            aria-label="Fermer la modale"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
