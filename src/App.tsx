import { useEffect, useState } from "react";
import { courses } from "./data/courses";
import CourseList from "./components/CourseList";
import Badge from "./components/Badge";
import {
  LEVEL_LABEL,
  type Course,
  type CourseProgress,
} from "./types/course";

const TOPIC_BY_COURSE: Record<string, string> = {
  c1: "React",
  c2: "TypeScript",
  c3: "서버 기초",
  c4: "HTML · CSS",
  c5: "테스트",
  c6: "Git · 협업",
};

function readStringList(key: string, fallback: string[]): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) ?? "null");
    return Array.isArray(value) && value.every((item) => typeof item === "string")
      ? value
      : fallback;
  } catch {
    return fallback;
  }
}

interface CourseMemo {
  id: string;
  content: string;
  createdAt: string;
}

function readNotes(): Record<string, CourseMemo[]> {
  try {
    const value: unknown = JSON.parse(localStorage.getItem("ormi-study-notes") ?? "{}");
    if (value === null || typeof value !== "object" || Array.isArray(value)) return {};
    return Object.fromEntries(Object.entries(value).map(([courseId, entry]) => {
      if (typeof entry === "string") {
        return [courseId, entry.trim() ? [{ id: crypto.randomUUID(), content: entry, createdAt: new Date().toISOString() }] : []];
      }
      if (!Array.isArray(entry)) return [courseId, []];
      return [courseId, entry.filter((memo): memo is CourseMemo =>
        memo !== null && typeof memo === "object"
        && typeof memo.id === "string" && typeof memo.content === "string"
        && typeof memo.createdAt === "string",
      )];
    }));
  } catch {
    return {};
  }
}

interface LocalProfile {
  name: string;
}

function readLocalProfile(): LocalProfile | null {
  try {
    const value: unknown = JSON.parse(localStorage.getItem("ormi-demo-profile") ?? "null");
    return value !== null && typeof value === "object" && "name" in value && typeof value.name === "string"
      ? { name: value.name }
      : null;
  } catch {
    return null;
  }
}

function readProgress(): Record<string, CourseProgress> {
  try {
    const value: unknown = JSON.parse(localStorage.getItem("ormi-course-progress-v1") ?? "{}");
    if (value === null || typeof value !== "object" || Array.isArray(value)) return {};
    return Object.fromEntries(
      Object.entries(value).filter(([, progress]) => {
        if (progress === null || typeof progress !== "object") return false;
        const item = progress as Partial<CourseProgress>;
        return typeof item.currentLesson === "number"
          && Array.isArray(item.completedLessonIndexes)
          && typeof item.completed === "boolean";
      }),
    ) as Record<string, CourseProgress>;
  } catch {
    return {};
  }
}

interface StudyLog {
  id: string;
  date: string;
  courseId: string;
  content: string;
}

function readStudyLogs(): StudyLog[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem("ormi-daily-study-logs") ?? "[]");
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is StudyLog =>
      item !== null
      && typeof item === "object"
      && typeof item.id === "string"
      && typeof item.date === "string"
      && typeof item.courseId === "string"
      && typeof item.content === "string",
    );
  } catch {
    return [];
  }
}

function getLocalDate() {
  const now = new Date();
  const localTime = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return localTime.toISOString().slice(0, 10);
}

function getWeekStartDate() {
  const monday = new Date();
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  const localTime = new Date(monday.getTime() - monday.getTimezoneOffset() * 60_000);
  return localTime.toISOString().slice(0, 10);
}

function readWeeklyGoal() {
  const value = Number(localStorage.getItem("ormi-weekly-study-goal"));
  return Number.isInteger(value) && value >= 1 && value <= 30 ? value : 5;
}


interface Lesson {
  title: string;
  summary: string;
  duration: string;
  videoUrl?: string;
}

interface CourseProfile {
  overview: string;
  audience: string;
  outcomes: string[];
  prerequisites: string;
}

const COURSE_PROFILES: Record<string, CourseProfile> = {
  c1: {
    overview: "컴포넌트와 props부터 상태 관리와 기본 훅까지 익히며, React 화면이 동작하는 원리를 실습합니다.",
    audience: "React를 처음 배우거나, 컴포넌트 기반 UI 개발의 흐름을 잡고 싶은 분",
    outcomes: ["UI를 작은 컴포넌트로 나누고 조합하기", "props와 state로 화면 데이터 다루기", "이벤트와 기본 훅을 이용해 상호작용 구현하기"],
    prerequisites: "HTML, CSS와 JavaScript의 기본 문법을 알고 있으면 수강하기 좋습니다.",
  },
  c2: {
    overview: "기본 문법을 넘어 유니온, 제네릭, 타입 좁히기 등 실무에서 자주 쓰는 타입 설계 방법을 다룹니다.",
    audience: "TypeScript 기초를 익혔고 타입을 활용해 더 안전한 코드를 작성하고 싶은 개발자",
    outcomes: ["상황에 맞는 타입과 유니온 설계하기", "타입 가드로 값의 범위 좁히기", "제네릭으로 재사용 가능한 함수와 구조 만들기"],
    prerequisites: "JavaScript 기본 문법과 변수·함수·객체 개념에 익숙해야 합니다.",
  },
  c3: {
    overview: "Node.js 서버의 기본 구조부터 API와 데이터베이스 연동까지 백엔드 개발 흐름을 따라갑니다.",
    audience: "서버 개발을 시작하고 API와 데이터 저장의 연결 과정을 이해하고 싶은 분",
    outcomes: ["서버 요청과 응답 흐름 설명하기", "REST API의 기본 구조 설계하기", "데이터베이스 연동과 오류 처리 적용하기"],
    prerequisites: "JavaScript 기초와 터미널에서 명령어를 실행하는 방법을 알고 있으면 좋습니다.",
  },
  c4: {
    overview: "HTML 문서 구조와 CSS 기본기를 익히고, 레이아웃과 반응형 스타일을 적용해 웹 페이지를 만듭니다.",
    audience: "웹 페이지를 처음 만들거나 HTML과 CSS 기초를 탄탄히 다지고 싶은 입문자",
    outcomes: ["시맨틱 HTML로 문서 구조 구성하기", "CSS 박스 모델과 선택자 활용하기", "Flexbox·Grid로 반응형 레이아웃 만들기"],
    prerequisites: "별도 선수 지식 없이 시작할 수 있습니다. 텍스트 편집기를 사용할 수 있으면 됩니다.",
  },
  c5: {
    overview: "테스트를 먼저 작성하고 작은 단위로 개선하는 TDD 흐름과 테스트 가능한 코드 설계를 연습합니다.",
    audience: "테스트 코드를 프로젝트에 적용하고 리팩터링을 더 안전하게 하고 싶은 개발자",
    outcomes: ["요구사항을 작은 테스트로 표현하기", "실패·통과·리팩터링 흐름 반복하기", "경계 조건을 고려해 테스트 범위 정하기"],
    prerequisites: "함수와 모듈을 작성할 수 있는 프로그래밍 기초가 필요합니다.",
  },
  c6: {
    overview: "커밋과 브랜치부터 원격 저장소 공유, 코드 리뷰, 충돌 해결까지 팀 협업에 필요한 Git 흐름을 실습합니다.",
    audience: "Git을 처음 쓰거나 팀 프로젝트의 브랜치 협업 흐름을 익히고 싶은 분",
    outcomes: ["변경 내용을 커밋으로 관리하기", "브랜치와 병합으로 작업 나누기", "원격 저장소와 Pull Request로 협업하기"],
    prerequisites: "터미널에서 프로젝트 폴더를 열고 기본 명령어를 실행할 수 있으면 좋습니다.",
  },
};

