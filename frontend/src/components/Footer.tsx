import { Link } from "react-router-dom";
import { SocialLinks } from "@/components/SocialLinks";

export function Footer() {
  return (
    <footer className="border-t border-[--color-hairline] bg-[--color-paper]">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div>
            <p className="font-display text-xl italic text-[--color-ink]">MedInsight</p>
            <p className="mt-3 max-w-xs text-sm text-[--color-ink-soft]">
              An independent tool for turning medical reports into plain-language summaries.
              Informational only — not a substitute for professional medical advice.
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-[--color-ink]">Quick links</p>
            <ul className="mt-3 space-y-2 text-sm text-[--color-ink-soft]">
              <li><Link to="/" className="hover:text-[--color-ink]">Home</Link></li>
              <li><Link to="/features" className="hover:text-[--color-ink]">Features</Link></li>
              <li><Link to="/about" className="hover:text-[--color-ink]">About</Link></li>
              <li><Link to="/contact" className="hover:text-[--color-ink]">Contact</Link></li>
            </ul>
          </div>

          <div className="md:text-right">
            <p className="text-sm font-medium text-[--color-ink]">Designed and Developed by Muhammad Saad.</p>
            <div className="mt-3 md:flex md:justify-end">
              <SocialLinks />
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-[--color-hairline] pt-6">
          <p className="text-xs leading-relaxed text-[--color-ink-soft]">
            This platform is intended for informational and educational purposes only. It does not provide
            medical diagnosis or replace professional healthcare advice. MedInsight is an independent project
            with no affiliation with any hospital or clinic.
          </p>
          <p className="mt-3 text-xs text-[--color-ink-soft]">© 2026 Muhammad Saad. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
