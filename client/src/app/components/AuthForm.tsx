"use client";
/* eslint-disable @next/next/no-html-link-for-pages */

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const form = new FormData(event.currentTarget);
    const body = Object.fromEntries(form.entries());
    try {
      const response = await fetch(`${api}/auth/${mode === "login" ? "login" : "register"}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not complete sign in.");
      localStorage.setItem("tatag-token", result.token);
      router.push(result.user.role === "officer" ? "/officer" : result.user.role === "vendor" ? "/dashboard" : "/directory");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not reach the API. Check that the server is running."); }
    finally { setBusy(false); }
  }
  return <main className="auth-page"><a className="brand" href="/"><span className="brand-mark">T</span><span>Tatag<span className="brand-light">Marinduque</span></span></a><section className="auth-panel"><div><p className="eyebrow eyebrow-dark">{mode === "login" ? "WELCOME BACK" : "JOIN THE DIRECTORY"} <span className="heading-line" /></p><h1>{mode === "login" ? "Sign in." : "Create an account."}</h1><p>{mode === "login" ? "Continue to your TatagMarinduque account." : "Choose how you will use the marketplace."}</p></div><form className="post-form" onSubmit={submit}>{mode === "register" && <label>Your name<input name="name" required maxLength={120} autoComplete="name" /></label>}<label>Email address<input name="email" required type="email" maxLength={254} autoComplete="email" /></label><label>Password<input name="password" required type="password" minLength={mode === "register" ? 10 : 1} autoComplete={mode === "login" ? "current-password" : "new-password"} />{mode === "register" && <small>Use at least 10 characters.</small>}</label>{mode === "register" && <label>Account type<select name="role"><option value="buyer">Buyer</option><option value="vendor">Maker / vendor</option></select></label>}<button className="button button-dark" disabled={busy}>{busy ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"} <span>→</span></button>{error && <p className="inline-message" role="alert">{error}</p>}</form><p className="auth-switch">{mode === "login" ? "New to TatagMarinduque?" : "Already have an account?"} <a href={mode === "login" ? "/register" : "/login"}>{mode === "login" ? "Create an account" : "Sign in"}</a></p><p className="auth-sample">Prototype: API and MongoDB must be running to use accounts.</p></section></main>;
}
