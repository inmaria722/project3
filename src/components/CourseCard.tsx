import type { ReactNode } from "react";
import type { Course, CourseProgress } from "../types/course";
import { LEVEL_LABEL } from "../types/course";
import Badge from "./Badge";

interface CourseCardProps {
  course: Course;
  onSelect: (id: string) => void;
  onBookmark?: (id: string) => void;
  isBookmarked?: boolean;
  progress?: CourseProgress;
  currentLessonTitle?: string;
  lessonCount: number;
  onStartCourse: (id: string) => void;
  showInstructor?: boolean;
  footer?: ReactNode;
}

export default function CourseCard({
  course,
  onSelect,
  onBookmark,
  isBookmarked = false,
  progress,
  currentLessonTitle,
  lessonCount,
  onStartCourse,
  showInstructor = true,
  footer,
}: CourseCardProps) {
  return (
    <div
      className="course-card"
      role="button"
      tabIndex={0}
      onClick={() => onSelect(course.id)}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(course.id);
        }
      }}
    >
      {course.thumbnail && (
        <img className="course-thumb" src={course.thumbnail} alt="" />
      )}
      {!course.thumbnail && (
        <div className={`course-cover course-cover-${course.id}`} aria-hidden="true">
          <span>{course.tags[0]}</span>
        </div>
      )}

      {onBookmark && (
        <button
          className={`bookmark-btn${isBookmarked ? " is-on" : ""}`}
          aria-label={isBookmarked ? "찜 취소" : "강의 찜하기"}
          aria-pressed={isBookmarked}
          onClick={(event) => {
            event.stopPropagation();
            onBookmark(course.id);
          }}
        >
          {isBookmarked ? "★" : "☆"}
        </button>
      )}

      <div className="course-body">
        <h3 className="course-title">{course.title}</h3>

        {showInstructor && (
          <p className="course-instructor">
            <span className="avatar">{course.instructor.name[0]}</span>
            {course.instructor.name}
          </p>
        )}

        <div className="course-badges">
          <Badge>{LEVEL_LABEL[course.level]}</Badge>
          <Badge tone={progress?.completed ? "brand" : progress ? "success" : "default"}>
            {progress?.completed ? "수강 완료" : progress ? "수강 중" : "미수강"}
          </Badge>
          {course.tags.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>

        <div className="course-meta">
          <span>{course.hours.toLocaleString("ko-KR")}시간</span>
          <span className="dot" />
          <span>{course.tags[0]}</span>
        </div>

        <div className="course-footer">
          {footer}
          {progress && !progress.completed ? (
            <>
              <div className="course-progress-summary">
                <span className="course-current-title">
                  현재 {progress.currentLesson + 1}차시 · {currentLessonTitle}
                </span>
                <div className="course-progress-line">
                  <progress
                    className="study-progress-bar"
                    value={progress.completedLessonIndexes.length}
                    max={lessonCount}
                    aria-label={`강의 진도 ${Math.round((progress.completedLessonIndexes.length / lessonCount) * 100)}%`}
                  />
                  <span>{progress.completedLessonIndexes.length}/{lessonCount} 완료</span>
                </div>
              </div>
            <button
                className="btn btn-primary btn-sm"
                onClick={(event) => {
                  event.stopPropagation();
                  onSelect(course.id);
                }}
            >
                이어서 학습 <span aria-hidden="true">→</span>
              </button>
            </>
          ) : progress?.completed ? (
            <>
              <span className="completed-course-label">✓ 모든 차시 완료</span>
              <button
                className="btn btn-sm"
                onClick={(event) => {
                  event.stopPropagation();
                  onSelect(course.id);
                }}
              >
                복습하기 <span aria-hidden="true">→</span>
              </button>
            </>
          ) : (
            <button
              className="btn btn-primary btn-sm"
              onClick={(event) => {
                event.stopPropagation();
                onStartCourse(course.id);
                onSelect(course.id);
              }}
            >
              학습 시작하기 <span aria-hidden="true">→</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
