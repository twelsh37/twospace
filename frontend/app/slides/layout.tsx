// frontend/app/slides/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI-Driven Development Showcase | Asset Management System",
  description:
    "A comprehensive showcase of how generative AI transformed the development of a complete asset management system using Cursor IDE and modern web technologies.",
  keywords:
    "AI development, generative AI, Cursor IDE, Next.js, TypeScript, asset management, software development",
  openGraph: {
    title: "AI-Driven Development Showcase",
    description:
      "See how AI transformed software development with a complete asset management system",
    type: "website",
  },
};

export default function SlidesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="slides-layout">{children}</div>;
}
