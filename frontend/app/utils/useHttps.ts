// HTTP URL을 HTTPS로 변환하는 유틸 함수
export const useHttps = (url: string) => {
  if (!url) return url;
  if (url.startsWith("http://")) {
    return url.replace("http://", "https://");
  }
  return url;
};
