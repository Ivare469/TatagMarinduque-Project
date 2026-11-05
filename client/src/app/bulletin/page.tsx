"use client";
/* eslint-disable @next/next/no-html-link-for-pages */

import { useMemo, useState } from "react";

type Post = { type: "Need" | "Supply"; material: string; amount: string; town: string; time: string };
const initialPosts: Post[] = [
  { type: "Need", material: "Arrowroot starch", amount: "25 kg", town: "Torrijos", time: "2 hours ago" },
  { type: "Supply", material: "Clean coconut shells", amount: "About 200 pieces", town: "Buenavista", time: "Yesterday" },
  { type: "Need", material: "Pottery clay", amount: "10 sacks", town: "Boac", time: "Yesterday" },
];

export default function BulletinPage() {
  const [posts, setPosts] = useState(initialPosts);
  const [filter, setFilter] = useState("All posts");
  const [message, setMessage] = useState("");
  const filtered = useMemo(() => posts.filter((post) => filter === "All posts" || post.type === filter), [filter, posts]);
  function addPost(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPosts([{ type: form.get("type") as Post["type"], material: String(form.get("material")), amount: String(form.get("amount")), town: String(form.get("town")), time: "Just now" }, ...posts]);
    setMessage("Added for this preview. This sample post is not saved to the server.");
    event.currentTarget.reset();
  }
  return <main className="simple-page"><header className="simple-header"><a className="brand" href="/"><span className="brand-mark">T</span><span>Tatag<span className="brand-light">Marinduque</span></span></a><nav className="simple-nav"><a href="/directory">Find makers</a><a href="/about">About</a></nav></header><section className="bulletin-page"><div className="bulletin-page-heading"><div><p className="eyebrow eyebrow-dark">THE SOURCING BOARD <span className="heading-line" /></p><h1>Find what you need.<br /><em>Share what you have.</em></h1><p>Connect with local producers and suppliers for the materials behind island-made goods.</p></div><div className="bulletin-decoration" aria-hidden="true">M<br />↗</div></div><div className="bulletin-page-layout"><section className="bulletin-feed"><div className="bulletin-page-filters" role="group" aria-label="Filter posts">{["All posts", "Need", "Supply"].map((item) => <button key={item} className={filter === item ? "filter-tab selected" : "filter-tab"} onClick={() => setFilter(item)}>{item}</button>)}<span>{filtered.length} posts</span></div>{filtered.map((post, index) => <article className="feed-post" key={`${post.material}-${index}`}><div className="feed-post-type"><span className={post.type === "Need" ? "type-need" : "type-supply"}>{post.type}</span><span>{post.time}</span></div><div><h2>{post.material}</h2><p>{post.amount}</p></div><span className="feed-town">⌖ {post.town}</span><button className="feed-contact" onClick={() => setMessage("Contact details are not available for sample posts.")} aria-label={`Contact poster for ${post.material}`}>↗</button></article>)}{filtered.length === 0 && <div className="empty-state"><strong>No posts in this view.</strong><span>Try another filter.</span></div>}<p className="sample-note"><span className="sample-note-dot" /> Sample posts are for demonstration only.</p></section><aside className="post-form-wrap" id="post"><p className="eyebrow eyebrow-dark">ADD TO THE BOARD <span className="heading-line" /></p><h2>Post a need<br />or a supply.</h2><form className="post-form" onSubmit={addPost}><label>What are you posting?<select name="type"><option>Need</option><option>Supply</option></select></label><label>Material<input required name="material" placeholder="For example, arrowroot starch" /></label><label>Amount<input required name="amount" placeholder="How much is needed or available?" /></label><label>Town<input required name="town" placeholder="Where are you based?" /></label><button className="button button-dark" type="submit">Add sample post <span>→</span></button><p>Preview only. Sign-in and server storage are not connected here.</p>{message && <div className="inline-message" role="status">{message}</div>}</form></aside></div></section><footer className="footer"><a className="brand footer-brand" href="/"><span className="brand-mark">T</span><span>Tatag<span className="brand-light">Marinduque</span></span></a><span>Prototype · Sample data only</span></footer></main>;
}
