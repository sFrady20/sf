import { redirect } from "next/navigation";
import { textTransforms } from "./transforms";

export default function () {
  redirect(`/tools/text/${textTransforms[0].slug}`);
}
