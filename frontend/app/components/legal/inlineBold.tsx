/**
 * `**강조**` 패턴을 <strong>으로 렌더링 (마크다운 일부만 지원).
 */
export function renderInlineBold(text: string) {
  const parts = text.split(/(\*\*.+?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}
