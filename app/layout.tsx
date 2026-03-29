import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Civic Pulse — Smart City & Campus Grievance Portal",
  description:
    "A next-generation platform for citizens and students to report issues, track resolutions, and build better communities in real-time.",
  keywords: ["grievance", "smart city", "campus", "complaint portal", "civic"],
  openGraph: {
    title: "Civic Pulse",
    description: "Smart City & Campus Grievance Portal",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased bg-[#050508] text-slate-100 overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
