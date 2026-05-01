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
      let detail = "";
      try {
        const errBody = await response.json();
        const msg =
          errBody?.message ??
          errBody?.error ??
          (typeof errBody === "string" ? errBody : null);
        if (msg && typeof msg === "string") detail = ` (${msg})`;
      } catch {
        /* ignore */
      }
      throw new Error(`파일 업로드에 실패했습니다.${detail}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    const msg = (error as Error).message || "";
    if (
      msg === "Failed to fetch" ||
      (error instanceof TypeError && msg.includes("fetch"))
    ) {
      throw new Error(
        `서버에 연결할 수 없습니다. 백엔드가 실행 중인지, NEXT_PUBLIC_API_URL(${getApiUrl()}) 설정을 확인해 주세요.`
      );
    }
    throw new Error(msg || "파일 업로드에 실패했습니다!");
  }
};

// 백엔드 API에서 이미 추출되고 번역된 문서 단위들을 가져오는 함수
export interface TranslatedDocumentUnit {
  docUnitId: number;
  sourceText: string;
  translatedText: string;
  sourcePage?: number;
}

function normalizeTranslatedUnit(raw: unknown): TranslatedDocumentUnit | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const docUnitIdValue = obj.docUnitId ?? obj.id ?? obj.unitId;
  const docUnitId = Number(docUnitIdValue);
  if (!Number.isFinite(docUnitId)) return null;

  const sourceText = String(
    obj.sourceText ?? obj.source ?? obj.originalText ?? obj.original ?? ""
  );
  const translatedText = String(
    obj.translatedText ??
      obj.translation ??
      obj.translated ??
      obj.result ??
      obj.targetText ??
      ""
  );
  const sourcePageRaw = obj.sourcePage ?? obj.page ?? obj.pageNumber;
  const sourcePage = Number(sourcePageRaw);

  return {
    docUnitId,
    sourceText,
    translatedText,
    sourcePage: Number.isFinite(sourcePage) ? sourcePage : undefined,
  };
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

    const raw = await response.json();
    // 백엔드가 배열 직접 반환 | { data: [...] } | { content: [...] } 형태 모두 처리
    const dataRaw: unknown[] = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.data)
      ? raw.data
      : Array.isArray(raw?.content)
      ? raw.content
      : [];
    return dataRaw
      .map((item) => normalizeTranslatedUnit(item))
      .filter((item): item is TranslatedDocumentUnit => item != null);
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

/** 백엔드 파이프라인 진행률(상태 카운트). 부분 완료·실패 감지에 사용 */
export interface TranslationProgressPayload {
  total: number;
  translated: number;
  translating: number;
  created: number;
  failed: number;
}

/** GET /api/v1/documents/{id}/structure-analysis */
export interface PageStructureStats {
  pageNumber: number;
  sentenceCount: number;
  paragraphCount: number;
  mathCount: number;
  imageCount: number;
}

export interface DocumentComplexityScore {
  score: number;
  averageParagraphLength: number;
  mathContribution: number;
  imageContribution: number;
  lengthContribution: number;
}

export interface DocumentStructureAnalysis {
  pageCount: number;
  sentenceCount: number;
  paragraphCount: number;
  mathCount: number;
  imageCount: number;
  pages: PageStructureStats[];
  complexity?: DocumentComplexityScore;
}

export const getDocumentStructureAnalysis = async (
  documentId: string | number,
  accessToken?: string
): Promise<DocumentStructureAnalysis> => {
  const apiUrl = getApiUrl();
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const response = await fetch(
    `${apiUrl}/api/v1/documents/${documentId}/structure-analysis`,
    { method: "GET", headers, credentials: "include" }
  );

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("text/html")) {
    throw new Error("인증이 필요합니다. 로그인해주세요.");
  }

  if (!response.ok) {
    throw new Error("문서 구조 분석을 불러오지 못했습니다.");
  }

  return response.json() as Promise<DocumentStructureAnalysis>;
};

export const getTranslationProgress = async (
  documentId: string | number,
  accessToken?: string
): Promise<TranslationProgressPayload | null> => {
  const apiUrl = getApiUrl();
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const response = await fetch(
    `${apiUrl}/api/v1/documents/${documentId}/translation-progress`,
    { method: "GET", headers, credentials: "include" }
  );

  if (response.status === 404) {
    return null;
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("text/html")) {
    throw new Error("인증이 필요합니다. 로그인해주세요.");
  }

  if (!response.ok) {
    throw new Error("번역 진행 상태를 가져오지 못했습니다.");
  }

  const data = await response.json();
  return {
    total: Number(data.total) || 0,
    translated: Number(data.translated) || 0,
    translating: Number(data.translating) || 0,
    created: Number(data.created) || 0,
    failed: Number(data.failed) || 0,
  };
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

// ---------------------------------------------------------------------------
// 문서 API 클라이언트 (typed fetch + ApiError) — app/api/document.ts 통합본
// ---------------------------------------------------------------------------

const API_BASE_URL = getApiUrl();

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public response?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function getErrorMessageForStatus(statusCode: number): string {
  switch (statusCode) {
    case 400:
      return "잘못된 요청입니다. 입력값을 확인해주세요.";
    case 401:
      return "인증이 필요합니다. 로그인해주세요.";
    case 403:
      return "접근 권한이 없습니다.";
    case 404:
      return "요청한 리소스를 찾을 수 없습니다.";
    case 409:
      return "이미 존재하는 리소스입니다.";
    case 413:
      return "파일 크기가 너무 큽니다.";
    case 415:
      return "지원하지 않는 파일 형식입니다.";
    case 422:
      return "처리할 수 없는 요청입니다.";
    case 429:
      return "요청 횟수가 초과되었습니다. 잠시 후 다시 시도해주세요.";
    case 500:
      return "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
    case 502:
      return "서버에 연결할 수 없습니다.";
    case 503:
      return "서비스가 일시적으로 사용할 수 없습니다.";
    default:
      return `오류가 발생했습니다. (${statusCode})`;
  }
}

async function handleDocumentResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("text/html")) {
    throw new ApiError("인증이 필요합니다. 로그인해주세요.", 401);
  }

  if (!response.ok) {
    let errorMessage = "알 수 없는 오류가 발생했습니다.";
    let errorData: unknown = null;

    try {
      errorData = await response.json();
      const ed = errorData as { message?: string; error?: string };
      errorMessage = ed.message || ed.error || errorMessage;
    } catch {
      errorMessage = getErrorMessageForStatus(response.status);
    }

    throw new ApiError(errorMessage, response.status, errorData);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}

function buildJsonAuthHeaders(accessToken?: string): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }
  return headers;
}

export interface UploadDocumentRequest {
  ownerId: number | string;
  title: string;
  languageSrc: string;
  languageTgt: string;
  file: File;
}

export interface UploadDocumentResponse {
  documentId: number;
  fileId: number;
  storagePath: string;
  fileType: "ORIGINAL_PDF" | "TRANSLATED_PDF";
  status: "UPLOADED" | "TRANSLATING" | "TRANSLATED" | "FAILED";
  originalFilename: string;
  mimeType: string;
  fileSizeBytes: number;
}

export interface DocumentListItem {
  documentId: number;
  title: string;
  languageSrc: string;
  languageTgt: string;
  totalPages: number;
  lastTranslatedAt: string;
}

export interface ProcessDocumentRequest {
  documentId: number | string;
  overwrite?: boolean;
}

export type NoteType = "HIGHLIGHT" | "MEMO";

export interface UserDocNoteItem {
  id: number;
  docUnitId: number;
  noteType: NoteType;
  content: string | null;
  color: string | null;
  createdAt: string;
}

export interface CreateNoteRequest {
  docUnitId: number;
  noteType: NoteType;
  content?: string | null;
  color?: string | null;
}

/**
 * POST /documents — 타입이 고정된 업로드 (lib/api 등에서 사용)
 */
export async function uploadDocument(
  request: UploadDocumentRequest,
  accessToken?: string
): Promise<UploadDocumentResponse> {
  const formData = new FormData();
  formData.append("ownerId", String(request.ownerId));
  formData.append("title", request.title);
  formData.append("languageSrc", request.languageSrc);
  formData.append("languageTgt", request.languageTgt);
  formData.append("file", request.file);

  const headers: HeadersInit = {};
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}/documents`, {
    method: "POST",
    headers,
    body: formData,
    credentials: "include",
  });

  return handleDocumentResponse<UploadDocumentResponse>(response);
}

