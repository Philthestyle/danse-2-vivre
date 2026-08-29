/**
 * Section "Nous contacter" présente au bas de plusieurs écrans Figma
 * (Slide 1 home, Slide 5 merci, Slide 6-7 calendrier, Slide 12 FAQ).
 * Layout uniforme : titre script + libellé + carte email avec icône Gmail.
 */
export function ContactSection({ className = "" }: { className?: string }) {
  return (
    <section className={`py-16 md:py-20 ${className}`}>
      <div className="container-page">
        <h2 className="display-script text-fg">Nous contacter</h2>
        <p className="mt-6 text-sm text-fg">
          Pour toute question merci de nous contacter par email :
        </p>
        <a
          href="mailto:secretariat.dansedevivre@gmail.com"
          className="mt-4 inline-flex items-center gap-3 text-fg hover:text-primary"
        >
          <GmailIcon className="h-6 w-6" />
          <span className="text-sm">secretariat.dansedevivre@gmail.com</span>
        </a>
      </div>
    </section>
  );
}

function GmailIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect width="24" height="24" rx="4" fill="#fff" />
      <path
        d="M4 8v10a1 1 0 0 0 1 1h3v-8l4 3 4-3v8h3a1 1 0 0 0 1-1V8l-8 6-8-6z"
        fill="#ea4335"
      />
      <path d="M4 8l8 6 8-6-8-2-8 2z" fill="#c5221f" />
    </svg>
  );
}
