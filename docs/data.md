# Data Architecture Overview

## Purpose of the Backend

The SkillCert backend is responsible for managing **off-chain metadata** — all structured data that does not live on the blockchain. This includes user accounts, course content, enrollment records, progress tracking, quiz attempts, and reviews.

The frontend communicates with this API to display course catalogues, track learner progress, and submit reviews. Any on-chain activity (e.g. certificate issuance) is handled separately; this backend stores and serves the supporting metadata around it.

The database is **PostgreSQL**, accessed through **TypeORM** with a snake_case naming strategy applied globally.

---

## Entity Relationship Breakdown

### Users

Table: `users`

A `User` represents anyone registered on the platform. Users have one of two roles: `USER` (a learner) or a professor/admin role. They can optionally link a blockchain wallet address for on-chain interactions.

**Key fields:**
- `id` — UUID primary key
- `name` — display name
- `email` — unique login email
- `password` — hashed password (bcrypt)
- `role` — enum: `USER` or higher privilege roles
- `walletAddress` — optional, unique, 42-char blockchain address

**Relationships:**
- A user can **create many courses** (as a professor)
- A user can **enroll in many courses**
- A user can **write many reviews**

---

### Courses

Table: `courses`

A `Course` is the top-level learning unit. It is created and owned by a professor (a `User`). It belongs to one `Category` and can have learning `Objective`s defined for it.

**Key fields:**
- `id` — UUID primary key
- `title`, `description`
- `professorId` — FK to `users`
- `categoryId` — FK to `categories` (nullable)

**Relationships:**
- Belongs to one **User** (professor)
- Belongs to one **Category**
- Has many **Modules**
- Has many **Enrollments**
- Has many **Reviews**
- Has many **Objectives**

---

### Categories

Table: `categories`

A flat lookup table used to classify courses (e.g. "Web Development", "Blockchain", "Design").

**Relationships:**
- Has many **Courses**

---

### Objectives

Table: `objectives`

Learning objectives state what a learner will achieve after completing a course. They are cascaded with the course — deleting a course removes its objectives.

**Relationships:**
- Belongs to one **Course**

---

### Modules

Table: `modules`

A `Module` is a named section within a course (e.g. "Introduction", "Advanced Topics"). Courses are divided into modules to group related lessons.

**Key fields:**
- `id` — UUID primary key
- `title`, `description`
- `course_id` — FK to `courses`

**Relationships:**
- Belongs to one **Course**
- Has many **Lessons**

---

### Lessons

Table: `lessons`

A `Lesson` is an individual content unit inside a module. It can be one of three types: `text`, `video`, or `quiz`.

**Key fields:**
- `id` — UUID primary key
- `title`, `content`
- `type` — enum: `text | video | quiz`
- `module_id` — FK to `modules`

**Relationships:**
- Belongs to one **Module**
- Has many **CourseProgress** records
- Has one **Quiz** (when type is `quiz`)

---

### Quizzes

Table: `quizzes`

A `Quiz` is attached to a lesson of type `quiz`. It holds the quiz title, description, and a collection of questions.

**Key fields:**
- `lesson_id` — FK to `lessons`

**Relationships:**
- Belongs to one **Lesson**
- Has many **Questions**

---

### Questions & Answers

Tables: `questions`, `answers`

Each `Question` belongs to a `Quiz` and has multiple `Answer` options. One answer is marked correct.

**Relationships:**
- `Question` belongs to one **Quiz**
- `Question` has many **Answers**

---

### Enrollments

Table: `enrollments`

An `Enrollment` is the join record between a `User` and a `Course`. Each user-course pair is unique (enforced via a composite unique constraint). An enrollment can be deactivated (`isActive: false`) without being deleted.

**Key fields:**
- `user` — FK to `users` (CASCADE delete)
- `course` — FK to `courses` (CASCADE delete)
- `isActive` — boolean, defaults to `true`
- `enrolledAt` — timestamp

**Relationships:**
- Belongs to one **User**
- Belongs to one **Course**
- Has many **CourseProgress** records

---

### Course Progress

Table: `course_progress`

Tracks which lessons a learner has completed within an enrollment. Each record links an enrollment to a specific lesson.

**Relationships:**
- Belongs to one **Enrollment**
- Belongs to one **Lesson**

---

### Reviews

Table: `reviews`

A `Review` is a rating and optional written feedback left by a user on a course. The primary key is a **composite key** of `userId + courseId`, meaning one user can only review a course once.

**Key fields:**
- `userId` + `courseId` — composite primary key
- `rating` — integer 1–5 (validated in code)
- `title`, `content` — optional text fields

**Relationships:**
- Belongs to one **User**
- Belongs to one **Course**

---

### References & Lesson Resources

Tables: `references`, `lesson_resources`

These tables store supplementary material attached to lessons — external links (`references`) and uploaded files or media (`lesson_resources`). Both are currently partially implemented (relationships are commented out in the `Lesson` entity).

---

## Entity Relationship Diagram (Text)

```
users
 ├── [1:N] → courses         (professor creates courses)
 ├── [1:N] → enrollments     (user enrolls in courses)
 └── [1:N] → reviews         (user reviews courses)

courses
 ├── [N:1] → users           (owned by a professor)
 ├── [N:1] → categories      (classified under a category)
 ├── [1:N] → modules         (divided into modules)
 ├── [1:N] → enrollments     (students enroll)
 ├── [1:N] → reviews         (receives reviews)
 └── [1:N] → objectives      (has learning objectives)

modules
 ├── [N:1] → courses
 └── [1:N] → lessons

lessons
 ├── [N:1] → modules
 ├── [1:N] → course_progress
 └── [1:1] → quizzes         (when type = 'quiz')

quizzes
 ├── [N:1] → lessons
 └── [1:N] → questions
              └── [1:N] → answers

enrollments
 ├── [N:1] → users
 ├── [N:1] → courses
 └── [1:N] → course_progress

course_progress
 ├── [N:1] → enrollments
 └── [N:1] → lessons

reviews
 ├── [N:1] → users           (composite PK: userId + courseId)
 └── [N:1] → courses
```

---

## How Off-Chain Data Syncs with the Frontend

The frontend communicates with this API exclusively over HTTP. There is no real-time socket layer — all data fetching is request-driven.

The typical data flows are:

**Course discovery:** Frontend calls `GET /courses` (with optional category/pagination filters) → backend queries `courses` joined with `categories`, `professor`, and aggregated review ratings.

**Enrollment:** Frontend calls `POST /enrollments` with a user ID and course ID → backend creates an `Enrollment` record, which acts as the gateway for progress tracking.

**Progress tracking:** As a learner completes lessons, the frontend calls the course-progress endpoints → backend upserts `CourseProgress` records tied to the enrollment.

**Reviews:** After completing a course, the frontend submits `POST /reviews` → backend validates the rating (1–5), checks the composite key constraint, and stores the record.

**Quiz submission:** Frontend submits answers via `POST /quiz/:id/submit` → the quiz validation service scores the attempt, stores a `QuizAttempt`, and returns the result.

**Wallet linking:** Users can optionally call `PATCH /users/:id/wallet` to link their blockchain wallet address, enabling on-chain certificate verification flows.