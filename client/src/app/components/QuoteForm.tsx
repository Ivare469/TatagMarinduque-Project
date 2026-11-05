"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
const sampleVendorIds: Record<string, string> = {
  "sample-maker-01": "650000000000000000000001",
  "sample-maker-02": "650000000000000000000002",
  "sample-maker-03": "650000000000000000000003",
  "sample-maker-04": "650000000000000000000004",
};

export function QuoteForm({ vendorId }: { vendorId: string }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const currentForm = event.currentTarget;
    const token = localStorage.getItem("tatag-token");
    if (!token) { setMessage("Sign in with a buyer account before sending a quote request."); return; }
    const form = new FormData(currentForm);
    setBusy(true); setMessage("");
    try {
      const response = await fetch(`${api}/quotes`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ vendor: sampleVendorIds[vendorId] || vendorId, product: form.get("product"), quantity: form.get("quantity"), neededBy: form.get("neededBy"), destination: form.get("destination"), notes: form.get("notes") }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Your request could not be sent.");
      setMessage("Quote request sent. You can check its status in your account.");
      currentForm.reset();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not reach the API. Check that the server is running."); }
    finally { setBusy(false); }
  }
  return <main className="simple-page"><header className="simple-header"><Link className="brand" href="/"><span className="brand-mark">T</span><span>Tatag<span className="brand-light">Marinduque</span></span></Link><Link className="simple-back" href="/directory">Back to makers <span>↗</span></Link></header><section className="quote-page"><div><p className="eyebrow eyebrow-dark">WHOLESALE ENQUIRY <span className="heading-line" /></p><h1>Start a<br /><em>conversation.</em></h1><p>Send your order details to the maker. Only verified makers can receive quote requests.</p><div className="quote-note">You will need a buyer account. Your account email is used for replies.</div></div><form className="post-form quote-page-form" onSubmit={submit}><label>Product<input name="product" required placeholder="What would you like to order?" /></label><label>Quantity<input name="quantity" required type="number" min="1" placeholder="Number of units" /></label><label>Needed by<input name="neededBy" required type="date" /></label><label>Delivery destination<input name="destination" required placeholder="Town or delivery address" /></label><label className="form-wide">Order details<textarea name="notes" rows={4} placeholder="Anything else the maker should know?" /></label><button className="button button-dark" type="submit" disabled={busy}>{busy ? "Sending..." : "Send quote request"} <span>→</span></button>{message && <p className="inline-message" role="status">{message} {message.startsWith("Sign in") && <Link href="/login">Sign in</Link>}</p>}</form></section><footer className="footer"><Link className="brand footer-brand" href="/"><span className="brand-mark">T</span><span>Tatag<span className="brand-light">Marinduque</span></span></Link><span>Prototype · Sample data only</span></footer></main>;
}