const LESSONS: Record<string, Lesson[]> = {
  c1: [
    { title: "React와 컴포넌트 이해하기", summary: "React의 기본 개념을 익히고 화면을 컴포넌트 단위로 나눠 봅니다.", duration: "25분" },
    { title: "JSX와 props", summary: "JSX로 UI를 작성하고 props로 컴포넌트에 데이터를 전달합니다.", duration: "32분" },
    { title: "상태와 이벤트", summary: "useState와 이벤트 처리로 사용자 입력에 반응하는 화면을 만듭니다.", duration: "38분" },
    { title: "useEffect와 미니 프로젝트", summary: "useEffect의 기초를 익히고 배운 내용을 작은 화면으로 완성합니다.", duration: "45분" },
    { title: "조건부 렌더링", summary: "조건에 따라 다른 UI를 보여주고 목록 데이터를 화면에 렌더링합니다.", duration: "30분" },
    { title: "폼과 사용자 입력", summary: "입력값을 상태로 관리하고 간단한 폼을 구현합니다.", duration: "35분" },
    { title: "컴포넌트 나누기 실습", summary: "작은 프로젝트를 기능별 컴포넌트로 나누고 조립합니다.", duration: "50분" },
  ],
  c2: [
    { title: "타입스크립트와 타입 추론", summary: "타입 추론과 기본 타입을 활용해 코드의 의도를 표현합니다.", duration: "28분" },
    { title: "유니온과 좁히기", summary: "유니온 타입과 타입 가드로 여러 입력 상황을 안전하게 처리합니다.", duration: "35분" },
    { title: "제네릭으로 재사용하기", summary: "제네릭 함수와 타입으로 재사용 가능한 코드를 설계합니다.", duration: "42분" },
    { title: "실전 타입 설계", summary: "실제 데이터 구조를 타입으로 모델링하고 검증합니다.", duration: "40분" },
    { title: "인터페이스와 타입 조합", summary: "객체 타입을 정의하고 필요한 타입을 조합해 봅니다.", duration: "32분" },
    { title: "함수와 콜백 타입", summary: "매개변수와 반환값, 콜백의 타입을 명확하게 지정합니다.", duration: "36분" },
    { title: "타입 안전성 점검", summary: "타입 오류를 읽고 기존 코드를 안전하게 개선합니다.", duration: "44분" },
  ],
  c3: [
    { title: "Node.js 서버 시작하기", summary: "Node.js 실행 환경과 서버 애플리케이션의 기본 구조를 살펴봅니다.", duration: "35분" },
    { title: "REST API 만들기", summary: "요청과 응답을 이해하고 REST 방식의 API를 구현합니다.", duration: "50분" },
    { title: "데이터베이스 연결", summary: "서버에서 데이터베이스를 연결하고 데이터를 조회·저장합니다.", duration: "55분" },
    { title: "오류 처리와 배포 준비", summary: "예외 상황을 처리하고 서비스 배포 전 점검 항목을 확인합니다.", duration: "45분" },
    { title: "미들웨어 구성", summary: "요청 처리 단계에 미들웨어를 추가하고 흐름을 정리합니다.", duration: "38분" },
    { title: "인증과 입력 검증", summary: "요청 데이터를 검증하고 기본적인 사용자 인증 흐름을 살펴봅니다.", duration: "48분" },
    { title: "API 프로젝트 정리", summary: "라우트와 데이터 처리를 정돈해 API 프로젝트를 완성합니다.", duration: "52분" },
  ],
  c4: [
    { title: "HTML 문서 구조", summary: "시맨틱 태그를 사용해 웹 문서의 뼈대를 구성합니다.", duration: "25분" },
    { title: "CSS 선택자와 박스 모델", summary: "선택자, 여백, 테두리로 요소의 기본 모양을 조정합니다.", duration: "35분" },
    { title: "레이아웃 만들기", summary: "Flexbox와 Grid로 화면 요소를 원하는 위치에 배치합니다.", duration: "40분" },
    { title: "반응형 페이지 완성", summary: "화면 크기에 따라 자연스럽게 바뀌는 페이지를 만들어 봅니다.", duration: "45분" },
    { title: "색상과 타이포그래피", summary: "색상과 글꼴 크기, 굵기를 조합해 읽기 쉬운 화면을 만듭니다.", duration: "28분" },
    { title: "이미지와 배경 꾸미기", summary: "이미지와 배경 속성을 활용해 페이지에 시각적 요소를 더합니다.", duration: "32분" },
    { title: "페이지 마무리 실습", summary: "HTML 구조와 CSS 레이아웃을 적용해 한 페이지를 완성합니다.", duration: "45분" },
  ],
  c5: [
    { title: "테스트와 TDD 시작", summary: "테스트가 필요한 이유와 테스트 주도 개발의 흐름을 익힙니다.", duration: "30분" },
    { title: "첫 테스트 작성하기", summary: "작은 단위의 테스트를 작성하고 실패 결과를 확인합니다.", duration: "35분" },
    { title: "리팩터링과 테스트", summary: "테스트를 안전망으로 삼아 코드 구조를 개선합니다.", duration: "40분" },
    { title: "실전 테스트 전략", summary: "경계 조건과 예외 상황을 포함해 테스트 범위를 설계합니다.", duration: "45분" },
    { title: "테스트 더블 활용", summary: "의존성을 분리하고 테스트 더블로 외부 동작을 제어합니다.", duration: "38분" },
    { title: "비동기 코드 테스트", summary: "비동기 작업의 성공과 실패 흐름을 테스트합니다.", duration: "42분" },
    { title: "테스트 리팩터링 실습", summary: "중복 테스트를 정리하고 유지하기 쉬운 테스트 코드를 작성합니다.", duration: "48분" },
  ],
  c6: [
    { title: "Git 저장소와 커밋", summary: "저장소를 만들고 변경 이력을 커밋으로 기록합니다.", duration: "25분" },
    { title: "브랜치와 병합", summary: "브랜치에서 작업하고 변경 사항을 병합하는 방법을 익힙니다.", duration: "35분" },
    { title: "원격 저장소와 협업", summary: "원격 저장소에 코드를 공유하고 동료의 변경 사항을 가져옵니다.", duration: "40분" },
    { title: "충돌 해결과 협업 흐름", summary: "병합 충돌을 해결하고 팀 작업 흐름을 따라 실습합니다.", duration: "45분" },
    { title: "커밋 기록 살펴보기", summary: "로그와 변경 내역을 확인하고 필요한 이전 상태를 찾아봅니다.", duration: "28분" },
    { title: "변경 사항 임시 보관", summary: "작업 중인 변경 사항을 보관하고 다른 브랜치 작업을 이어갑니다.", duration: "25분" },
    { title: "Pull Request 흐름", summary: "브랜치 작업을 공유하고 코드 리뷰를 거쳐 병합하는 과정을 익힙니다.", duration: "42분" },
  ],
};

