import { redirect } from "next/navigation";
import { generators } from "./generators";

export default function () {
  redirect(`/tools/generate/${generators[0].slug}`);
}
