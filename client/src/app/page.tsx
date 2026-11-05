"use client";

import { useMemo, useState } from "react";

type Vendor = {
  name: string;
  town: string;
  category: "Food" | "Crafts";
  description: string;
  product: string;
  capacity: string;
  image: string;
  verified: boolean;
};

const vendors: Vendor[] = [
  {
    name: "Sample Uraro Kitchen",
    town: "Torrijos",
    category: "Food",
    description: "Small-batch arrowroot cookies, baked for sharing and gifting.",
    product: "Uraro cookies",
    capacity: "Up to 120 boxes / week",
    image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=900&q=85",
    verified: true,
  },
  {
    name: "Sample Isla Clay Studio",
    town: "Boac",
    category: "Crafts",
    description: "Hand-thrown everyday pottery shaped from local clay.",
    product: "Handmade pottery",
    capacity: "Up to 45 pieces / month",
    image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=900&q=85",
    verified: true,
  },
  {
    name: "Sample Coconut Grove Co-op",
    town: "Buenavista",
    category: "Food",
    description: "Coconut oil and toasted coconut products made by a local cooperative.",
    product: "Virgin coconut oil",
    capacity: "Up to 80 bottles / week",
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=900&q=85",
    verified: true,
  },
  {
    name: "Sample Habing Marinduque",
    town: "Gasan",
    category: "Crafts",
    description: "Woven home goods made in small runs with natural fibers.",
    product: "Woven baskets",
    capacity: "Up to 30 pieces / month",
    image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3d/Woven_bamboo.jpg/960px-Woven_bamboo.jpg",
    verified: false,
  },
];

