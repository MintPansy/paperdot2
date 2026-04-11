import type { Metadata } from "next";
import LegalDocument from "@/app/components/legal/LegalDocument";
import { termsDocument } from "@/app/content/terms";

export const metadata: Metadata = {
  title: termsDocument.documentTitle,
  description: "ScholarDot 서비스 이용약관",
};

export default function TermsPage() {
  return <LegalDocument config={termsDocument} />;
}
