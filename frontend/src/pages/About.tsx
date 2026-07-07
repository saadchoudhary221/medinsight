export default function About() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <p className="text-xs font-medium uppercase tracking-widest text-[--color-ink-soft]">About</p>
      <h1 className="mt-3 font-display text-4xl italic text-[--color-ink] md:text-5xl">
        An independent project, built from scratch
      </h1>
      <div className="mt-8 space-y-5 text-[--color-ink-soft]">
        <p>
          MedInsight is an independent personal software engineering project focused on making medical reports
          easier to read and understand. It was built end-to-end using a modern web stack, from the authentication
          system to the report analysis pipeline to the interface itself.
        </p>
        <p>
          The goal was simple: take a document that's usually written for clinicians and turn it into something a
          patient can actually read in a couple of minutes, without losing anything important along the way.
        </p>
        <p>
          MedInsight is not a hospital, a clinic, or a medical provider, and it has no affiliation with any hospital
          or clinic. It does not diagnose conditions or replace the judgment of a licensed healthcare professional.
          Every analysis is strictly informational, and every report page says so clearly.
        </p>
      </div>
    </div>
  );
}