const LESSON_COUNTS = Object.fromEntries(
  Object.entries(LESSONS).map(([id, lessons]) => [id, lessons.length]),
);

function LessonWatchPage({
  course,
  lessonIndex,
  completedLessonIndexes,
  onBack,
  onSelectLesson,
  onComplete,
}: {
  course: Course;
  lessonIndex: number;
  completedLessonIndexes: number[];
  onBack: () => void;
  onSelectLesson: (index: number) => void;
  onComplete: () => void;
}) {
  const lesson = LESSONS[course.id][lessonIndex];
  const completedCount = completedLessonIndexes.length;

  return (
    <div className="lesson-watch-page">
      <div className="lesson-watch-topbar">
        <button className="btn btn-ghost" type="button" onClick={onBack}>← 학습 보드</button>
        <span>{course.title}</span>
      </div>
      <div className="lesson-watch-layout">
        <main className="lesson-watch-main">
          <div className="lesson-video-frame">
            {lesson.videoUrl ? (
              <video
                key={lesson.videoUrl}
                controls
                autoPlay
                playsInline
                onEnded={onComplete}
                aria-label={`${lesson.title} 강의 영상`}
              >
                <source src={lesson.videoUrl} />
                브라우저가 동영상 재생을 지원하지 않습니다.
              </video>
            ) : (
              <div className="lesson-video-empty">
                <span className="lesson-video-icon" aria-hidden="true">▶</span>
                <strong>강의 영상이 아직 연결되지 않았어요</strong>
                <p>영상 주소를 등록하면 이 화면에서 바로 재생할 수 있습니다.</p>
              </div>
            )}
          </div>
          <div className="lesson-watch-heading">
            <div>
              <span className="lesson-watch-kicker">{course.title} · {lessonIndex + 1}차시</span>
              <h1>{lesson.title}</h1>
            </div>
            <span className="hint">예상 {lesson.duration}</span>
          </div>
          <p className="lesson-watch-summary">{lesson.summary}</p>
          {lesson.videoUrl && <p className="lesson-watch-footnote">영상 재생이 끝나면 이 차시가 자동으로 완료 처리됩니다.</p>}
        </main>
        <aside className="lesson-watch-sidebar">
          <div className="lesson-watch-sidebar-head">
            <h2>강의 목차</h2>
            <span>{completedCount}/{LESSONS[course.id].length}차시</span>
          </div>
          <ol>
            {LESSONS[course.id].map((item, index) => (
              <li key={item.title}>
                <button
                  className={`${index === lessonIndex ? "is-current" : ""}${completedLessonIndexes.includes(index) ? " is-complete" : ""}`}
                  type="button"
                  aria-current={index === lessonIndex ? "step" : undefined}
                  onClick={() => onSelectLesson(index)}
                >
                  <span className="lesson-watch-number">{completedLessonIndexes.includes(index) ? "✓" : index + 1}</span>
                  <span className="lesson-watch-item-title">{item.title}</span>
                  <span className="lesson-watch-duration">{item.duration}</span>
                </button>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </div>
  );
}

function CourseDetail({
  course,
  onBack,
  progress,
  onStartCourse,
  onWatchLesson,
  memos,
  onAddMemo,
  onDeleteMemo,
}: {
  course: Course;
  onBack: () => void;
  progress?: CourseProgress;
  onStartCourse: (id: string) => void;
  onWatchLesson: (id: string, lessonIndex: number) => void;
  memos: CourseMemo[];
  onAddMemo: (id: string, value: string) => void;
  onDeleteMemo: (courseId: string, memoId: string) => void;
}) {
  const [memoDraft, setMemoDraft] = useState("");
  const [memoSaveMessage, setMemoSaveMessage] = useState("");
  useEffect(() => {
    setMemoDraft("");
    setMemoSaveMessage("");
  }, [course.id]);
  const profile = COURSE_PROFILES[course.id];

  return (
    <>
      <button className="btn btn-ghost" onClick={onBack}>
        ← 내 학습 보드
      </button>
      <section className="section">
        <article className="course-card">
          {course.thumbnail && (
            <img
              className="course-thumb"
              src={course.thumbnail}
              alt={course.title}
            />
          )}
          {!course.thumbnail && (
            <div className={`course-cover course-cover-${course.id}`} aria-hidden="true">
              <span>{course.tags[0]}</span>
            </div>
          )}
          <div className="course-body">
            <div className="course-badges">
              <Badge>{LEVEL_LABEL[course.level]}</Badge>
              <Badge tone={progress?.completed ? "brand" : progress ? "success" : "default"}>
                {progress?.completed ? "수강 완료" : progress ? "수강 중" : "미수강"}
              </Badge>
              {course.tags.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
            <h1 className="page-title">{course.title}</h1>
            <p className="course-instructor">
              <span className="avatar">{course.instructor.name[0]}</span>
              {course.instructor.name}
            </p>
            <div className="course-meta">
              <span>주제: {TOPIC_BY_COURSE[course.id]}</span>
              <span className="dot" />
              <span>총 {course.hours.toLocaleString("ko-KR")}시간</span>
            </div>
            {progress?.completed ? (
              <span className="completed-course-label">✓ 모든 차시를 완료했어요</span>
            ) : progress ? (
              <div className="course-progress-detail">
                <div className="toolbar-row">
                  <strong>현재 학습 위치</strong>
                  <span className="spacer" />
                  <span>{progress.completedLessonIndexes.length}/{LESSONS[course.id].length}차시 완료</span>
                </div>
                <p>{LESSONS[course.id][progress.currentLesson]?.title ?? "다음 차시를 선택하세요"}</p>
                <progress
                  className="study-progress-bar"
                  value={progress.completedLessonIndexes.length}
                  max={LESSONS[course.id].length}
                  aria-label={`강의 진도 ${Math.round((progress.completedLessonIndexes.length / LESSONS[course.id].length) * 100)}%`}
                />
              </div>
            ) : (
              <>
                <button className="btn btn-primary" onClick={() => onStartCourse(course.id)}>
                  학습 시작하기 <span aria-hidden="true">→</span>
                </button>
                <p className="hint course-start-hint">시작하면 현재 차시와 완료한 진도를 이 브라우저에 기록해요.</p>
              </>
            )}
          </div>
        </article>
      </section>
      <section className="section">
        <h2 className="section-title">강의 정보</h2>
        <div className="toolbar">
          <div className="toolbar-row">
            <span className="toolbar-label">강사</span>
            <span className="toolbar-value">{course.instructor.name}</span>
          </div>
          <div className="toolbar-row">
            <span className="toolbar-label">난이도</span>
            <span className="toolbar-value">{LEVEL_LABEL[course.level]}</span>
          </div>
          <div className="toolbar-row">
            <span className="toolbar-label">분량</span>
            <span className="toolbar-value">
              총 {course.hours.toLocaleString("ko-KR")}시간
            </span>
          </div>
          <div className="toolbar-row">
            <span className="toolbar-label">주제</span>
            <span className="toolbar-value">{TOPIC_BY_COURSE[course.id]}</span>
          </div>
        </div>
        <div className="toolbar course-overview">
          <h3 className="section-title">강의 소개</h3>
          <p>{profile.overview}</p>
          <div className="course-info-block">
            <h3 className="section-title">이런 분께 추천해요</h3>
            <p>{profile.audience}</p>
          </div>
          <div className="course-info-block">
            <h3 className="section-title">배우고 나면</h3>
            <ul className="course-outcomes">
              {profile.outcomes.map((outcome) => <li key={outcome}>{outcome}</li>)}
            </ul>
          </div>
          <div className="course-info-block">
            <h3 className="section-title">수강 전 준비</h3>
            <p>{profile.prerequisites}</p>
          </div>
        </div>
      </section>
      <section className="section">
        <h2 className="section-title">강의 목차 <span className="count">{LESSONS[course.id].length}</span></h2>
        <p className="lede">수강하기를 누르면 전용 시청 화면으로 이동해요. 영상 시청이 끝나면 자동으로 완료 처리됩니다.</p>
        {LESSONS[course.id].map((lesson, index) => {
          const isComplete = progress?.completedLessonIndexes.includes(index) ?? false;
          const isCurrent = Boolean(progress && !progress.completed && progress.currentLesson === index);
          return (
          <details className="toolbar lesson-card" key={lesson.title} open={isCurrent}>
            <summary className="toolbar-row">
              <span className={`count${isComplete ? " lesson-complete-count" : ""}`}>
                {isComplete ? "✓" : index + 1}
              </span>
              <span className="toolbar-value">{lesson.title}</span>
              <span className="spacer" />
              <span className="hint">{isComplete ? "완료" : lesson.duration}</span>
            </summary>
            <p className="state-desc">{lesson.summary}</p>
            <div className="toolbar-row lesson-actions">
              {isCurrent && <span className="lesson-current-label">지금 학습 중</span>}
              {isComplete && <span className="lesson-current-label">학습 완료</span>}
              <span className="spacer" />
              <button
                className={`btn btn-sm${isComplete ? "" : " btn-primary"}`}
                type="button"
                disabled={isComplete}
                onClick={() => onWatchLesson(course.id, index)}
              >
                {isComplete ? "수강완료" : <>수강하기 <span aria-hidden="true">→</span></>}
              </button>
            </div>
          </details>
          );
        })}
      </section>
      <section className="section course-memo-section">
        <h2 className="section-title">이 강의 메모</h2>
        <p className="lede">복습할 내용이나 질문을 이 강의에 연결해 기록하세요.</p>
        <div className="course-memo-layout">
          <div className="study-panel course-memo-panel">
            <h3>새 메모 작성</h3>
            <textarea
              className="study-textarea"
              value={memoDraft}
              onChange={(event) => {
                setMemoDraft(event.target.value);
                setMemoSaveMessage("");
              }}
              placeholder="기억해 둘 개념, 실습 메모, 다음에 확인할 질문을 적어 보세요."
              rows={7}
              aria-label={`${course.title} 새 메모`}
            />
            <div className="study-form-actions">
              <span className="hint" aria-live="polite">{memoSaveMessage || "메모를 작성한 뒤 등록하세요."}</span>
              <button
                className="btn btn-primary"
                type="button"
                disabled={!memoDraft.trim()}
                onClick={() => {
                  onAddMemo(course.id, memoDraft.trim());
                  setMemoDraft("");
                  setMemoSaveMessage("메모를 등록했어요.");
                }}
              >메모 등록</button>
            </div>
          </div>
          <div className="course-memo-list-panel">
            <div className="page-head">
              <h3 className="section-title">등록한 메모</h3>
              <span className="spacer" />
              <span className="hint">{memos.length}개</span>
            </div>
            {memos.length ? (
              <ul className="course-memo-list">
                {[...memos].reverse().map((memo) => (
                  <li className="course-memo-item" key={memo.id}>
                    <div className="toolbar-row">
                      <time dateTime={memo.createdAt}>{new Date(memo.createdAt).toLocaleString("ko-KR", { dateStyle: "medium", timeStyle: "short" })}</time>
                      <span className="spacer" />
                      <button className="btn btn-ghost btn-sm" type="button" onClick={() => onDeleteMemo(course.id, memo.id)}>삭제</button>
                    </div>
                    <p>{memo.content}</p>
                  </li>
                ))}
              </ul>
            ) : <p className="study-empty">아직 등록한 메모가 없어요. 왼쪽에서 첫 메모를 작성해 보세요.</p>}
          </div>
        </div>
      </section>
    </>
  );
}

interface AssistantMessage {
  role: "user" | "assistant";
  content: string;
}

function StudyAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [courseId, setCourseId] = useState(courses[0]?.id ?? "");
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<AssistantMessage[]>([
    { role: "assistant", content: "안녕하세요! 강의 내용을 복습하거나, 다음에 무엇을 공부하면 좋을지 물어보세요." },
  ]);
  const [quickReplies, setQuickReplies] = useState([
    "이 강의 핵심을 복습하고 싶어",
    "어려운 부분 힌트 줘",
    "다음에 뭘 공부하면 좋을까?",
  ]);
  const course = courses.find((item) => item.id === courseId) ?? courses[0];

  const sendMessage = async (value = draft) => {
    const question = value.trim();
    if (!question || isSending) return;
    const previousMessages = messages.slice(1);
    setMessages((current) => [...current, { role: "user", content: question }]);
    setDraft("");
    setIsSending(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          course: {
            title: course.title,
            overview: COURSE_PROFILES[course.id].overview,
            outcomes: COURSE_PROFILES[course.id].outcomes,
            lessons: LESSONS[course.id],
          },
          messages: [...previousMessages, { role: "user", content: question }],
        }),
      });
      const responseText = await response.text();
      let data: { answer?: string; suggestions?: string[]; error?: string };
      try {
        data = JSON.parse(responseText) as typeof data;
      } catch {
        if (response.status === 404 || !responseText.trim()) {
          throw new Error("AI 서버를 찾지 못했어요. 실행 중인 터미널에서 서버를 종료하고 `npm run dev`로 다시 시작해 주세요.");
        }
        throw new Error("AI 서버 응답을 읽지 못했어요. 서버를 다시 시작한 뒤 시도해 주세요.");
      }
      if (!response.ok) throw new Error(data.error || "AI 응답을 가져오지 못했어요.");
      setMessages((current) => [...current, { role: "assistant", content: data.answer ?? "응답이 비어 있어요. 다시 질문해 주세요." }]);
      if (data.suggestions?.length) setQuickReplies(data.suggestions.slice(0, 3));
    } catch (error) {
      const message = error instanceof Error ? error.message : "잠시 후 다시 시도해 주세요.";
      setMessages((current) => [...current, { role: "assistant", content: `답변을 가져오지 못했어요. ${message}` }]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="assistant-float-root">
      {isOpen && (
        <section className="study-assistant" aria-label="AI 학습 도우미">
          <div className="assistant-window-head">
            <span className="assistant-avatar" aria-hidden="true">✦</span>
            <div><strong>AI 학습 도우미</strong><span>강의 복습과 학습 질문</span></div>
            <button className="assistant-close" type="button" aria-label="도우미 닫기" onClick={() => setIsOpen(false)}>×</button>
          </div>
          <div className="assistant-toolbar">
            <label htmlFor="assistant-course">질문할 강의</label>
            <select id="assistant-course" className="study-select" value={courseId} onChange={(event) => setCourseId(event.target.value)}>
              {courses.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
            </select>
          </div>
          <div className="assistant-messages" aria-live="polite">
            {messages.map((message, index) => (
              <div className={`assistant-message is-${message.role}`} key={`${index}-${message.role}`}>
                {message.role === "assistant" && <span className="assistant-avatar" aria-hidden="true">✦</span>}
                <p>{message.content}</p>
              </div>
            ))}
            {isSending && (
              <div className="assistant-message is-assistant assistant-thinking" role="status" aria-live="polite">
                <span className="assistant-avatar" aria-hidden="true">✦</span>
                <div className="assistant-thinking-bubble">
                  <span className="assistant-thinking-label">답변 작성 중</span>
                  <span className="assistant-thinking-dots" aria-hidden="true"><i /><i /><i /></span>
                </div>
              </div>
            )}
          </div>
          <div className="assistant-prompts" aria-label="빠른 질문">
            {quickReplies.map((prompt) => (
              <button className="assistant-prompt" type="button" key={prompt} disabled={isSending} onClick={() => sendMessage(prompt)}>{prompt}</button>
            ))}
          </div>
          <form className="assistant-composer" onSubmit={(event) => { event.preventDefault(); sendMessage(); }}>
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  sendMessage();
                }
              }}
              placeholder={`${course.title}에 대해 질문해 보세요.`}
              rows={2}
              aria-label="학습 도우미에게 질문"
            />
          <button className="btn btn-primary" type="submit" disabled={!draft.trim() || isSending} aria-label="질문 보내기">↑</button>
          </form>
          <p className="assistant-footnote">강의 내용과 대화 맥락을 바탕으로 답변해요.</p>
        </section>
      )}
      <button
        className={`assistant-launcher${isOpen ? " is-open" : ""}`}
        type="button"
        aria-label={isOpen ? "학습 도우미 닫기" : "AI 학습 도우미 열기"}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span aria-hidden="true">{isOpen ? "×" : "✦"}</span>
        {!isOpen && <span>학습 도우미</span>}
      </button>
      </div>
  );
}

