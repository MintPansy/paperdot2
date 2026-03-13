import { getApiUrl } from "@/app/config/env";

export const logout = async (accessToken: string) => {
  await fetch(`${getApiUrl()}/auth/logout`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken as string}`,
    },
    credentials: "include",
  });
};
