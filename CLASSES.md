# CSS 클래스 사전

**`catalog.css` 는 수정하지 마세요.** 아래 클래스를 붙이기만 하면 화면이 완성됩니다.
필요한 조각을 찾아 그대로 복사해 쓰고, 안의 내용만 바꾸세요.

> ⚠️ **인라인 `style` 은 쓰지 않습니다.** 이 실습에는 예외가 없습니다.

---

## 1. 뱃지 — 2단계에서 만들 것

```jsx
<span className="badge">React</span>
<span className="badge badge-success">모집중</span>
<span className="badge badge-warning">진행중</span>
<span className="badge badge-danger">마감</span>
<span className="badge badge-brand">추천</span>
```

`badge` 만 쓰면 기본(회색)입니다. 뒤에 붙는 것이 색을 정합니다.

---

## 2. 강의 카드 — 3단계에서 만들 것

```jsx
<div className="course-card">
  {/* 썸네일이 있을 때만 */}
  <img className="course-thumb" src={course.thumbnail} alt="" />

  {/* 북마크 버튼 — 카드 오른쪽 위에 겹쳐 뜹니다 */}
  <button className="bookmark-btn">☆</button>

  <div className="course-body">
    <h3 className="course-title">React 입문 — 컴포넌트부터 훅까지</h3>

    <p className="course-instructor">
      <span className="avatar">허</span>
      허승범
    </p>

    <div className="course-badges">
      <span className="badge">초급</span>
      <span className="badge badge-success">모집중</span>
      <span className="badge">React</span>
    </div>

    <div className="course-meta">
      <span>24시간</span>
      <span className="dot" />
      <span>1,243명 수강</span>
      <span className="spacer" />
      <strong className="course-price is-free">무료</strong>
    </div>

    {/* footer 가 있을 때만 */}
    <div className="course-footer">3일 남음</div>
  </div>
</div>
```

### 변형

| 클래스 | 언제 |
|---|---|
| `course-card is-closed` | 마감된 강의 — 흐리게 보입니다 |
| `course-price is-free` | 무료 강의 — 초록색이 됩니다 |
| `bookmark-btn is-on` | 북마크된 상태 — 노란색이 됩니다 |

### 아바타

이름의 **첫 글자**를 넣으세요.

```jsx
<span className="avatar">{course.instructor.name[0]}</span>
```

---

## 3. 목록 — 4단계에서 만들 것

```jsx
<div className="course-list">
  {/* course-card 들이 들어갑니다. 반응형 격자는 CSS 가 알아서 합니다 */}
</div>
```

---

## 4. 비어 있을 때

```jsx
<div className="state">
  <div className="state-icon">🔍</div>
  <p className="state-title">조건에 맞는 강의가 없습니다</p>
  <p className="state-desc">다른 조건으로 찾아보세요.</p>
</div>
```

좁은 곳에서는 `state is-inline` 으로 여백을 줄이세요.

---

## 5. 버튼 — 보너스 단계에서

| 클래스 | 모양 |
|---|---|
| `btn` | 기본 |
| `btn btn-primary` | 파란 채움 |
| `btn btn-danger` | 빨강 글자 |
| `btn btn-ghost` | 테두리 없음 |
| `btn btn-sm` / `btn-md` / `btn-lg` | 크기 |
| `btn btn-block` | 가로 꽉 채움 |

```jsx
<button className="btn btn-primary btn-lg">수강 신청</button>
<button className="btn btn-ghost btn-sm" disabled>대기</button>
```

`disabled` 를 붙이면 흐려지고 눌리지 않습니다.

---

## 6. 자잘한 것들

```jsx
<span className="spacer" />        {/* 남는 공간을 밀어냅니다 */}
<span className="dot" />           {/* 가운뎃점 구분자 */}
<span className="hint">6개</span>  {/* 흐린 작은 글씨 */}
<span className="count">3</span>   {/* 동그란 숫자 뱃지 */}
```

---

## 자주 하는 실수

| 실수 | 대신 |
|---|---|
| 인라인 `style` 로 색·여백 지정 | 위 클래스 조합으로 해결됩니다 |
| `catalog.css` 에 클래스 추가 | 필요한 게 없다면 강사에게 물어보세요 |
| 카드 전체를 `<button>` 으로 감쌈 | 안에 북마크 버튼이 들어갑니다. **버튼 안에 버튼은 안 됩니다** |
| 썸네일이 없는데 `<img>` 를 그림 | 깨진 이미지가 보입니다. **있을 때만** 그리세요 |
| 뱃지에 `badge` 를 빠뜨리고 색만 붙임 | `badge badge-success` 처럼 **둘 다** |
