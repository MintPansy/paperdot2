import { create } from "zustand";

export type UserInfoState = {
  userId?: string;
  profileImageUrl: string;
  nickname: string;
  email?: string;
};

interface LoginState {
  login: boolean;
  userInfo: UserInfoState | null;
  /** 앱 최초 클라이언트에서 세션(데모/쿠키 토큰) 복원 완료 여부 */
  authHydrated: boolean;

  setLogin: (login: boolean) => void;
  setUserInfo: (userInfo: UserInfoState | null) => void;
  setAuthHydrated: (hydrated: boolean) => void;
}

export const useLoginStore = create<LoginState>((set) => ({
  login: false,
  userInfo: null,
  authHydrated: false,
  setUserInfo: (userInfo) => set({ userInfo }),
  setLogin: (login) => set({ login }),
  setAuthHydrated: (authHydrated) => set({ authHydrated }),
}));

interface AccessTokenState {
  accessToken: string | null;
  setAccessToken: (accessToken: string | null) => void;
}
export const useAccessTokenStore = create<AccessTokenState>((set) => ({
  accessToken: null,
  setAccessToken: (accessToken: string | null) => set({ accessToken }),
}));
