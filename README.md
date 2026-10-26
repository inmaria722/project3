# 강의 카탈로그 ① — Props 타입 설계

```bash
npm install
npm run dev
```

## AI 학습 도우미 설정

실제 AI 답변을 사용하려면 OpenAI API 키를 프로젝트 루트의 `.env.local`에 다음과 같이 저장하세요. 이 파일은 Git에 포함되지 않습니다.

```text
OPENAI_API_KEY=여기에_API_키
```

그다음 `npm run dev`를 실행하세요. 대화는 서버에서 OpenAI Responses API로 전달되며 API 키는 브라우저에 보내지 않습니다. 모델은 기본적으로 `gpt-6-astra`를 사용하고, 필요하면 `.env.local`에 `OPENAI_MODEL=모델명`을 지정할 수 있습니다. 실제 API 호출에는 OpenAI API 계정과 사용량 과금이 적용됩니다.

타입만 검사하려면:

```bash
npm run typecheck     # tsc --noEmit
```

---

## 이 실습은 세 번에 걸쳐 완성됩니다

| | 주제 | 오늘 |
|---|---|---|
| **①** | **Props 타입 설계** | **← 지금 여기** |
| ② | useState 타입 — 검색·필터 붙이기 | 다음 시간 |
| ③ | 이벤트 타입 — 입력·클릭 붙이기 | 그다음 시간 |

**오늘 만든 파일은 지우지 마세요.** 다음 시간에 여기에 이어서 쌓습니다.

> 오늘 만드는 건 **움직이지 않습니다.** 표시만 해요.
> 상태와 이벤트는 다음 두 시간에 붙입니다.

---

## 폴더 구조

```
src/
├─ data/courses.ts     강의 데이터   ← 수정하지 마세요
├─ data/thumbs.ts      썸네일 이미지 ← 수정하지 마세요
├─ styles/catalog.css  모든 스타일   ← 수정하지 마세요
├─ types/              타입을 만드세요
├─ components/         컴포넌트를 만드세요
└─ App.tsx             여기에 붙이세요
```

---

## 오늘 만들 것

| 단계 | 파일 | 시간 |
|---|---|---|
| 0 | **종이에 설계** (코드 금지) | 10분 |
| 1 | `types/course.ts` | 10분 |
| 2 | `components/Badge.tsx` | 10분 |
| 3 | `components/CourseCard.tsx` ★ | 20분 |
| 4 | `components/CourseList.tsx` | 10분 |
| 보너스 | `components/Button.tsx` | +10분 |

**3단계가 오늘의 핵심입니다.** 시간이 모자라면 4단계를 줄이세요.

---

## 데이터 모양

`src/data/courses.ts` 를 **반드시 먼저 열어보세요.**
타입은 **여러분이 정하는 게 아니라 데이터에 맞춰 적는 것**입니다.

```ts
{
  id: "c1",
  title: "React 입문 — 컴포넌트부터 훅까지",
  instructor: { id: "i1", name: "허승범" },
  level: "beginner",              // beginner | intermediate | advanced
  hours: 24,
  tags: ["React", "프론트엔드"],
  thumbnail: "data:image/svg+xml...",   // 또는 null
  price: 0,                       // 0 이면 무료
  enrolled: 1243,
  status: "open",                 // open | ongoing | closed
}
```

---

## 지켜야 할 것

1. `any` 를 쓰지 않습니다
2. `as` 와 `!` 를 쓰지 않습니다
3. `catalog.css` 를 수정하지 않습니다
4. 인라인 `style` 을 쓰지 않습니다
5. **화면에 영문 코드(`beginner`, `open`)가 보이면 안 됩니다**

5번이 오늘의 숨은 시험입니다.

---

## 막혔을 때

코드를 더 쓰기 전에 **종이에 이 세 가지를 적어보세요.**

1. 이 컴포넌트가 **받아야 하는 것**은 무엇인가?
2. 그중 **없어도 되는 것**은 무엇인가?
3. 없을 때 **화면은 어떻게 보여야** 하는가?

3번을 안 정하면 코드가 안 나옵니다.
