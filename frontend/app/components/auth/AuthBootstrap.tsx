"use client";

import { useEffect } from "react";
import { getApiUrl } from "@/app/config/env";
import { useAccessTokenStore, useLoginStore } from "@/app/store/useLogin";
import {
  clearDemoSession,
  isDemoSessionClient,
  readDemoProfileClient,
} from "@/lib/authSession";

/**
 * Header가 없는 라우트(/read 등)에서도 쿠키·데모 세션을 복원합니다.
 * Layout에 한 번 두고, 완료 후 authHydrated를 켭니다.
 */
export default function AuthBootstrap() {
  useEffect(() => {
    if (useLoginStore.getState().authHydrated) return;

    const setAccessToken = useAccessTokenStore.getState().setAccessToken;
    const { setUserInfo, setLogin, setAuthHydrated } = useLoginStore.getState();

    const finish = () => {
      setAuthHydrated(true);
    };

    if (typeof window === "undefined") {
      finish();
      return;
    }

    let cancelled = false;

    if (isDemoSessionClient()) {
      setAccessToken(null);
      setUserInfo(readDemoProfileClient());
      setLogin(true);
      finish();
      return;
    }

    (async () => {
      try {
        const response = await fetch(`${getApiUrl()}/auth/token`, {
          method: "POST",
          credentials: "include",
        });
        const data = await response.json().catch(() => ({}));
        if (cancelled) return;
        if (response.ok && data?.accessToken) {
          clearDemoSession();
          setAccessToken(data.accessToken);
          const me = await fetch(`${getApiUrl()}/users/me`, {
            method: "GET",
            headers: { Authorization: `Bearer ${data.accessToken}` },
            credentials: "include",
          });
          if (cancelled) return;
          if (me.ok) {
            const u = await me.json();
            setUserInfo(u);
            setLogin(true);
          } else {
            setAccessToken(null);
            setUserInfo(null);
            setLogin(false);
          }
        } else {
          setAccessToken(null);
          setUserInfo(null);
          setLogin(false);
        }
      } catch {
        if (!cancelled) {
          setAccessToken(null);
          setUserInfo(null);
          setLogin(false);
        }
      } finally {
        if (!cancelled) finish();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
