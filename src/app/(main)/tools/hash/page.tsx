import { Metadata } from "next";
import { redirect } from "next/navigation";

//the family lives at /tools/hash/[algo], the bare path picks the default
export const metadata: Metadata = {
  title: "Hash Generator - Steven Frady",
};

export default async function () {
  redirect("/tools/hash/sha256");
}
