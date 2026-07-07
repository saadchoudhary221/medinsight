import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, ShieldCheck, Sparkles, Clock, UploadCloud, ScanSearch, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const FEATURES = [
  {
    icon: FileText,
    title: "Plain-language summaries",
    body: "Dense lab reports rewritten into a few clear sentences anyone can follow.",
  },
  {
    icon: ShieldCheck,
    title: "Private by default",
    body: "Reports are tied to your account only. Nobody else can see what you upload.",
  },
  {
    icon: Sparkles,
    title: "Structured findings",
    body: "Every value is organized into a clean table with a normal, borderline, or attention status.",
  },
  {
    icon: Clock,
    title: "Ready in seconds",
    body: "Upload a PDF or photo of your report and get a readable breakdown almost immediately.",
  },
];

const STEPS = [
  { icon: UploadCloud, title: "Upload Report", body: "Drop in a PDF or a photo of your lab report." },
  { icon: ScanSearch, title: "Review Analysis", body: "We read the report and organize every value." },
  { icon: Lightbulb, title: "Understand Key Findings", body: "See a plain-language summary and next steps." },
];

export default function Landing() {
  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-20 pt-16 md:pt-24">
        <div className="grid items-center gap-14 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <p className="mb-4 text-xs font-medium uppercase tracking-widest text-[--color-ink-soft]">
              Strictly informational. Not a medical diagnosis.
            </p>
            <h1 className="font-display text-5xl italic leading-tight text-[--color-ink] md:text-6xl">
              Understand Your Medical Reports with Confidence
            </h1>
            <p className="mt-6 max-w-lg text-lg text-[--color-ink-soft]">
              Upload your medical reports and receive clear, easy-to-understand health insights in seconds.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link to="/signup">
                <Button size="lg">Upload Report</Button>
              </Link>
              <Link to="/features">
                <Button size="lg" variant="outline">Learn More</Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
            className="relative"
          >
            <div className="rounded-3xl border border-[--color-hairline] bg-white p-8 shadow-sm">
              <div className="flex items-center justify-between border-b border-[--color-hairline] pb-4">
                <p className="font-display text-lg italic">Basic Metabolic Panel</p>
                <span className="rounded-full bg-[--color-status-normal-bg] px-3 py-1 text-xs font-medium text-[--color-status-normal]">
                  Completed
                </span>
              </div>
              <div className="mt-4 space-y-3">
                {[
                  ["Glucose", "94 mg/dL", "normal"],
                  ["Potassium", "5.4 mmol/L", "borderline"],
                  ["Sodium", "140 mmol/L", "normal"],
                ].map(([test, value, status]) => (
                  <div key={test} className="flex items-center justify-between text-sm">
                    <span className="text-[--color-ink-soft]">{test}</span>
                    <span className="text-[--color-ink]">{value}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        status === "normal"
                          ? "bg-[--color-status-normal-bg] text-[--color-status-normal]"
                          : "bg-[--color-status-borderline-bg] text-[--color-status-borderline]"
                      }`}
                    >
                      {status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -right-4 -top-4 h-24 w-24 -z-10 rounded-full bg-[--color-ink]/5 blur-2xl" />
          </motion.div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <Card key={title} className="p-6">
              <Icon className="h-6 w-6 text-[--color-ink]" />
              <p className="mt-4 font-display text-xl italic text-[--color-ink]">{title}</p>
              <p className="mt-2 text-sm text-[--color-ink-soft]">{body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-[--color-hairline] bg-white/60 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-center font-display text-3xl italic text-[--color-ink]">How It Works</p>
          <div className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, body }, i) => (
              <div key={title} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[--color-hairline] bg-[--color-paper]">
                  <Icon className="h-6 w-6 text-[--color-ink]" />
                </div>
                <p className="mt-4 text-xs font-medium uppercase tracking-widest text-[--color-ink-soft]">
                  Step {i + 1}
                </p>
                <p className="mt-1 font-display text-xl italic text-[--color-ink]">{title}</p>
                <p className="mt-2 text-sm text-[--color-ink-soft]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <p className="font-display text-3xl italic text-[--color-ink]">Ready to make sense of your report?</p>
        <div className="mt-8">
          <Link to="/signup">
            <Button size="lg">Get started</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
