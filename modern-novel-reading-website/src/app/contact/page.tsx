import type { Metadata } from "next";
import { Mail, MessageCircle, Clock } from "lucide-react";
import ContactForm from "@/components/ContactForm";
import { PageHeader } from "@/components/Sections";

export const metadata: Metadata = { title: "Contact Us" };

export default function ContactPage() {
  return (
    <>
      <PageHeader eyebrow="Get in touch" title="Contact Us" subtitle="Questions, feedback or story ideas? We'd love to hear from you." />
      <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div className="space-y-4">
          {[
            { icon: Mail, title: "Email", text: "hello@heynovelworld.com" },
            { icon: MessageCircle, title: "Feedback", text: "Every message is read by our team." },
            { icon: Clock, title: "Response time", text: "Usually within 1–2 business days." },
          ].map((c) => (
            <div key={c.title} className="flex gap-4 rounded-3xl border border-white/5 bg-coal p-5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-sea/15 text-mint"><c.icon size={20} /></span>
              <div>
                <p className="font-semibold">{c.title}</p>
                <p className="text-sm text-mist">{c.text}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-3xl border border-white/5 bg-coal p-6 sm:p-8 lg:col-span-2">
          <ContactForm />
        </div>
      </div>
    </>
  );
}
