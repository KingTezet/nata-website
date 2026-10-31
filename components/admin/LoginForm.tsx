"use client";

import { useActionState } from "react";
import { loginAction, type ActionState } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";
import { ErrorText, Field, inputBase } from "@/components/ui/Form";

export function LoginForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(loginAction, {});
  return (
    <form action={action} className="space-y-5">
      <Field id="password" label="Password admin" required>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputBase}
          aria-invalid={state.error ? true : undefined}
          aria-describedby={state.error ? "login-error" : undefined}
        />
      </Field>
      {state.error && <ErrorText id="login-error">{state.error}</ErrorText>}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Memeriksa…" : "Masuk"}
      </Button>
    </form>
  );
}
