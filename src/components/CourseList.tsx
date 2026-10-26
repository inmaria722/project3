import type { Course, CourseProgress } from "../types/course";
import CourseCard from "./CourseCard";

interface CourseListProps {
  courses: Course[];
  onSelect: (id: string) => void;
  onBookmark: (id: string) => void;
  bookmarkedIds: string[];
  progressByCourse: Record<string, CourseProgress>;
  currentLessonTitles: Record<string, string>;
  lessonCounts: Record<string, number>;
  onStartCourse: (id: string) => void;
  emptyMessage?: string;
}

export default function CourseList({
  courses,
  onSelect,
  onBookmark,
  bookmarkedIds,
  progressByCourse,
  currentLessonTitles,
  lessonCounts,
  onStartCourse,
  emptyMessage = "조건에 맞는 강의가 없습니다",
}: CourseListProps) {
  if (courses.length === 0) {
    return (
      <div className="state">
        <div className="state-icon">🔍</div>
        <p className="state-title">{emptyMessage}</p>
        <p className="state-desc">다른 조건으로 찾아보세요.</p>
      </div>
    );
  }

  return (
    <div className="course-list">
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          onSelect={onSelect}
          onBookmark={onBookmark}
          isBookmarked={bookmarkedIds.includes(course.id)}
          progress={progressByCourse[course.id]}
          currentLessonTitle={currentLessonTitles[course.id]}
          lessonCount={lessonCounts[course.id]}
          onStartCourse={onStartCourse}
        />
      ))}
    </div>
  );
}
