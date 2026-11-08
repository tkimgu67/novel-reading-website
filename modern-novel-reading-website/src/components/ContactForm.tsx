"use client";

import { useActionState, useEffect, useRef } from "react";
import { Loader2, Send } from "lucide-react";
import { contactAction, type FormState } from "@/lib/actions";

export default function ContactForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(contactAction, undefined);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);
  return (
    <form ref={ref} action={action} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <input name="name" required placeholder="Your name" className="input" />
        <input name="email" type="email" required placeholder="Email address" className="input" />
      </div>
      <select name="subject" className="input" defaultValue="General enquiry">
        <option>General enquiry</option>
        <option>Story suggestion</option>
        <option>Report an issue</option>
        <option>Partnership</option>
      </select>
      <textarea name="message" required rows={6} placeholder="How can we help?" className="input resize-y" />
      {state?.error && <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{state.error}</p>}
      {state?.ok && <p className="rounded-xl border border-sea/30 bg-sea/10 px-4 py-3 text-sm text-mint">{state.ok}</p>}
      <button disabled={pending} className="btn-primary justify-self-start">
        {pending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />} Send message
      </button>
    </form>
  );
}
