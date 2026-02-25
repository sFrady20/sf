"use server";

import { cookies } from "next/headers";

export const setColorScheme = async function (colorScheme: string) {
  const cookieJar = await cookies();
  cookieJar.set("color-scheme", colorScheme);
};
