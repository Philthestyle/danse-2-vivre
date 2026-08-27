import type { Metadata } from "next";
import { seedCourses } from "@/lib/data/seed";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Calendrier",
  description: "Le calendrier des cours et événements de Danse 2 Vivre.",
};

export default function CalendarPage() {
  const grouped = seedCourses.reduce<Record<string, typeof seedCourses>>(
    (acc, c) => {
      const key = new Date(c.startsAt).toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });
      (acc[key] ??= []).push(c);
      return acc;
    },
    {}
  );

  return (
    <div className="container-page py-16">
      <header className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          Agenda
        </p>
        <h1 className="mt-2 text-5xl sm:text-6xl">Calendrier</h1>
        <p className="mt-4 text-lg text-muted">
          Les prochains cours et événements de la saison. La création et la modification
          se font depuis l'espace professeur ou l'administration.
        </p>
      </header>

      <div className="mt-16 space-y-10">
        {Object.entries(grouped).map(([day, items]) => (
          <section key={day}>
            <h2 className="mb-4 font-display text-3xl capitalize text-primary">
              {day}
            </h2>
            <div className="space-y-3">
              {items.map((c, i) => (
                <article key={i} className="card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-xl font-sans font-semibold">{c.title}</h3>
                    <p className="text-sm text-muted">
                      {c.teacher} · {c.city}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-medium">
                      {new Date(c.startsAt).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {" – "}
                      {new Date(c.endsAt).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="text-xs text-muted">{formatDateTime(c.startsAt)}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
