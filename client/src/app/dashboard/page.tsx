"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
type Vendor = { _id: string; owner: string; name: string; town: string; category: "Food" | "Crafts"; description: string; capacity: string; contactPhone: string; contactEmail: string; certifications: string[]; verificationStatus: string };
type Product = { _id: string; name: string; description: string; unit: string; images: string[] };
type Quote = { _id: string; product: string; quantity: number; neededBy: string; destination: string; status: string; notes?: string; reply?: string; buyer?: { name: string; email: string } };

export default function DashboardPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const headers = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${token}` });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const savedToken = localStorage.getItem("tatag-token");
      if (!savedToken) { setMessage("Sign in with your maker account to manage your details."); return; }
      setToken(savedToken);
      try {
        const meResponse = await fetch(`${api}/auth/me`, { headers: { Authorization: `Bearer ${savedToken}` } });
        const me = await meResponse.json();
        if (!meResponse.ok || me.user?.role !== "vendor") throw new Error("Sign in with a maker account to open this page.");
        const [vendorResponse, quoteResponse] = await Promise.all([
          fetch(`${api}/vendors`),
          fetch(`${api}/quotes`, { headers: { Authorization: `Bearer ${savedToken}` } }),
        ]);
        const vendorRows = await vendorResponse.json();
        const quoteRows = await quoteResponse.json();
        const currentVendor = vendorRows.find((row: Vendor) => String(row.owner) === me.user.id) || null;
        if (cancelled) return;
        setVendor(currentVendor);
        setQuotes(Array.isArray(quoteRows) ? quoteRows : []);
        if (currentVendor) {
          const productResponse = await fetch(`${api}/products?vendor=${currentVendor._id}`);
          const productRows = await productResponse.json();
          if (!cancelled) setProducts(Array.isArray(productRows) ? productRows : []);
        }
      } catch (error) { if (!cancelled) setMessage(error instanceof Error ? error.message : "Could not load your maker details."); }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    const form = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      const response = await fetch(`${api}/vendors`, { method: vendor ? "PUT" : "POST", headers: headers(), body: JSON.stringify({ ...form, certifications: String(form.certifications || "").split(",").map((item) => item.trim()).filter(Boolean) }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save your profile.");
      setVendor(result); setMessage("Profile saved. Your verification status is pending review.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not save your profile. Check the API connection."); }
    finally { setBusy(false); }
  }

  async function addProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    const currentForm = event.currentTarget;
    const form = Object.fromEntries(new FormData(currentForm).entries());
    const imageUrl = String(form.image || "");
    try {
      const response = await fetch(`${api}/products`, { method: "POST", headers: headers(), body: JSON.stringify({ name: form.name, description: form.description, unit: form.unit, priceTiers: [], images: imageUrl ? [imageUrl] : [] }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not add this product.");
      setProducts((current) => [...current, result]); currentForm.reset(); setMessage("Product added.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not add this product."); }
    finally { setBusy(false); }
  }

  async function removeProduct(id: string) {
    try {
      const response = await fetch(`${api}/products/${id}`, { method: "DELETE", headers: headers() });
      if (!response.ok) throw new Error("Could not remove this product.");
      setProducts((current) => current.filter((product) => product._id !== id)); setMessage("Product removed.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not remove this product."); }
  }

  async function replyToQuote(quote: Quote, status: "replied" | "accepted" | "declined") {
    const reply = window.prompt("Write a short reply to the buyer:", quote.reply || "");
    if (reply === null) return;
    const response = await fetch(`${api}/quotes/${quote._id}`, { method: "PATCH", headers: headers(), body: JSON.stringify({ status, reply }) });
    const result = await response.json();
    if (!response.ok) { setMessage(result.error || "Could not update this quote."); return; }
    setQuotes((current) => current.map((item) => item._id === quote._id ? result : item)); setMessage("Quote updated.");
  }

  return <main className="simple-page"><header className="simple-header"><Link className="brand" href="/"><span className="brand-mark">T</span><span>Tatag<span className="brand-light">Marinduque</span></span></Link><nav className="simple-nav"><Link href="/directory">Find makers</Link><button className="sign-out" onClick={() => { localStorage.removeItem("tatag-token"); router.push("/login"); }}>Sign out</button></nav></header><section className="dashboard-page"><div className="dashboard-heading"><div><p className="eyebrow eyebrow-dark">MAKER DASHBOARD <span className="heading-line" /></p><h1>Your work,<br /><em>all in one place.</em></h1></div>{vendor && <span className={vendor.verificationStatus === "verified" ? "verified-badge" : "pending-badge"}>{vendor.verificationStatus === "verified" ? "DTI verified" : `Status: ${vendor.verificationStatus}`}</span>}</div>{message.startsWith("Sign in") && <div className="dashboard-notice" role="status">{message} <Link href="/login">Sign in</Link></div>}{message && !message.startsWith("Sign in") && <p className="inline-message dashboard-message" role="status">{message}</p>}<div className="dashboard-grid"><section className="dashboard-panel"><div className="dashboard-panel-title"><span>01</span><h2>Your maker profile</h2></div><form key={vendor?._id || "new-profile"} className="post-form dashboard-form" onSubmit={saveProfile}><label>Maker or cooperative name<input name="name" required maxLength={120} defaultValue={vendor?.name || ""} /></label><div className="form-two"><label>Town<input name="town" required defaultValue={vendor?.town || ""} /></label><label>Category<select name="category" defaultValue={vendor?.category || "Food"}><option>Food</option><option>Crafts</option></select></label></div><label>What do you make?<textarea name="description" required rows={3} maxLength={1200} defaultValue={vendor?.description || ""} /></label><label>How much can you make?<input name="capacity" placeholder="For example, 40 boxes a week" defaultValue={vendor?.capacity || ""} /></label><div className="form-two"><label>Phone<input name="contactPhone" type="tel" defaultValue={vendor?.contactPhone || ""} /></label><label>Email<input name="contactEmail" type="email" defaultValue={vendor?.contactEmail || ""} /></label></div><label>Certifications<input name="certifications" placeholder="Separate items with commas" defaultValue={vendor?.certifications?.join(", ") || ""} /></label><button className="button button-dark" disabled={busy}>{busy ? "Saving..." : "Save profile"} <span>→</span></button></form></section><section className="dashboard-panel"><div className="dashboard-panel-title"><span>02</span><h2>Your products</h2><span className="panel-count">{products.length}</span></div>{products.length === 0 && <p className="dashboard-empty">Add your first product below. Save your profile first.</p>}<div className="dashboard-products">{products.map((product) => <article className="dashboard-product" key={product._id}><div><strong>{product.name}</strong><span>{product.description || product.unit}</span></div><button onClick={() => removeProduct(product._id)} aria-label={`Remove ${product.name}`}>Remove</button></article>)}</div><form className="post-form add-product-form" onSubmit={addProduct}><label>Product name<input name="name" required maxLength={120} placeholder="What do you sell?" /></label><div className="form-two"><label>Unit<input name="unit" required placeholder="box, piece, bottle" /></label><label>Image link<input name="image" type="url" placeholder="Optional photo URL" /></label></div><label>Short description<textarea name="description" rows={2} placeholder="What should buyers know?" /></label><button className="button" disabled={busy}>Add product <span>+</span></button><p className="dashboard-help">Image upload is not available in this prototype. Use a public image URL.</p></form></section><section className="dashboard-panel dashboard-quotes"><div className="dashboard-panel-title"><span>03</span><h2>Quote requests</h2><span className="panel-count">{quotes.length}</span></div>{quotes.length === 0 ? <p className="dashboard-empty">No requests yet. Verified makers can receive buyer enquiries.</p> : quotes.map((quote) => <article className="quote-row" key={quote._id}><div><strong>{quote.product} · {quote.quantity}</strong><span>{quote.buyer?.name || "Buyer"} · Needed by {new Date(quote.neededBy).toLocaleDateString()}</span><span>Deliver to {quote.destination}</span>{quote.notes && <span>{quote.notes}</span>}</div><div className="quote-row-actions"><span className="quote-status">{quote.status}</span><button onClick={() => replyToQuote(quote, "replied")}>Reply</button><button onClick={() => replyToQuote(quote, "accepted")}>Accept</button><button onClick={() => replyToQuote(quote, "declined")}>Decline</button></div></article>)}</section></div></section><footer className="footer"><Link className="brand footer-brand" href="/"><span className="brand-mark">T</span><span>Tatag<span className="brand-light">Marinduque</span></span></Link><span>Prototype · Sample data only</span></footer></main>;
}
