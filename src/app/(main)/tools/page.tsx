import { Metadata } from "next";
import { ToolsIndex } from "./components";

export const metadata: Metadata = {
  title: "Free Developer Tools - Steven Frady",
  description:
    "Free online tools for developers and designers — text case converters, JSON formatting, image conversion and resizing, icon set generation, password and UUID generators, and more.",
  keywords:
    "developer tools, online tools, text converter, image converter, password generator, uuid generator, icon generator",
  alternates: { canonical: "https://www.stevenfrady.com/tools" },
};

export default async function () {
  return (
    <div className="flex-1 container py-[100px] md:pt-[132px]">
      <ToolsIndex />
    </div>
  );
}
