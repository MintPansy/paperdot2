interface TargetUser {
  id: string;
  title: string;
  description: string;
  bulletPoints: string[];
  imageSrc: string;
}

interface Step {
  id: number;
  description: React.ReactNode; // string 대신 ReactNode로 변경
}

export const targetUsers: TargetUser[] = [
  {
    id: "student",
    title: "논문을 읽는\n대학생 또는 연구자",
    description: "",
    bulletPoints: [
      "“어디까지 읽었지?” 하며 같은 문장을 반복해서 찾아야 하는 사람",
    ],
    imageSrc: "/mainforth-first.png",
  },
  {
    id: "highschool",
    title: "수능 영어 지문을\n분석하고 싶은 고3",
    description: "",
    bulletPoints: [
      "긴 영어 지문을 볼 때마다 번역과 교재를 번갈아 보느라 집중이 자주 끊기는 학생",
    ],
    imageSrc: "/mainforth-second.png",
  },
  {
    id: "professional",
    title: "영어 텍스트를\n소비하는 실무자",
    description: "",
    bulletPoints: [
      "리포트, 매뉴얼, 뉴스레터, 리서치 아티클 등 영어 텍스트를 자주 읽는 직장인, 취준생",
    ],
    imageSrc: "/mainforth-third.png",
  },
];

export const steps: Step[] = [
  {
    id: 1,
    description:
      "읽고 싶은 영어 PDF를 업로드하거나,\n텍스트를 불러옵니다.",
  },
  {
    id: 2,
    description: "문장별로 번역된 텍스트를 읽습니다.",
  },
  {
    id: 3,
    description:
      "다 읽지 못한 문서는 내 문서함에 저장되어, 마지막 위치부터 이어 읽을 수 있습니다.",
  },
];
