import { Suspense } from "react";
import { QuoteForm } from "../../components/QuoteForm";

export default function QuotePage({ params }: { params: Promise<{ vendorId: string }> }) {
  return <Suspense fallback={<main className="simple-page"><section className="quote-page"><p>Loading quote form...</p></section></main>}><QuotePageContent params={params} /></Suspense>;
}

async function QuotePageContent({ params }: { params: Promise<{ vendorId: string }> }) {
  const { vendorId } = await params;
  return <QuoteForm vendorId={vendorId} />;
}
