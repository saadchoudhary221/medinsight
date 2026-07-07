import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Textarea, Label, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SocialLinks } from "@/components/SocialLinks";
import { useToast } from "@/components/ui/toast";
import { api, ApiError } from "@/lib/api";

const schema = z.object({
  name: z.string().min(1, "Name is required."),
  email: z.string().email("Enter a valid email address."),
  message: z.string().min(1, "Message can't be empty."),
});
type FormValues = z.infer<typeof schema>;

export default function Contact() {
  const { showToast } = useToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    try {
      await api.post("/contact", values);
      showToast("Message sent. Thanks for reaching out!");
      reset();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Couldn't send your message.", "error");
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <p className="text-xs font-medium uppercase tracking-widest text-[--color-ink-soft]">Contact</p>
      <h1 className="mt-3 font-display text-4xl italic text-[--color-ink] md:text-5xl">Get in touch</h1>

      <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[--color-ink] font-display text-xl italic text-[--color-paper]">
              MS
            </div>
            <p className="mt-4 font-display text-2xl italic text-[--color-ink]">Muhammad Saad</p>
            <p className="mt-2 text-sm text-[--color-ink-soft]">
              Full-stack developer focused on building clean, considered software products from idea to deployment.
            </p>
            <div className="mt-5">
              <SocialLinks />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...register("name")} placeholder="Your name" />
                <FieldError>{errors.name?.message}</FieldError>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("email")} placeholder="you@example.com" />
                <FieldError>{errors.email?.message}</FieldError>
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" {...register("message")} placeholder="How can I help?" />
                <FieldError>{errors.message?.message}</FieldError>
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Sending…" : "Send message"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
