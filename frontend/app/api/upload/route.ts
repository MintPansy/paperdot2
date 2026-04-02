import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * PDF 업로드 API 골격.
 * 실제 구현 시: multipart/formData 파싱 후 백엔드 POST /documents 전달 또는 직접 스토리지 업로드
 */
export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json(
    { message: "Content-Type must be multipart/form-data" },
    { status: 400 }
    );
  }
  return NextResponse.json(
    { message: "Upload endpoint not implemented; use backend POST /documents or lib/api uploadPdf()" },
    { status: 501 }
  );
}