/**
 * 번역 쌍 조회 — getTranslatedDocument 와 동일(404 시 빈 배열).
 */
export async function getTranslatedDocumentUnits(
  documentId: string | number,
  accessToken?: string
): Promise<TranslatedDocumentUnit[]> {
  return getTranslatedDocument(documentId, accessToken);
}

/**
 * 파이프라인 실행 (overwrite 옵션)
 */
export async function processDocument(
  request: ProcessDocumentRequest,
  accessToken?: string
): Promise<void> {
  const params = new URLSearchParams();
  if (request.overwrite) {
    params.append("overwrite", "true");
  }

  const queryString = params.toString();
  const url = `${API_BASE_URL}/api/v1/documents/${request.documentId}/process${
    queryString ? `?${queryString}` : ""
  }`;

  const headers: HeadersInit = {};
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    credentials: "include",
  });

  await handleDocumentResponse<void>(response);
}

export async function getDocumentList(
  ownerId: number | string
): Promise<DocumentListItem[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/documents/translation-histories?ownerId=${ownerId}`,
    {
      method: "GET",
      credentials: "include",
    }
  );
  return handleDocumentResponse<DocumentListItem[]>(response);
}

export async function getNotes(
  documentId: number | string,
  accessToken?: string
): Promise<UserDocNoteItem[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/documents/${documentId}/notes`,
    {
      method: "GET",
      headers: buildJsonAuthHeaders(accessToken),
      credentials: "include",
    }
  );
  return handleDocumentResponse<UserDocNoteItem[]>(response);
}

