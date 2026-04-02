/**
 * 프론트엔드 API 클라이언트 정의
 * - 번역, PDF 업로드, 텍스트 추출 등 공통 시그니처 및 타입
 * - 실제 백엔드/Next.js API Routes 연동은 여기서 일원화
 */

// ==================== 번역 ====================

export interface TranslateSentencesOptions {
  sourceLang?: string;
  targetLang?: string;
}

export interface TranslationPair {
  sourceText: string;
  translatedText: string;
}

export interface TranslateSentencesResult {
  pairs: TranslationPair[];
}

/**
 * 문장 배열을 외부 LLM(번역 API)으로 번역한 결과를 반환합니다.
 * 내부적으로 app/api/translate Route를 호출합니다.
 */
export async function translateSentences(
  sentences: string[],
  options?: TranslateSentencesOptions
): Promise<TranslateSentencesResult> {
  const res = await fetch("/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sentences,
      sourceLang: options?.sourceLang ?? "en",
      targetLang: options?.targetLang ?? "ko",
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? "번역 요청 실패");
  }
  return res.json();
}

// ==================== PDF 업로드 ====================

export interface UploadPdfOptions {
  title?: string;
  sourceLang?: string;
  targetLang?: string;
  ownerId?: number | string;
  accessToken?: string;
}

export interface UploadPdfResult {
  documentId: number;
  fileId: number;
  storagePath: string;
  status: string;
  originalFilename: string;
  mimeType: string;
  fileSizeBytes: number;
}

/**
 * PDF 파일을 업로드하고 문서 메타데이터를 반환합니다.
 * 기존 백엔드 POST /documents 또는 app/api/upload 연동
 */
export async function uploadPdf(
  file: File,
  options?: UploadPdfOptions
): Promise<UploadPdfResult> {
  const { uploadDocument } = await import("@/app/api/document");
  const ownerId = options?.ownerId ?? 0;
  const title = (options?.title ?? file.name.replace(/\.pdf$/i, "")) || "제목 없음";
  const result = await uploadDocument(
    {
      ownerId,
      title,
      languageSrc: options?.sourceLang ?? "en",
      languageTgt: options?.targetLang ?? "ko",
      file,
    },
    options?.accessToken
  );
  return {
    documentId: result.documentId,
    fileId: result.fileId,
    storagePath: result.storagePath,
    status: result.status,
    originalFilename: result.originalFilename,
    mimeType: result.mimeType,
    fileSizeBytes: result.fileSizeBytes,
  };
}

// ==================== 텍스트 추출 (골격) ====================

export interface ExtractTextResult {
  text: string;
  pageCount?: number;
}

/**
 * 문서 ID에 해당하는 PDF에서 텍스트를 추출합니다.
 * 백엔드 또는 app/api/extract 연동 예정.
 */
export async function extractText(
  _documentId: string,
  _accessToken?: string
): Promise<ExtractTextResult> {
  await Promise.resolve();
  throw new Error("extractText is not implemented yet");
}
