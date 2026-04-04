/**
 * 데모(로그인 없이 체험) 세션은 새로고침 후에도 유지하기 위해 localStorage에 표시합니다.
 * 실제 OAuth 로그인 성공 시 반드시 clearDemoSession()으로 제거합니다.
 */

export const SESSION_MODE_KEY = "scholardot-session-mode";
export const DEMO_MODE_VALUE = "demo";
const DEMO_PROFILE_KEY = "scholardot-demo-profile";

export type DemoProfile = {
  userId: string;
  profileImageUrl: string;
  nickname: string;
  email?: string;
};

const DEFAULT_DEMO_PROFILE: DemoProfile = {
  userId: "demo-user",
  profileImageUrl: "/userImage.svg",
  nickname: "데모유저",
  email: "demo@example.com",
};

export function isDemoSessionClient(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(SESSION_MODE_KEY) === DEMO_MODE_VALUE;
}

export function readDemoProfileClient(): DemoProfile {
  if (typeof window === "undefined") return DEFAULT_DEMO_PROFILE;
  try {
    const raw = localStorage.getItem(DEMO_PROFILE_KEY);
    if (!raw) return DEFAULT_DEMO_PROFILE;
    const p = JSON.parse(raw) as Partial<DemoProfile>;
    return {
      ...DEFAULT_DEMO_PROFILE,
      ...p,
      userId: p.userId ?? DEFAULT_DEMO_PROFILE.userId,
    };
  } catch {
    return DEFAULT_DEMO_PROFILE;
  }
}

export function persistDemoSession(profile: DemoProfile = DEFAULT_DEMO_PROFILE): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_MODE_KEY, DEMO_MODE_VALUE);
  localStorage.setItem(DEMO_PROFILE_KEY, JSON.stringify(profile));
}

export function clearDemoSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_MODE_KEY);
  localStorage.removeItem(DEMO_PROFILE_KEY);
}

/** 데모 진입 시 실제 문서 세션 값이 섞이지 않도록 비웁니다. */
export function clearStoredDocumentSessionForDemo(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem("documentId");
  localStorage.removeItem("documentId");
  sessionStorage.removeItem("translationPairs");
  localStorage.removeItem("translationPairs");
  sessionStorage.removeItem("pdfFileData");
  sessionStorage.setItem("fileName", "sample_test.pdf");
  localStorage.setItem("fileName", "sample_test.pdf");
}
