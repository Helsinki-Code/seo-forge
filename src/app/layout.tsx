import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Fira_Code, Fira_Sans, Figtree } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const figtree = Figtree({subsets:['latin'],variable:'--font-sans'});

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const firaSans = Fira_Sans({
  variable: "--font-fira-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "SEO Forge — Autonomous SEO Mission Control",
  description:
    "An autonomous team of AI agents that reviews your website, tracks SERPs and rankings, optimizes content, and ships changes through human-approved deploys.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://seoforge.online"),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={cn("dark", "h-full", "antialiased", firaCode.variable, firaSans.variable, "font-sans", figtree.variable)}
    >
      <body className="min-h-full flex flex-col">
        <ClerkProvider>{children}</ClerkProvider>
      </body>
    </html>
  );
}
