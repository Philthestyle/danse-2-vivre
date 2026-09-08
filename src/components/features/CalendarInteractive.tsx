"use client";

import { useMemo, useState } from "react";
import type { SeedCourse } from "@/lib/data/seed";

type Category = "event" | "course" | "stage";

interface CalendarEvent {
  category: Category;
  title: string;
  time: string;
  description?: string;
  location?: string;
  date: Date;
}

const DAYS = ["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"] as const;
const MONTHS_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
] as const;

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

/**
 * Retourne les cellules d'une grille calendrier alignée LUN..DIM
 * pour le mois donné. Les jours hors mois sont marqués `outside`.
 */
function buildMonthCells(year: number, monthIdx: number) {
  const firstOfMonth = new Date(year, monthIdx, 1);
  // JS: 0=dim..6=sam. On veut LUN=0..DIM=6.
  const leading = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();

  const cells: { date: Date; outside: boolean }[] = [];
  // padding début (mois précédent)
  for (let i = leading - 1; i >= 0; i--) {
    cells.push({ date: new Date(year, monthIdx, -i), outside: true });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, monthIdx, d), outside: false });
  }
  // padding fin — complète la dernière semaine
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1]!.date;
    const next = new Date(last);
    next.setDate(last.getDate() + 1);
    cells.push({ date: next, outside: next.getMonth() !== monthIdx });
  }
  return cells;
}

function courseToEvent(c: SeedCourse, idx: number): CalendarEvent {
  return {
    category: idx === 0 ? "event" : "course",
    title: c.title,
    time: `${fmtTime(c.startsAt)} - ${fmtTime(c.endsAt)}`,
    description: c.description,
    location: c.city,
    date: new Date(c.startsAt),
  };
}

export function CalendarInteractive({ courses }: { courses: SeedCourse[] }) {
  const today = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState<Date>(today);

  const events = useMemo(() => courses.map(courseToEvent), [courses]);
  const cells = useMemo(
    () => buildMonthCells(cursor.getFullYear(), cursor.getMonth()),
    [cursor],
  );

  const monthLabel = `${MONTHS_FR[cursor.getMonth()]} ${cursor.getFullYear()}`;
  const selectedEvents = events.filter((e) => sameDay(e.date, selected));
  const selectedLabel = selected.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const goPrev = () =>
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1));
  const goNext = () =>
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1));

  return (
    <>
      <div className="mt-10 rounded-xl border border-border bg-surface p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="font-semibold text-fg capitalize">{monthLabel}</p>
          <div className="flex gap-2">
            <ArrowBtn dir="prev" onClick={goPrev} />
            <ArrowBtn dir="next" onClick={goNext} />
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 border-b border-border pb-2">
          {DAYS.map((d) => (
            <p
              key={d}
              className="text-center text-xs font-semibold uppercase tracking-widest text-muted"
            >
              {d}
            </p>
          ))}
        </div>

        <div className="mt-2 grid grid-cols-7 gap-1">
          {cells.map(({ date, outside }, i) => {
            const dayEvents = events.filter((e) => sameDay(e.date, date));
            const isToday = sameDay(date, today);
            const isSelected = sameDay(date, selected);
            return (
              <button
                key={i}
                type="button"
                onClick={() => setSelected(date)}
                aria-pressed={isSelected}
                aria-label={date.toLocaleDateString("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
                className={[
                  "group aspect-[1.2/1] cursor-pointer rounded-md p-2 text-left transition-colors",
                  outside ? "text-muted/50" : "text-fg",
                  isSelected
                    ? "bg-primary/15 ring-1 ring-primary"
                    : "hover:bg-elevated/40",
                ].join(" ")}
              >
                <p
                  className={[
                    "text-sm",
                    isToday && !isSelected ? "font-bold text-primary" : "",
                  ].join(" ")}
                >
                  {date.getDate()}
                </p>
                {dayEvents.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {dayEvents.slice(0, 3).map((e, j) => (
                      <span
                        key={j}
                        className={`h-2 w-2 rounded-full ${dotColor(e.category)}`}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-12">
        <h2 className="font-sans text-lg font-semibold text-fg capitalize">
          {selectedLabel}
        </h2>
        <div className="mt-6 space-y-6">
          {selectedEvents.length === 0 ? (
            <p className="text-sm text-muted">
              Aucun événement prévu ce jour. Choisissez une autre date dans le
              calendrier.
            </p>
          ) : (
            selectedEvents.map((e, i) => (
              <EventCard
                key={i}
                category={e.category}
                time={e.time}
                title={e.title}
                description={e.description}
                location={e.location}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}

function dotColor(c: Category) {
  return c === "event" ? "bg-primary" : c === "course" ? "bg-accent" : "bg-success";
}

function ArrowBtn({ dir, onClick }: { dir: "prev" | "next"; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer rounded-md p-1 text-muted transition-colors hover:bg-elevated/60 hover:text-fg"
      aria-label={dir === "prev" ? "Mois précédent" : "Mois suivant"}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        {dir === "prev" ? <path d="M15 18l-6-6 6-6" /> : <path d="M9 18l6-6-6-6" />}
      </svg>
    </button>
  );
}

function EventCard({
  category,
  time,
  title,
  description,
  location,
}: {
  category: Category;
  time: string;
  title: string;
  description?: string;
  location?: string;
}) {
  return (
    <article className="border-b border-border pb-6 last:border-0">
      <div className="flex items-center gap-3">
        <span
          className={`inline-block h-3 w-3 rounded-full ${dotColor(category)}`}
          aria-hidden="true"
        />
        <p className="text-sm font-semibold text-fg">{time}</p>
      </div>
      <p className="mt-2 text-xl font-bold text-fg">{title}</p>
      {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      {location && (
        <p className="mt-3 flex items-center gap-2 text-sm text-muted">
          <FlagIcon className="h-4 w-4" />
          {location}
        </p>
      )}
    </article>
  );
}

function FlagIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 21V4l14 4-14 5" />
    </svg>
  );
}
