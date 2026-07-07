import { Github, Linkedin, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { label: "GitHub", href: "https://github.com/saadchoudhary221", icon: Github },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/muhammad-saad-2b96bb334/", icon: Linkedin },
  {
    label: "Fiverr",
    href: "https://www.fiverr.com/saadchoudhar829",
    icon: (props: { className?: string }) => (
      <svg viewBox="0 0 24 24" fill="currentColor" className={props.className} aria-hidden="true">
        <path d="M23.004 12.223c0-.554-.449-1.002-1.002-1.002h-2.605V9.554c0-1.107.554-1.634 1.634-1.634h.25c.554 0 1.002-.448 1.002-1.001V5.575c0-.5-.37-.92-.865-.99a8.096 8.096 0 0 0-1.146-.08c-2.68 0-4.096 1.634-4.096 4.517v1.199h-1.31a1.002 1.002 0 0 0-1.002 1.002v1.634c0 .553.449 1.002 1.002 1.002h1.31v6.512c0 .553.448 1.002 1.001 1.002h2.219a1.002 1.002 0 0 0 1.002-1.002v-6.512h2.16c.5 0 .924-.372.992-.867l.226-1.634a.83.83 0 0 0 .01-.126ZM10.348 9.618H4.997a1.002 1.002 0 0 0-1.002 1.002v1.634c0 .553.449 1.002 1.002 1.002h.611v5.446a1.002 1.002 0 0 0 1.002 1.002h2.219a1.002 1.002 0 0 0 1.002-1.002v-5.446h.517a1.002 1.002 0 0 0 1.002-1.002V10.62a1.002 1.002 0 0 0-1.002-1.002ZM7.363 8.278c1.1 0 1.992-.865 1.992-1.933 0-1.067-.891-1.932-1.992-1.932-1.1 0-1.991.865-1.991 1.932 0 1.068.89 1.933 1.991 1.933Z" />
      </svg>
    ),
  },
  { label: "Email", href: "mailto:choudharysaad52@gmail.com", icon: Mail },
];

export function SocialLinks({ className, iconClassName }: { className?: string; iconClassName?: string }) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {LINKS.map(({ label, href, icon: Icon }) => (
        <a
          key={label}
          href={href}
          target={href.startsWith("mailto:") ? undefined : "_blank"}
          rel="noreferrer"
          title={label}
          aria-label={label}
          className="group relative flex h-9 w-9 items-center justify-center rounded-full text-[--color-ink-soft] transition-colors hover:bg-[--color-ink]/5 hover:text-[--color-ink]"
        >
          <Icon className={cn("h-4 w-4", iconClassName)} />
        </a>
      ))}
    </div>
  );
}
