import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "mom — AI Content Manager",
  description:
    "Upload once. Your AI marketing assistant turns it into a complete, ready-to-post content plan.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
