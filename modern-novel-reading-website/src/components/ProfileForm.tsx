"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { updateProfileAction, type FormState } from "@/lib/actions";

export default function ProfileForm({ name }: { name: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateProfileAction, undefined);
  return (
    <form action={action} className="grid gap-3">
      <label className="text-sm text-mist" htmlFor="name">Display name</label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input id="name" name="name" defaultValue={name} required minLength={2} className="input" />
        <button disabled={pending} className="btn-primary shrink-0">
          {pending && <Loader2 size={16} className="animate-spin" />} Save
        </button>
      </div>
      {state?.error && <p className="text-sm text-red-300">{state.error}</p>}
      {state?.ok && <p className="text-sm text-mint">{state.ok}</p>}
    </form>
  );
}
