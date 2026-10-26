import { THUMB } from "./thumbs";

// 서버에서 내려온 강의 목록이라고 생각하세요.
// 이 파일은 수정하지 마세요. 타입은 types/course.ts 에 직접 만듭니다.
//
// level 과 status 에 `as const` 가 붙어 있는 이유:
//   없으면 TypeScript 가 그냥 string 으로 봅니다. as const 를 붙여야
//   "beginner" 라는 값 자체가 타입이 되고, 여러분이 만든 유니온과 맞아떨어집니다.
//   (타입 단언 시간에 배운 그 as const 입니다.)

export const courses = [
  {
    id: "c1",
    title: "React 입문 — 컴포넌트부터 훅까지",
    instructor: { id: "i1", name: "허승범" },
    level: "beginner" as const,
    hours: 24,
    tags: ["React", "프론트엔드"],
    thumbnail: THUMB.react,
    price: 0,
    enrolled: 1243,
    status: "open" as const,
  },
  {
    id: "c2",
    title: "TypeScript 실전 — 타입으로 설계하기",
    instructor: { id: "i2", name: "김민수" },
    level: "intermediate" as const,
    hours: 16,
    tags: ["TypeScript"],
    thumbnail: null,
    price: 89000,
    enrolled: 512,
    status: "closed" as const,
  },
  {
    id: "c3",
    title: "Node.js 백엔드 부트캠프",
    instructor: { id: "i3", name: "이서연" },
    level: "advanced" as const,
    hours: 40,
    tags: ["Node.js", "백엔드", "DB"],
    thumbnail: THUMB.node,
    price: 149000,
    enrolled: 88,
    status: "ongoing" as const,
  },
  {
    id: "c4",
    title: "HTML · CSS 기초 다지기",
    instructor: { id: "i4", name: "박지훈" },
    level: "beginner" as const,
    hours: 12,
    tags: ["HTML", "CSS"],
    thumbnail: THUMB.html,
    price: 0,
    enrolled: 3120,
    status: "open" as const,
  },
  {
    id: "c5",
    title: "테스트 주도 개발 실습",
    instructor: { id: "i5", name: "최수아" },
    level: "advanced" as const,
    hours: 20,
    tags: ["테스트", "Vitest", "리팩터링"],
    thumbnail: null,
    price: 119000,
    enrolled: 47,
    status: "open" as const,
  },
  {
    id: "c6",
    title: "Git 협업 워크플로",
    instructor: { id: "i6", name: "정하늘" },
    level: "intermediate" as const,
    hours: 8,
    tags: ["Git", "협업"],
    thumbnail: THUMB.git,
    price: 39000,
    enrolled: 806,
    status: "ongoing" as const,
  },
];
