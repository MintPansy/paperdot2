import type { Metadata } from "next";
import LegalDocument from "@/app/components/legal/LegalDocument";
import { privacyDocument } from "@/app/content/privacy";

export const metadata: Metadata = {
  title: privacyDocument.documentTitle,
  description: "ScholarDot 개인정보 처리방침",
};

export default function PrivacyPage() {
  return <LegalDocument config={privacyDocument} />;
}