export async function createNote(
  documentId: number | string,
  body: CreateNoteRequest,
  accessToken?: string
): Promise<UserDocNoteItem> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/documents/${documentId}/notes`,
    {
      method: "POST",
      headers: buildJsonAuthHeaders(accessToken),
      credentials: "include",
      body: JSON.stringify(body),
    }
  );
  return handleDocumentResponse<UserDocNoteItem>(response);
}

export async function updateNote(
  documentId: number | string,
  noteId: number,
  body: Partial<CreateNoteRequest>,
  accessToken?: string
): Promise<UserDocNoteItem> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/documents/${documentId}/notes/${noteId}`,
    {
      method: "PUT",
      headers: buildJsonAuthHeaders(accessToken),
      credentials: "include",
      body: JSON.stringify(body),
    }
  );
  return handleDocumentResponse<UserDocNoteItem>(response);
}

export async function deleteDocument(
  documentId: number | string,
  accessToken?: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/documents/${documentId}`,
    {
      method: "DELETE",
      headers: buildJsonAuthHeaders(accessToken),
      credentials: "include",
    }
  );
  if (response.status !== 204) {
    await handleDocumentResponse<unknown>(response);
  }
}

export async function deleteNote(
  documentId: number | string,
  noteId: number,
  accessToken?: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/documents/${documentId}/notes/${noteId}`,
    {
      method: "DELETE",
      headers: buildJsonAuthHeaders(accessToken),
      credentials: "include",
    }
  );
  if (response.status !== 204) {
    await handleDocumentResponse<unknown>(response);
  }
}
