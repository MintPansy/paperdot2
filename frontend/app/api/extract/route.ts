import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * PDF 텍스트 추출 API 골격.
 * 실제 구현 시: documentId 또는 file 받아서 추출 후 { text, pageCount } 반환
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({})) as { documentId?: string };
    if (!body.documentId) {
      return NextResponse.json(
        { message: "documentId is required" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Extract endpoint not implemented yet", text: "", pageCount: 0 },
      { status: 501 }
    );
  } catch {
    return NextResponse.json({ message: "Bad request" }, { status: 400 });
  }
}