export default function App() {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [watchTarget, setWatchTarget] = useState<{ courseId: string; lessonIndex: number } | null>(null);
  const [profile, setProfile] = useState<LocalProfile | null>(readLocalProfile);
  const [loginName, setLoginName] = useState("");
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isMyPageOpen, setIsMyPageOpen] = useState(false);
  const [progressByCourse, setProgressByCourse] = useState<Record<string, CourseProgress>>(readProgress);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() =>
    readStringList("ormi-bookmarked-courses", []),
  );
  const [notes, setNotes] = useState<Record<string, CourseMemo[]>>(readNotes);
  const [studyLogs, setStudyLogs] = useState<StudyLog[]>(readStudyLogs);
  const [logDate, setLogDate] = useState(getLocalDate);
  const [logCourseId, setLogCourseId] = useState("c1");
  const [logDraft, setLogDraft] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("전체");
  const [weeklyGoal, setWeeklyGoal] = useState(readWeeklyGoal);

  useEffect(() => {
    localStorage.setItem("ormi-course-progress-v1", JSON.stringify(progressByCourse));
  }, [progressByCourse]);

  useEffect(() => {
    localStorage.setItem("ormi-bookmarked-courses", JSON.stringify(bookmarkedIds));
  }, [bookmarkedIds]);

  useEffect(() => {
    localStorage.setItem("ormi-study-notes", JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem("ormi-daily-study-logs", JSON.stringify(studyLogs));
  }, [studyLogs]);

  useEffect(() => {
    localStorage.setItem("ormi-weekly-study-goal", String(weeklyGoal));
  }, [weeklyGoal]);

  useEffect(() => {
    if (profile) localStorage.setItem("ormi-demo-profile", JSON.stringify(profile));
    else localStorage.removeItem("ormi-demo-profile");
  }, [profile]);

  const toggleId = (ids: string[], id: string, update: (next: string[]) => void) => {
    update(ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]);
  };
  const startCourse = (id: string) => {
    setProgressByCourse((current) => current[id]
      ? current
      : { ...current, [id]: { currentLesson: 0, completedLessonIndexes: [], completed: false } });
  };
  const startLesson = (id: string, lessonIndex: number) => {
    setProgressByCourse((current) => {
      const prior = current[id] ?? { currentLesson: 0, completedLessonIndexes: [], completed: false };
      if (prior.completed) return current;
      return { ...current, [id]: { ...prior, currentLesson: lessonIndex } };
    });
  };
  const completeLesson = (id: string, lessonIndex: number) => {
    setProgressByCourse((current) => {
      const prior = current[id] ?? { currentLesson: 0, completedLessonIndexes: [], completed: false };
      if (prior.completed) return current;
      const lessonCount = LESSON_COUNTS[id] ?? 0;
      const completedLessonIndexes = [...new Set([...prior.completedLessonIndexes, lessonIndex])].sort((a, b) => a - b);
      const completed = completedLessonIndexes.length >= lessonCount;
      const nextLesson = LESSONS[id].findIndex((_, index) => !completedLessonIndexes.includes(index));
      return {
        ...current,
        [id]: {
          currentLesson: completed ? lessonCount - 1 : Math.max(0, nextLesson),
          completedLessonIndexes,
          completed,
          completedLessonDates: {
            ...prior.completedLessonDates,
            [lessonIndex]: prior.completedLessonDates?.[lessonIndex] ?? getLocalDate(),
          },
        },
      };
    });
  };
  const topics = ["전체", "HTML · CSS", "React", "TypeScript", "Git · 협업", "테스트", "서버 기초"];
  const activeCourses = courses.filter((course) => progressByCourse[course.id] && !progressByCourse[course.id].completed);
  const completedCourses = courses.filter((course) => progressByCourse[course.id]?.completed);
  const bookmarkedCourses = courses.filter((course) => bookmarkedIds.includes(course.id));
  const continueCourse = activeCourses[0];
  const continueProgress = continueCourse ? progressByCourse[continueCourse.id] : undefined;
  const continueLessonIndex = continueProgress?.currentLesson ?? 0;
  const continueLesson = continueCourse ? LESSONS[continueCourse.id][continueLessonIndex] : undefined;
  const weekStartDate = getWeekStartDate();
  const weeklyCompletedCount = Object.values(progressByCourse).reduce((total, progress) => (
    total + Object.values(progress.completedLessonDates ?? {}).filter(
      (date) => date >= weekStartDate && date <= getLocalDate(),
    ).length
  ), 0);
  const savedNotesCount = Object.values(notes).reduce((count, memos) => count + memos.length, 0);
  const registerStudyLog = () => {
    if (!logDraft.trim()) return;
    setStudyLogs((current) => [
      { id: crypto.randomUUID(), date: logDate, courseId: logCourseId, content: logDraft.trim() },
      ...current,
    ]);
    setLogDraft("");
  };
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const navigateToSection = (id: string) => {
    setWatchTarget(null);
    if (selectedCourse) {
      setSelectedCourse(null);
      requestAnimationFrame(() => requestAnimationFrame(() => scrollToSection(id)));
    } else {
      scrollToSection(id);
    }
  };
  const visibleCourses = courses.filter(
    (course) => selectedTopic === "전체" || TOPIC_BY_COURSE[course.id] === selectedTopic,
  );
  const renderCourseList = (items: Course[], emptyMessage: string) => (
    <CourseList
      courses={items}
      bookmarkedIds={profile ? bookmarkedIds : []}
      progressByCourse={profile ? progressByCourse : {}}
      lessonCounts={LESSON_COUNTS}
      currentLessonTitles={Object.fromEntries(
        Object.entries(profile ? progressByCourse : {}).map(([id, progress]) => [
          id,
          LESSONS[id]?.[progress.currentLesson]?.title ?? "차시를 선택하세요",
        ]),
      )}
      onBookmark={(id) => profile ? toggleId(bookmarkedIds, id, setBookmarkedIds) : setIsLoginOpen(true)}
      onStartCourse={(id) => profile ? startCourse(id) : setIsLoginOpen(true)}
      onSelect={(id) => {
        const course = courses.find((item) => item.id === id);
        if (course) {
          setWatchTarget(null);
          setSelectedCourse(course);
        }
      }}
      emptyMessage={emptyMessage}
    />
  );

  return (
    <div className="app">
      <header className="app-header">
        <div className="inner">
          <button className="brand" onClick={() => { setSelectedCourse(null); setWatchTarget(null); }}>
            <span className="logo">🎓</span>
            오르미 프론트엔드 학습 보드
          </button>
          <nav className="header-nav" aria-label="주요 메뉴">
            <button type="button" onClick={() => navigateToSection("study-catalog")}>강의 탐색</button>
            {profile && <>
              <button type="button" onClick={() => navigateToSection("bookmarked-courses")}>찜한 강의</button>
              <button type="button" onClick={() => navigateToSection("in-progress-courses")}>내 학습</button>
              <button type="button" onClick={() => navigateToSection("study-notes")}>학습 노트</button>
            </>}
          </nav>
          <div className="header-account">
            {profile ? (
              <>
                <button className="header-mypage" type="button" onClick={() => setIsMyPageOpen(true)}>
                  <span className="header-user-avatar">{profile.name[0]}</span> 마이페이지
                </button>
                <button className="header-login" type="button" onClick={() => { setProfile(null); setWatchTarget(null); setSelectedCourse(null); }}>로그아웃</button>
              </>
            ) : (
              <button className="header-login is-primary" type="button" onClick={() => setIsLoginOpen(true)}>로그인</button>
            )}
          </div>
        </div>
      </header>

      <main className="page">
        {watchTarget && profile ? (
          <LessonWatchPage
            course={courses.find((course) => course.id === watchTarget.courseId)!}
            lessonIndex={watchTarget.lessonIndex}
            completedLessonIndexes={progressByCourse[watchTarget.courseId]?.completedLessonIndexes ?? []}
            onBack={() => setWatchTarget(null)}
            onSelectLesson={(lessonIndex) => {
              startLesson(watchTarget.courseId, lessonIndex);
              setWatchTarget({ courseId: watchTarget.courseId, lessonIndex });
            }}
            onComplete={() => completeLesson(watchTarget.courseId, watchTarget.lessonIndex)}
          />
        ) : selectedCourse ? (
          <CourseDetail
            course={selectedCourse}
            onBack={() => { setSelectedCourse(null); setWatchTarget(null); }}
            progress={profile ? progressByCourse[selectedCourse.id] : undefined}
            onStartCourse={(id) => profile ? startCourse(id) : setIsLoginOpen(true)}
            onWatchLesson={(id, lessonIndex) => {
              if (!profile) {
                setIsLoginOpen(true);
                return;
              }
              startLesson(id, lessonIndex);
              setWatchTarget({ courseId: id, lessonIndex });
            }}
            memos={profile ? notes[selectedCourse.id] ?? [] : []}
            onAddMemo={(id, content) => {
              if (!profile) {
                setIsLoginOpen(true);
                return;
              }
              setNotes((current) => ({
                ...current,
                [id]: [...(current[id] ?? []), { id: crypto.randomUUID(), content, createdAt: new Date().toISOString() }],
              }));
            }}
            onDeleteMemo={(courseId, memoId) => setNotes((current) => ({
              ...current,
              [courseId]: (current[courseId] ?? []).filter((memo) => memo.id !== memoId),
            }))}
          />
        ) : (
          <>
            <div className="study-hero">
              <div>
                <p className="study-eyebrow">ORMI FRONTEND · MY STUDY SPACE</p>
                <h1 className="page-title">내 프론트엔드 학습 보드</h1>
                <p className="lede">수업에서 배우는 주제를 모아 보고, 내 학습과 메모를 관리해요.</p>
              </div>
              {profile ? <div className="study-stats">
                <button type="button" onClick={() => scrollToSection("in-progress-courses")} aria-label={`수강 중인 강의 ${activeCourses.length}개 보기`}>
                  <strong>{activeCourses.length}</strong><span>수강 중</span>
                </button>
                <button type="button" onClick={() => scrollToSection("bookmarked-courses")} aria-label={`찜한 강의 ${bookmarkedIds.length}개 보기`}>
                  <strong>{bookmarkedIds.length}</strong><span>찜한 강의</span>
                </button>
                <button type="button" onClick={() => scrollToSection("study-notes")} aria-label={`저장한 메모 ${savedNotesCount}개, 학습 노트 보기`}>
                  <strong>{savedNotesCount}</strong><span>저장한 메모</span>
                </button>
              </div> : <button className="btn btn-primary" type="button" onClick={() => setIsLoginOpen(true)}>로그인하고 학습 기록 시작하기</button>}
            </div>
            {profile && continueCourse && continueLesson && (
              <section className="continue-learning" aria-label="다음 학습 이어하기">
                <div className="continue-learning-copy">
                  <span className="continue-learning-eyebrow">CONTINUE LEARNING</span>
                  <h2>이어서 학습하기</h2>
                  <p>{continueCourse.title}</p>
                  <span className="continue-lesson-title">{continueLessonIndex + 1}차시 · {continueLesson.title}</span>
                  <progress
                    className="study-progress-bar"
                    value={continueProgress?.completedLessonIndexes.length ?? 0}
                    max={LESSONS[continueCourse.id].length}
                    aria-label={`${continueCourse.title} 진도 ${Math.round(((continueProgress?.completedLessonIndexes.length ?? 0) / LESSONS[continueCourse.id].length) * 100)}%`}
                  />
                </div>
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={() => {
                    setWatchTarget({ courseId: continueCourse.id, lessonIndex: continueLessonIndex });
                    setSelectedCourse(null);
                  }}
                >
                  강의 보기 <span aria-hidden="true">→</span>
                </button>
              </section>
            )}
            {profile && (
              <section className="weekly-goal" aria-labelledby="weekly-goal-title">
                <div className="weekly-goal-head">
                  <div>
                    <span className="continue-learning-eyebrow">THIS WEEK</span>
                    <h2 id="weekly-goal-title">주간 학습 목표</h2>
                    <p>이번 주 완료한 차시를 목표와 비교해요.</p>
                  </div>
                  <div className="weekly-goal-count" aria-live="polite">
                    <strong>{weeklyCompletedCount}</strong><span> / {weeklyGoal}차시</span>
                  </div>
                </div>
                <progress
                  className="study-progress-bar weekly-goal-progress"
                  value={Math.min(weeklyCompletedCount, weeklyGoal)}
                  max={weeklyGoal}
                  aria-label={`주간 목표 ${weeklyGoal}차시 중 ${weeklyCompletedCount}차시 완료`}
                />
                <div className="weekly-goal-footer">
                  <span className={weeklyCompletedCount >= weeklyGoal ? "weekly-goal-achieved" : "hint"}>
                    {weeklyCompletedCount >= weeklyGoal ? "이번 주 목표를 달성했어요! 🎉" : `목표까지 ${weeklyGoal - weeklyCompletedCount}차시 남았어요.`}
                  </span>
                  <label className="weekly-goal-controls" htmlFor="weekly-goal-select">
                    이번 주 목표
                    <select
                      id="weekly-goal-select"
                      value={weeklyGoal}
                      onChange={(event) => setWeeklyGoal(Number(event.target.value))}
                    >
                      {Array.from({ length: 30 }, (_, index) => index + 1).map((count) => (
                        <option key={count} value={count}>{count}차시</option>
                      ))}
                    </select>
                  </label>
                </div>
              </section>
            )}
            <section className="section study-catalog" id="study-catalog">
              <div className="page-head">
                <h2 className="section-title">전체 강의 목록</h2>
                <span className="spacer" />
                <span className="hint">{courses.length}개 강의</span>
              </div>
              <p className="lede">주제를 선택해 관련 강의를 모아 보세요.</p>
              <div className="topic-filters" aria-label="주제별 강의 필터">
                {topics.map((topic) => (
                  <button
                    className={`topic-filter${selectedTopic === topic ? " is-active" : ""}`}
                    key={topic}
                    onClick={() => setSelectedTopic(topic)}
                    aria-pressed={selectedTopic === topic}
                  >
                    {topic}
                  </button>
                ))}
              </div>
              {renderCourseList(visibleCourses, "이 주제에 해당하는 강의가 없습니다.")}
            </section>
            {profile && <>
            <section className="section study-tools" id="bookmarked-courses">
              <div className="page-head">
                <h2 className="section-title">내가 찜한 강의</h2>
                <span className="spacer" />
                <span className="hint">{bookmarkedCourses.length}개</span>
              </div>
              <p className="lede">별표를 눌러 저장한 강의예요.</p>
              {renderCourseList(bookmarkedCourses, "아직 찜한 강의가 없어요. 전체 강의에서 별표를 눌러 추가해 보세요.")}
            </section>
            <section className="section study-tools" id="in-progress-courses">
              <div className="page-head">
                <h2 className="section-title">수강 중인 강의</h2>
                <span className="spacer" />
                <span className="hint">{activeCourses.length}개</span>
              </div>
              <p className="lede">수강을 시작한 강의와 마지막으로 학습한 차시를 확인할 수 있어요.</p>
              {renderCourseList(activeCourses, "아직 진행 중인 강의가 없어요. 전체 강의에서 ‘학습 시작하기’를 눌러 기록을 시작해 보세요.")}
            </section>
            <section className="section study-tools" id="completed-courses">
              <div className="page-head">
                <h2 className="section-title">수강 완료한 강의</h2>
                <span className="spacer" />
                <span className="hint">{completedCourses.length}개</span>
              </div>
              <p className="lede">모든 차시를 완료한 강의예요. 카드를 누르면 언제든 복습할 수 있어요.</p>
              {renderCourseList(completedCourses, "아직 완료한 강의가 없어요. 차시를 모두 완료하면 여기에 표시됩니다.")}
            </section>
            <section className="section study-tools" id="study-notes">
              <div className="page-head">
                <h2 className="section-title">학습 노트</h2>
                <span className="spacer" />
                <span className="hint">{savedNotesCount}개 메모 · {studyLogs.length}개 학습 정리</span>
              </div>
              <p className="lede">강의 화면 하단에서 강의별 메모를 남기고, 그날 배운 내용은 날짜별로 정리할 수 있어요.</p>
              <div className="study-notes-grid">
                <article className="study-panel">
                  <div className="study-panel-head">
                    <span className="study-panel-icon">☀</span>
                    <div><h3>오늘의 학습 정리</h3><p>오늘 수강한 강의와 배운 점을 남겨 보세요.</p></div>
                  </div>
                  <div className="study-log-fields">
                    <div>
                      <label className="study-label" htmlFor="log-date">수강 날짜</label>
                      <input
                        id="log-date"
                        className="study-select"
                        type="date"
                        value={logDate}
                        onChange={(event) => setLogDate(event.target.value)}
                      />
                    </div>
                    <div>
                      <label className="study-label" htmlFor="log-course">수강한 강의</label>
                      <select
                        id="log-course"
                        className="study-select"
                        value={logCourseId}
                        onChange={(event) => setLogCourseId(event.target.value)}
                      >
                        {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
                      </select>
                    </div>
                  </div>
                  <label className="study-label" htmlFor="daily-summary">오늘 배운 내용</label>
                  <textarea
                    id="daily-summary"
                    className="study-textarea"
                    value={logDraft}
                    onChange={(event) => setLogDraft(event.target.value)}
                    placeholder="오늘 배운 핵심, 실습한 내용, 더 공부할 점을 정리해 보세요."
                    rows={5}
                  />
                  <div className="study-form-actions">
                    <span className="hint">등록한 정리는 아래 기록에 쌓입니다.</span>
                    <button
                      className="btn btn-primary"
                      type="button"
                      disabled={!logDraft.trim()}
                      onClick={registerStudyLog}
                    >
                      학습 정리 등록
                    </button>
                  </div>
                </article>
              </div>
              <div className="study-log-history">
                <div className="page-head">
                  <h3 className="section-title">지난 학습 정리</h3>
                  <span className="spacer" />
                  <span className="hint">{studyLogs.length}개 기록</span>
                </div>
                {studyLogs.length ? (
                  <div className="study-log-list">
                    {studyLogs.map((log) => {
                      const loggedCourse = courses.find((course) => course.id === log.courseId);
                      return (
                        <article className="study-log-entry" key={log.id}>
                          <div className="study-log-entry-head">
                            <div>
                              <time dateTime={log.date}>
                                {new Date(`${log.date}T00:00:00`).toLocaleDateString("ko-KR", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </time>
                              <h4>{loggedCourse?.title ?? "강의"}</h4>
                            </div>
                            <button
                              className="btn btn-ghost btn-sm"
                              type="button"
                              aria-label="학습 정리 삭제"
                              onClick={() => setStudyLogs((current) => current.filter((item) => item.id !== log.id))}
                            >
                              삭제
                            </button>
                          </div>
                          <p>{log.content}</p>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <p className="study-empty">등록한 학습 정리가 여기에 표시됩니다.</p>
                )}
              </div>
            </section>
            </>}
          </>
        )}
      </main>
      {isLoginOpen && (
        <div className="account-modal-backdrop" onClick={() => setIsLoginOpen(false)}>
          <section className="account-modal" role="dialog" aria-modal="true" aria-labelledby="login-title" onClick={(event) => event.stopPropagation()}>
            <button className="account-modal-close" type="button" aria-label="닫기" onClick={() => setIsLoginOpen(false)}>×</button>
            <span className="account-modal-icon">🎓</span>
            <h2 id="login-title">로그인</h2>
            <p>현재는 계정 인증 서버가 연결되지 않아 데모 프로필을 제공합니다. 이름은 이 브라우저에만 저장돼요.</p>
            <form onSubmit={(event) => {
              event.preventDefault();
              const name = loginName.trim();
              if (!name) return;
              setProfile({ name });
              setLoginName("");
              setIsLoginOpen(false);
            }}>
              <label className="study-label" htmlFor="profile-name">표시할 이름</label>
              <input id="profile-name" className="study-select" value={loginName} onChange={(event) => setLoginName(event.target.value)} placeholder="예: 오르미 학습자" maxLength={24} required />
              <button className="btn btn-primary account-submit" type="submit">로그인</button>
            </form>
          </section>
        </div>
      )}
      {profile && isMyPageOpen && (
        <div className="account-modal-backdrop" onClick={() => setIsMyPageOpen(false)}>
          <section className="account-modal mypage-modal" role="dialog" aria-modal="true" aria-labelledby="mypage-title" onClick={(event) => event.stopPropagation()}>
            <button className="account-modal-close" type="button" aria-label="닫기" onClick={() => setIsMyPageOpen(false)}>×</button>
            <div className="mypage-profile">
              <span className="mypage-avatar">{profile?.name[0] ?? "🎓"}</span>
              <div>
                <h2 id="mypage-title">{profile?.name ?? "내 학습 현황"}</h2>
                <p>{profile ? "오르미 프론트엔드 학습 프로필" : "로그인 전 · 이 브라우저의 학습 기록"}</p>
              </div>
            </div>
            <div className="mypage-stats">
              <div><strong>{activeCourses.length}</strong><span>수강 중</span></div>
              <div><strong>{completedCourses.length}</strong><span>완료</span></div>
              <div><strong>{bookmarkedCourses.length}</strong><span>찜한 강의</span></div>
            </div>
            <div className="mypage-shortcuts">
              <button type="button" onClick={() => { setIsMyPageOpen(false); navigateToSection("in-progress-courses"); }}>수강 중인 강의 보기 <span>→</span></button>
              <button type="button" onClick={() => { setIsMyPageOpen(false); navigateToSection("completed-courses"); }}>완료한 강의 보기 <span>→</span></button>
              <button type="button" onClick={() => { setIsMyPageOpen(false); navigateToSection("study-notes"); }}>학습 노트 보기 <span>→</span></button>
            </div>
            {!profile && <button className="btn btn-primary account-submit" type="button" onClick={() => { setIsMyPageOpen(false); setIsLoginOpen(true); }}>데모 프로필 만들기</button>}
            <p className="account-note">학습 기록은 현재 브라우저에 저장됩니다. 실제 계정 로그인과 기기간 동기화는 인증 서버 연결 후 제공할 수 있어요.</p>
          </section>
        </div>
      )}
      <StudyAssistant />
    </div>
  );
}
