import "@/globals.css";
import "@/components/analytics";
import { ReactNode } from "react";
import { Metadata } from "next";
import { Viewport } from "next/types";
import { cn } from "@/utils/cn";
import { fonts } from "@/utils/fonts";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Steven Frady - Creative Full-Stack Developer",
  description:
    "I am a developer with over 10 years of experience, specializing in web and mobile development. My work is focused on creating user-centric solutions, with a commitment to continuous learning and innovation in the tech field.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#171717" },
    { media: "(prefers-color-scheme: light)", color: "#c4c1c0" },
  ],
};

export default async function App(props: { children?: ReactNode }) {
  const { children } = props;

  const cookieJar = await cookies();
  const colorScheme = cookieJar.get("color-scheme");

  return (
    <html lang="en">
      <body
        className={cn(
          fonts.display.variable,
          fonts.title.variable,
          fonts.body.variable,
          "bg-background text-foreground font-body selection:bg-foreground selection:text-background flex flex-col min-h-svh",
          colorScheme?.value || "dark",
        )}
      >
        {children}
      </body>
    </html>
  );
}
