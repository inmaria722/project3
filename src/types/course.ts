export type Level = "beginner" | "intermediate" | "advanced";
export type CourseStatus = "open" | "closed" | "ongoing";

export interface Instructor {
  id: string;
  name: string;
}

export interface Course {
  id: string;
  title: string;
  instructor: Instructor;
  level: Level;
  hours: number;
  tags: string[];
  thumbnail: string | null;
  price: number;
  enrolled: number;
  status: CourseStatus;
}

export interface CourseProgress {
  currentLesson: number;
  completedLessonIndexes: number[];
  completed: boolean;
  completedLessonDates?: Record<string, string>;
}

export const LEVEL_LABEL: Record<Level, string> = {
  beginner: "초급",
  intermediate: "중급",
  advanced: "고급",
};

export const STATUS_LABEL: Record<CourseStatus, string> = {
  open: "모집중",
  closed: "마감",
  ongoing: "진행중",
};
