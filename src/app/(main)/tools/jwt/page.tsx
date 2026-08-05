import { Metadata } from "next";
import { ToolShell } from "../shell";
import { ToolProse } from "../ui";
import { JwtTool } from "./components";

export const metadata: Metadata = {
  title: "JWT Decoder - Steven Frady",
  description:
    "Free online JWT decoder. Inspect a JSON Web Token's header and claims entirely in your browser — the token is never sent to a server.",
  keywords:
    "jwt decoder, decode jwt online, json web token decoder, jwt claims, inspect jwt, jwt debugger",
  alternates: { canonical: "https://www.stevenfrady.com/tools/jwt" },
};

export default async function () {
  return (
    <ToolShell>
      <JwtTool />

      <ToolProse>
        <h2>About JSON Web Tokens</h2>
        <p>
          A JWT is three base64url-encoded sections joined by dots: a header
          naming the signing algorithm, a payload of claims (who the token is
          for, when it expires), and a signature over the first two. The content
          isn&apos;t encrypted — anyone holding a token can read it, which is
          exactly what this tool does.
        </p>
        <p>
          What the signature adds is tamper-proofing: without the signing key,
          nobody can alter claims and produce a valid signature. That&apos;s
          also why this tool doesn&apos;t verify — verification needs the key,
          and a secret key should never be pasted into a website.
        </p>
        <p>
          Decoding happens entirely in your browser. The token never leaves the
          page — worth knowing, because a real token pasted into the wrong
          online decoder is a leaked credential.
        </p>
      </ToolProse>
    </ToolShell>
  );
}
