"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
type Vendor = { _id: string; name: string; town: string; category: string; description: string; capacity?: string; contactPhone?: string; contactEmail?: string; certifications: string[]; verificationStatus: string };

export default function OfficerPage() {
  const router = useRouter();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");
  useEffect(() => {
    let cancelled = false;
    async function load() {
      const savedToken = localStorage.getItem("tatag-token");
      if (!savedToken) { setMessage("Sign in with an officer account to review maker profiles."); setLoading(false); return; }
      setToken(savedToken);
      try {
        const [meResponse, vendorResponse] = await Promise.all([
          fetch(`${api}/auth/me`, { headers: { Authorization: `Bearer ${savedToken}` } }),
          fetch(`${api}/vendors`),
        ]);
        const me = await meResponse.json();
        const rows = await vendorResponse.json();
        if (!meResponse.ok || me.user?.role !== "officer") throw new Error("This page is for officer accounts only.");
        if (!cancelled) setVendors(Array.isArray(rows) ? rows.filter((item: Vendor) => item.verificationStatus === "pending") : []);
      } catch (error) { if (!cancelled) setMessage(error instanceof Error ? error.message : "Could not load the review queue."); }
      finally { if (!cancelled) setLoading(false); }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  async function review(vendor: Vendor, status: "verified" | "rejected") {
    const reason = status === "rejected" ? window.prompt("Write a reason for the maker:") : "";
    if (status === "rejected" && reason === null) return;
    const response = await fetch(`${api}/vendors/${vendor._id}/verify`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ status, reason }) });
    const result = await response.json();
    if (!response.ok) { setMessage(result.error || "Could not update this review."); return; }
    setVendors((current) => current.filter((item) => item._id !== vendor._id));
    setMessage(`${vendor.name} marked ${status}.`);
  }

  return <main className="simple-page"><header className="simple-header"><Link className="brand" href="/"><span className="brand-mark">T</span><span>Tatag<span className="brand-light">Marinduque</span></span></Link><nav className="simple-nav"><Link href="/directory">Find makers</Link><button className="sign-out" onClick={() => { localStorage.removeItem("tatag-token"); router.push("/login"); }}>Sign out</button></nav></header><section className="officer-page"><div className="dashboard-heading"><div><p className="eyebrow eyebrow-dark">DTI REVIEW QUEUE <span className="heading-line" /></p><h1>Review maker<br /><em>profiles.</em></h1></div><span className="pending-badge">{vendors.length} pending</span></div>{message && <p className="inline-message" role="status">{message} {message.startsWith("Sign in") && <Link href="/login">Sign in</Link>}</p>}{loading ? <p className="dashboard-empty">Loading review queue...</p> : vendors.length === 0 ? <div className="officer-empty"><span className="success-mark">✓</span><h2>All caught up.</h2><p>No pending sample profiles to review.</p></div> : <div className="officer-queue">{vendors.map((vendor) => <article className="officer-vendor" key={vendor._id}><div className="officer-vendor-heading"><span className="pending-badge">Pending review</span><span>{vendor.category} · {vendor.town}</span></div><h2>{vendor.name}</h2><p>{vendor.description}</p><dl><div><dt>Production capacity</dt><dd>{vendor.capacity || "Not provided"}</dd></div><div><dt>Contact</dt><dd>{vendor.contactPhone || vendor.contactEmail || "Not provided"}</dd></div><div><dt>Certifications</dt><dd>{vendor.certifications?.length ? vendor.certifications.join(", ") : "None listed"}</dd></div></dl><div className="officer-actions"><button className="button button-dark" onClick={() => review(vendor, "verified")}>Mark verified <span>✓</span></button><button className="reject-button" onClick={() => review(vendor, "rejected")}>Reject with a reason</button></div><p className="officer-sample">Review sample data only. Do not treat this as an official DTI decision.</p></article>)}</div>}</section><footer className="footer"><Link className="brand footer-brand" href="/"><span className="brand-mark">T</span><span>Tatag<span className="brand-light">Marinduque</span></span></Link><span>Prototype · Sample data only</span></footer></main>;
}
