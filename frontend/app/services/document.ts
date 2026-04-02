import { EventSourcePolyfill } from "event-source-polyfill";
import { getApiUrl } from "@/app/config/env";

export const postDocuments = async (
  formData: FormData,
  accessToken?: string
) => {
  try {
    const headers: HeadersInit = {};
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const response = await fetch(`${getApiUrl()}/documents`, {
      method: "POST",
      headers,
      body: formData,
      credentials: "include",
    });

    console.log("response", response);

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error("인증이 필요합니다. 로그인해주세요.");
      }
      throw new Error("파일 업로드에 실패했습니다!");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error((error as Error).message || "파일 업로드에 실패했습니다!");
  }
};

// 백엔드 API에서 이미 추출되고 번역된 문서 단위들을 가져오는 함수
export interface TranslatedDocumentUnit {
  docUnitId: number;
  sourceText: string;
  translatedText: string;
  sourcePage?: number;
}

export const getTranslatedDocument = async (
  documentId: string | number,
  accessToken?: string
): Promise<TranslatedDocumentUnit[]> => {
  try {
    const apiUrl = getApiUrl();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const url = `${apiUrl}/api/v1/documents/${documentId}/translation-pairs`;

    const response = await fetch(url, {
      method: "GET",
      headers,
      credentials: "include",
    });

    // HTML 응답 감지 (인증 실패 시 로그인 페이지 반환)
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("text/html")) {
      throw new Error("인증이 필요합니다. 로그인해주세요.");
    }

    if (!response.ok) {
      // 404는 아직 번역이 완료되지 않았을 수 있으므로 특별 처리
      if (response.status === 404) {
        return []; // 빈 배열 반환 (폴링 로직에서 계속 시도)
      }
      if (response.status === 401 || response.status === 403) {
        throw new Error("인증이 필요합니다. 로그인해주세요.");
      }
      throw new Error("번역된 문서를 가져오는데 실패했습니다!");
    }

    const data: TranslatedDocumentUnit[] = await response.json();
    return data;
  } catch (error) {
    // 네트워크 오류나 기타 에러는 그대로 throw
    // 404는 빈 배열로 처리하기 위해 에러를 다시 throw하지 않음
    if ((error as Error).message.includes("404")) {
      return [];
    }
    throw new Error(
      (error as Error).message || "번역된 문서를 가져오는데 실패했습니다!"
    );
  }
};

export const requestLLM = async (file: File, accessToken?: string) => {
  try {
    const headers: HeadersInit = {};
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const response = await fetch(
      `${getApiUrl()}/api/llm/chat-pdf`,
      {
        method: "POST",
        headers,
        body: file,
        credentials: "include",
      }
    );

    const text = await response.text();

    // HTML 응답 감지 (인증 실패 시 로그인 페이지 반환)
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("text/html")) {
      throw new Error("인증이 필요합니다. 로그인해주세요.");
    }

    if (!response.ok) {
      console.error("[requestLLM] 실패:", response.status, text);
      throw new Error(
        `LLM 요청 실패 (${response.status}): ${text.slice(0, 200)}`
      );
    }

    if (!text) {
      console.warn("[requestLLM] 응답 본문 없음");
      return { data: "" };
    }

    try {
      const data = JSON.parse(text);
      console.log("[requestLLM] 성공:", data);
      return data;
    } catch {
      // JSON이 아니면 텍스트 그대로 반환
      console.log("[requestLLM] 성공(텍스트):", text);
      return { data: text };
    }
  } catch (error) {
    throw new Error((error as Error).message || "LLM 요청에 실패했습니다.");
  }
};

/** 폴링용: 번역 상태 1회 조회. 상태 API가 없으면 404 시 { state: "PENDING" } 반환 */
export interface TranslationStatusPollResult {
  state: string; // STARTED | COMPLETED | FAILED | NO_CONTENT | PENDING
  translated?: number;
  total?: number;
  message?: string;
}

export const getTranslationStatusPoll = async (
  documentId: string | number,
  accessToken?: string
): Promise<TranslationStatusPollResult> => {
  const apiUrl = getApiUrl();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const response = await fetch(
    `${apiUrl}/api/v1/documents/${documentId}/translation-status`,
    { method: "GET", headers, credentials: "include" }
  );

  if (response.status === 404) {
    return { state: "PENDING" };
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("text/html")) {
    throw new Error("인증이 필요합니다. 로그인해주세요.");
  }

  if (!response.ok) {
    throw new Error("번역 상태 조회에 실패했습니다.");
  }

  const data = await response.json();
  return {
    state: (data.state ?? "PENDING").toUpperCase(),
    translated: data.translated,
    total: data.total,
    message: data.message,
  };
};

export const getTranslationStatus = (
  documentId: string | number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- reserved for future auth header
  accessToken: string
) => {
  const apiUrl = getApiUrl();
  const url = `${apiUrl}/api/v1/documents/${documentId}/translation-events`;

  return new EventSourcePolyfill(url);
};

export const postTranslation = async (
  documentId: string,
  accessToken?: string
) => {
  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const response = await fetch(
      `${getApiUrl()}/api/v1/documents/${documentId}/process?overwrite=false`,
      {
        method: "POST",
        headers,
        credentials: "include",
      }
    );

    // HTML 응답 감지 (인증 실패 시 로그인 페이지 반환)
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("text/html")) {
      throw new Error("인증이 필요합니다. 로그인해주세요.");
    }

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error("인증이 필요합니다. 로그인해주세요.");
      }
      throw new Error("번역 요청에 실패했습니다!");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error((error as Error).message || "번역 요청에 실패했습니다!");
  }
};

// 번역 결과 조회 (getTranslatedDocument의 별칭)
export const getTranslation = async (
  documentId: string | number,
  accessToken?: string
): Promise<TranslatedDocumentUnit[]> => {
  return getTranslatedDocument(documentId, accessToken);
};

// 문서 상세 정보 가져오기
export interface DocumentDetail {
  documentId: number;
  fileId: number;
  title: string;
  originalFilename: string;
  storagePath: string;
  fileType: string;
  status: string;
  mimeType: string;
  fileSizeBytes: number;
  languageSrc: string;
  languageTgt: string;
  createdAt: string;
  updatedAt: string;
}
