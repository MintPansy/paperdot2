import type { Metadata, Viewport } from "next";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";
import { Roboto } from "next/font/google";
import Layout from "./components/layout/Layout";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
  preload: true,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "ScholarDot - 영어 논문을 문장 단위로 번역하고 이해하는 가장 쉬운 방법",
  description:
    "논문, 전공서적, 리포트, 메뉴얼 등 다양한 영어 문서를 원문과 한글 번역을 문장 단위로 병렬 표시해 더 쉽고 빠르게 이해하세요.",
  icons: {
    icon: "/minilogo.png",
    shortcut: "/minilogo.png",
    apple: "/minilogo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={roboto.className}>
      <body className="min-h-screen bg-[#F8FAFC] antialiased">
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}