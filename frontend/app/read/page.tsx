import { Suspense } from "react";
import Read from "@/app/components/read/Read";

export const dynamic = "force-dynamic";

function ReadPageContent() {
  return <Read />;
}

export default function ReadPage() {
  return (
    <Suspense fallback={<div style={{ padding: "20px" }}>로딩 중...</div>}>
      <ReadPageContent />
    </Suspense>
  );
}