const bulletinPosts = [
  { type: "Need", item: "Arrowroot starch", amount: "25 kg", town: "Torrijos", time: "2 hours ago" },
  { type: "Supply", item: "Clean coconut shells", amount: "About 200 pieces", town: "Buenavista", time: "Yesterday" },
  { type: "Need", item: "Pottery clay", amount: "10 sacks", town: "Boac", time: "Yesterday" },
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All makers");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [quoteVendor, setQuoteVendor] = useState<Vendor | null>(null);
  const [quoteSent, setQuoteSent] = useState(false);

  const filteredVendors = useMemo(() => vendors.filter((vendor) => {
    const matchesText = `${vendor.name} ${vendor.town} ${vendor.product} ${vendor.description}`
      .toLowerCase().includes(query.toLowerCase());
    return matchesText
      && (category === "All makers" || vendor.category === category)
      && (!verifiedOnly || vendor.verified);
  }), [category, query, verifiedOnly]);

  function openQuote(vendor: Vendor) {
    setQuoteSent(false);
    setQuoteVendor(vendor);
  }

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#home" aria-label="Tatag Marinduque home">
          <span className="brand-mark">T</span>
          <span>Tatag<span className="brand-light">Marinduque</span></span>
        </a>
        <nav className="desktop-nav" aria-label="Main navigation">
          <a className="nav-active" href="/directory">Find makers</a>
          <a href="/bulletin">Sourcing board</a>
          <a href="/about">About</a>
        </nav>
        <div className="header-actions">
          <a className="sign-in" href="/login">Sign in</a>
          <a className="button button-small button-dark" href="/register">Join as a maker <span aria-hidden="true">↗</span></a>
        </div>
      </header>

      <section className="hero" id="home">
        <div className="hero-texture" aria-hidden="true" />
        <div className="hero-inner">
          <p className="eyebrow"><span className="eyebrow-dot" /> A LOCAL TRADE DIRECTORY</p>
          <h1>Made here.<br /><span>Ready to go further.</span></h1>
          <p className="hero-copy">Meet the makers of Marinduque. Find products, connect with local producers, and build your next order together.</p>
          <form className="hero-search" onSubmit={(event) => { event.preventDefault(); document.querySelector("#directory")?.scrollIntoView({ behavior: "smooth" }); }}>
            <label className="search-icon" htmlFor="maker-search" aria-hidden="true">⌕</label>
            <input id="maker-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try uraro cookies, pottery, or a town" />
            <button type="submit" className="button button-straw">Find makers <span aria-hidden="true">→</span></button>
          </form>
          <div className="hero-meta"><span>FOOD &amp; CRAFT</span><span className="meta-divider" /><span>MADE IN MARINDUQUE</span><span className="meta-divider" /><span>DIRECT CONNECTIONS</span></div>
        </div>
        <div className="hero-image" role="img" aria-label="Freshly baked cookies on a tray" />
        <div className="hero-caption"><span>01 / 04</span><span>THE ISLAND, IN EVERY ORDER</span></div>
        <div className="hero-stamp"><span>LOCAL<br />BY NATURE</span><span className="stamp-star">✳</span></div>
      </section>

      <section className="trust-strip" aria-label="Marketplace details">
        <p><span className="strip-number">01</span> <span>Find island-made goods</span></p>
        <p><span className="strip-number">02</span> <span>Request a wholesale quote</span></p>
        <p><span className="strip-number">03</span> <span>Source materials together</span></p>
        <span className="strip-note">A directory for local trade <span aria-hidden="true">↘</span></span>
      </section>

      <section className="directory-section section-wrap" id="directory">
        <div className="section-heading">
          <div><p className="eyebrow eyebrow-dark">THE MAKER DIRECTORY <span className="heading-line" /></p><h2>Good things start<br />with a <em>connection.</em></h2></div>
          <p className="section-intro">Browse makers across the island. From first order to steady supply, start a conversation directly.</p>
        </div>
        <div className="directory-tools">
          <div className="filter-tabs" role="group" aria-label="Filter by category">
            {["All makers", "Food", "Crafts"].map((item) => <button key={item} className={category === item ? "filter-tab selected" : "filter-tab"} onClick={() => setCategory(item)}>{item}</button>)}
          </div>
          <label className="verified-toggle"><input type="checkbox" checked={verifiedOnly} onChange={(event) => setVerifiedOnly(event.target.checked)} /><span className="toggle-track" /><span>DTI-verified only</span></label>
          <span className="result-count">{filteredVendors.length} makers</span>
        </div>
        <div className="vendor-grid">
          {filteredVendors.map((vendor, index) => <article className="vendor-card" key={vendor.name}>
            <a href={`#maker-${index}`} className="vendor-image-link" aria-label={`View ${vendor.name}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="vendor-image" src={vendor.image} alt={`${vendor.product} made in ${vendor.town}`} />
              <span className="card-index">0{index + 1}</span>
            </a>
            <div className="vendor-card-body">
              <div className="vendor-topline"><span>{vendor.category.toUpperCase()} <span className="town-dot">·</span> {vendor.town.toUpperCase()}</span><span className={vendor.verified ? "verified-badge" : "pending-badge"}>{vendor.verified ? "Verified" : "Pending"}</span></div>
              <h3>{vendor.name}</h3>
              <p>{vendor.description}</p>
              <div className="product-line"><span className="product-dot" />{vendor.product}<span className="capacity">{vendor.capacity}</span></div>
              <button className="card-action" onClick={() => openQuote(vendor)}>Request a quote <span aria-hidden="true">↗</span></button>
            </div>
          </article>)}
        </div>
        {filteredVendors.length === 0 && <div className="empty-state"><strong>No makers found.</strong><span>Try another product, town, or category.</span></div>}
        <div className="sample-note"><span className="sample-note-dot" /> Prototype directory · All makers and products shown are sample data</div>
      </section>

      <section className="bulletin-section" id="bulletin">
        <div className="bulletin-inner section-wrap">
          <div className="bulletin-title"><p className="eyebrow eyebrow-light">THE SOURCING BOARD <span className="heading-line" /></p><h2>Better sourcing<br />starts <em>nearby.</em></h2><p>Share what you need or what you have. Build a stronger local supply chain, one connection at a time.</p><a className="button button-outline" href="#post">Post a need or supply <span aria-hidden="true">↗</span></a></div>
          <div className="bulletin-list">
            <div className="bulletin-list-head"><span>LATEST FROM THE ISLAND</span><span>03 POSTS</span></div>
            {bulletinPosts.map((post, index) => <article className="bulletin-row" key={post.item}>
              <span className="bulletin-number">0{index + 1}</span><div className="bulletin-post-type"><span className={post.type === "Need" ? "type-need" : "type-supply"}>{post.type}</span><span>{post.time}</span></div>
              <div className="bulletin-post-name"><h3>{post.item}</h3><span>{post.amount}</span></div>
              <div className="bulletin-location"><span className="location-mark" aria-hidden="true">⌖</span>{post.town}</div>
              <button className="bulletin-arrow" aria-label={`View ${post.item} post`} onClick={() => alert("Bulletin posts are sample data in this prototype.")}>↗</button>
            </article>)}
            <p className="bulletin-sample">Example posts · Sample data</p>
          </div>
        </div>
        <div className="bulletin-orbit orbit-one" aria-hidden="true" /><div className="bulletin-orbit orbit-two" aria-hidden="true" />
      </section>

      <section className="closing-section section-wrap" id="about">
        <div className="closing-tag">TATAG MARINDUQUE <span>·</span> MADE TO MOVE TOGETHER</div>
        <p>Every order helps a local enterprise<br />reach <em>one step further.</em></p>
        <a className="text-link" href="#directory">Explore the directory <span aria-hidden="true">→</span></a>
      </section>

      <footer className="footer" id="join"><a className="brand footer-brand" href="#home"><span className="brand-mark">T</span><span>Tatag<span className="brand-light">Marinduque</span></span></a><span>Local enterprise, connected.</span><span>Prototype · Sample data only</span></footer>

      {quoteVendor && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setQuoteVendor(null); }}>
        <section className="quote-modal" role="dialog" aria-modal="true" aria-labelledby="quote-title">
          <button className="modal-close" aria-label="Close quote form" onClick={() => setQuoteVendor(null)}>×</button>
          {quoteSent ? <div className="quote-success"><span className="success-mark">✓</span><p className="eyebrow eyebrow-dark">REQUEST READY</p><h2>Your request is noted.</h2><p>This prototype does not send or store quote requests yet. The form is ready to connect to the API.</p><button className="button button-dark" onClick={() => setQuoteVendor(null)}>Done</button></div> : <>
            <p className="eyebrow eyebrow-dark">WHOLESALE ENQUIRY <span className="heading-line" /></p><h2 id="quote-title">Request a quote</h2><p className="modal-vendor">For <strong>{quoteVendor.name}</strong> · {quoteVendor.product}</p>
            <form className="quote-form" onSubmit={(event) => { event.preventDefault(); setQuoteSent(true); }}>
              <label>Quantity<input required type="number" min="1" placeholder="How many?" /></label>
              <label>Needed by<input required type="date" /></label>
              <label>Delivery destination<input required placeholder="Town or delivery address" /></label>
              <label>Contact email<input required type="email" placeholder="you@example.com" /></label>
              <label className="form-wide">Anything else the maker should know?<textarea rows={3} placeholder="Add details about your order" /></label>
              <button className="button button-dark form-wide" type="submit">Send quote request <span aria-hidden="true">→</span></button>
              <p className="form-note form-wide">Sample prototype only. No personal details will be saved or sent.</p>
            </form>
          </>}
        </section>
      </div>}
    </main>
  );
}
