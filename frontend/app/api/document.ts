/**
 * 문서 관련 API 모듈
 * 백엔드 Swagger: getApiUrl() + /swagger-ui/index.html
 */

import { getApiUrl } from "@/app/config/env";

const API_BASE_URL = getApiUrl();

/**
 * API 에러 타입
 */
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

/**
 * API 응답 에러 처리 헬퍼 함수
 */
async function handleResponse<T>(response: Response): Promise<T> {
  // HTML 응답 감지 (인증 실패 시 로그인 페이지 반환되는 경우)
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("text/html")) {
    throw new ApiError("인증이 필요합니다. 로그인해주세요.", 401);
  }

  if (!response.ok) {
    let errorMessage = "알 수 없는 오류가 발생했습니다.";
    let errorData = null;

    try {
      errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      // JSON 파싱 실패 시 기본 메시지 사용
      errorMessage = getErrorMessage(response.status);
    }

    throw new ApiError(errorMessage, response.status, errorData);
  }

  // 204 No Content 등의 경우 빈 응답 처리
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

/**
 * HTTP 상태 코드에 따른 에러 메시지 반환
 */
function getErrorMessage(statusCode: number): string {
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

/**
 * 인증 헤더 생성
 */
function getAuthHeaders(accessToken?: string): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  return headers;
}

// ==================== 타입 정의 ====================

/**
 * 문서 업로드 요청 파라미터
 */
export interface UploadDocumentRequest {
  ownerId: number | string;
  title: string;
  languageSrc: string;
  languageTgt: string;
  file: File;
}

/**
 * 문서 업로드 응답
 */
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

/**
 * 번역된 문서 단위
 */
export interface TranslatedDocumentUnit {
  docUnitId: number;
  sourceText: string;
  translatedText: string;
  sourcePage?: number;
}

/**
 * 문서 상세 정보
 */
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

/**
 * 문서 목록 항목
 */
export interface DocumentListItem {
  documentId: number;
  title: string;
  languageSrc: string;
  languageTgt: string;
  totalPages: number;
  lastTranslatedAt: string;
}

/**
 * 문서 처리(번역) 요청 파라미터
 */
export interface ProcessDocumentRequest {
  documentId: number | string;
  overwrite?: boolean;
}

// ==================== API 함수 ====================

/**
 * 문서 업로드
 * POST /documents
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

  return handleResponse<UploadDocumentResponse>(response);
}

export async function getTranslatedDocumentUnits(
  documentId: number | string,
  accessToken?: string
): Promise<TranslatedDocumentUnit[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/documents/${documentId}/translation-pairs`,
    {
      method: "GET",
      headers: getAuthHeaders(accessToken),
      credentials: "include",
    }
  );

  return handleResponse<TranslatedDocumentUnit[]>(response);
}

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

  await handleResponse<void>(response);
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
  return handleResponse<DocumentListItem[]>(response);
}

// ==================== 메모/하이라이트 API ====================

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

export async function getNotes(
  documentId: number | string,
  accessToken?: string
): Promise<UserDocNoteItem[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/documents/${documentId}/notes`,
    {
      method: "GET",
      headers: getAuthHeaders(accessToken),
      credentials: "include",
    }
  );
  return handleResponse<UserDocNoteItem[]>(response);
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
      headers: getAuthHeaders(accessToken),
      credentials: "include",
      body: JSON.stringify(body),
    }
  );
  return handleResponse<UserDocNoteItem>(response);
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
      headers: getAuthHeaders(accessToken),
      credentials: "include",
      body: JSON.stringify(body),
    }
  );
  return handleResponse<UserDocNoteItem>(response);
}

export async function deleteDocument(
  documentId: number | string,
  accessToken?: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/documents/${documentId}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(accessToken),
      credentials: "include",
    }
  );
  if (response.status !== 204) await handleResponse<unknown>(response);
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
      headers: getAuthHeaders(accessToken),
      credentials: "include",
    }
  );
  if (response.status !== 204) await handleResponse<unknown>(response);
}
