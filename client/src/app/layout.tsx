import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TatagMarinduque | Local enterprise, connected",
  description: "Discover Marinduque's local makers, request wholesale quotes, and connect through a local sourcing board.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
