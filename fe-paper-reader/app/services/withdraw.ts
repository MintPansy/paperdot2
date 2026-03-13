import { getApiUrl } from "@/app/config/env";

export const withdraw = async (socialType: string, accessToken: string) => {
  const response = await fetch(
    `${getApiUrl()}/auth/withdraw/${socialType}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("회원 탈퇴에 실패했습니다.");
  }

  return response;
};
