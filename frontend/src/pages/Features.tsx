import { FileText, ShieldCheck, Sparkles, Clock, Table2, MessageCircleQuestion, Bell, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";

const FEATURES = [
  { icon: FileText, title: "Plain-language summaries", body: "Every report is distilled into a short overview written for a non-clinical reader, no jargon left unexplained." },
  { icon: Table2, title: "Structured findings table", body: "Test names, values, and a normal / borderline / attention status, organized the same way every time." },
  { icon: MessageCircleQuestion, title: "Understanding your results", body: "A dedicated section explains what your notable findings actually mean, in everyday language." },
  { icon: Sparkles, title: "Wellness suggestions", body: "Practical, general suggestions related to your findings — never a prescription or treatment plan." },
  { icon: Clock, title: "Fast turnaround", body: "Reports move from Uploading to Processing to Complete in seconds, with live status on your dashboard." },
  { icon: ShieldCheck, title: "Your data, your account", body: "Every report and result is scoped to your account. Nobody else can view your uploads." },
  { icon: Lock, title: "Secure by design", body: "Authentication, protected routes, and per-user data access are built in from the ground up." },
  { icon: Bell, title: "Report history", body: "Search and filter every report you've ever uploaded, with one-click access back to any analysis." },
];

export default function Features() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <div className="max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-widest text-[--color-ink-soft]">Features</p>
        <h1 className="mt-3 font-display text-4xl italic text-[--color-ink] md:text-5xl">
          Everything you need to make sense of a report
        </h1>
        <p className="mt-4 text-lg text-[--color-ink-soft]">
          MedInsight turns a dense medical document into something you can actually read — clearly organized,
          clearly worded, and always paired with a reminder to talk to a clinician about anything that matters.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <Card key={title} className="p-6">
            <Icon className="h-6 w-6 text-[--color-ink]" />
            <p className="mt-4 font-display text-xl italic text-[--color-ink]">{title}</p>
            <p className="mt-2 text-sm text-[--color-ink-soft]">{body}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
