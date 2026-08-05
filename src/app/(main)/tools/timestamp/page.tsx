import { Metadata } from "next";
import { ToolShell } from "../shell";
import { ToolProse } from "../ui";
import { TimestampTool } from "./components";

export const metadata: Metadata = {
  title: "Unix Timestamp Converter - Steven Frady",
  description:
    "Free online unix timestamp converter. Convert epoch seconds, milliseconds, or microseconds to human dates and back — with a live current timestamp.",
  keywords:
    "unix timestamp converter, epoch converter, timestamp to date, date to timestamp, current unix time, epoch time",
  alternates: { canonical: "https://www.stevenfrady.com/tools/timestamp" },
};

export default async function () {
  return (
    <ToolShell>
      <TimestampTool />

      <ToolProse>
        <h2>About unix time</h2>
        <p>
          Unix time counts seconds since 00:00:00 UTC on January 1, 1970,
          ignoring leap seconds. It&apos;s the standard way computers store
          moments in time because it&apos;s a single number — easy to compare,
          sort, and do math on — with the timezone applied only when a human
          needs to read it.
        </p>
        <p>
          Different systems use different precision: ten digits is seconds,
          thirteen is milliseconds (what JavaScript&apos;s{" "}
          <code>Date.now()</code> returns), sixteen is microseconds. This tool
          detects the unit from the number of digits and tells you which one it
          assumed.
        </p>
        <p>
          The famous &ldquo;year 2038 problem&rdquo; only affects systems that
          store unix time as a signed 32-bit integer, which overflows on January
          19, 2038. Anything using 64-bit time — including JavaScript — is fine
          for the next few hundred billion years.
        </p>
      </ToolProse>
    </ToolShell>
  );
}
