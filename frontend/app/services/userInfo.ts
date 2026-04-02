export const getUserInfo = async () => {
  try {
    const response = await fetch("/api/users", { credentials: "include" });
    const data = await response.json();
    if (!response.ok) {
      throw new Error("사용자 정보 조회에 실패했습니다!");
    }
    return data;
  } catch (error) {
    throw new Error(
      (error as Error).message || "사용자 정보 조회에 실패했습니다!"
    );
  }
};
