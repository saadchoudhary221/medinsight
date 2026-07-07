import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[--color-paper] px-6 text-center">
      <p className="font-display text-7xl italic text-[--color-ink]">404</p>
      <p className="mt-4 text-lg text-[--color-ink-soft]">This page doesn't exist, or it's moved.</p>
      <Link to="/" className="mt-8">
        <Button>Back to home</Button>
      </Link>
    </div>
  );
}
