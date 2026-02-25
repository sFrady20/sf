import { cookies } from "next/headers";

const ThemeProvider = async function () {
  const cookieJar = await cookies();
  const theme = cookieJar.get("theme");
};
