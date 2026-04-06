import type { Metadata } from "next";
import "./globals.css";
import TopNav from "@/components/TopNav";

export const metadata: Metadata = {
  title: "Fete — London Venue Directory",
  description: "Find and book stunning venues for large-scale private events in London",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-base">
        <TopNav />
        <div className="pt-14">
          {children}
        </div>
      </body>
    </html>
  );
}
