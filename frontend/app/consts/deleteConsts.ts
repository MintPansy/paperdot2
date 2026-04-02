type DeleteReasonOption = {
  value: string;
  label: string;
};

export const DELETE_REASON_OPTIONS: DeleteReasonOption[] = [
  { value: "service_not_needed", label: "더 이상 사용할 일이 없어서" },
  {
    value: "privacy_concern",
    label: "필요한 기능이 없어서(하이라이트, 단어장 등)",
  },
  { value: "too_many_ads", label: "다른 서비스(번역기, ai)를 사용해서" },
  { value: "quality_not_good", label: "번역 품질이 기대에 미치지 못해서" },
  { value: "etc", label: "기타(직접입력)" },
];
