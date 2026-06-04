# LexiClass API Contracts Draft

This document defines the first backend API target for the current frontend service boundary. It is intentionally scoped to the MVP cycle:

```text
teacher creates class -> teacher creates word set -> teacher assigns word set -> student practices -> backend stores attempts -> teacher views progress/problem words
```

Base URL for local development:

```text
http://localhost:4000/api/v1
```

Interactive Swagger documentation for the implemented backend:

```text
http://localhost:4000/api/docs
```

Swagger uses the same JWT access token returned by `POST /api/v1/auth/login`.

All authenticated endpoints use:

```http
Authorization: Bearer <accessToken>
Content-Type: application/json
Accept: application/json
```

## Conventions

- IDs are strings.
- Timestamps are ISO 8601 strings.
- Response bodies use `camelCase`.
- Error response shape:

```json
{
  "message": "Human-readable error message",
  "code": "OPTIONAL_MACHINE_CODE",
  "details": {}
}
```

## Core Types

```ts
type UserRole = "teacher" | "student";
type PracticeMode = "flashcard" | "multiple_choice" | "writing";
type AnswerStatus = "correct" | "wrong";

interface UserDto {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthSessionDto {
  user: UserDto;
  accessToken: string;
}

interface ClassSummaryDto {
  id: string;
  name: string;
  students: number;
  wordSets: number;
  progress: number;
}

interface StudentDto {
  id: string;
  name: string;
  email: string;
  progress: number;
  correctAnswers: number;
  wrongAnswers: number;
  lastPracticedAt: string | null;
}

interface WordSetSummaryDto {
  id: string;
  title: string;
  description: string;
  words: number;
  assignedClasses: number;
}

interface WordDto {
  id: string;
  term: string;
  translation: string;
  exampleSentence: string;
  transcription?: string | null;
  masteryLevel: number;
  correctAnswers: number;
  wrongAnswers: number;
}

interface AssignmentDto {
  id: string;
  classId: string;
  wordSetId: string;
  assignedAt: string;
}

interface ProblemWordDto {
  id: string;
  term: string;
  translation: string;
  wrongAnswers: number;
  correctAnswers: number;
  affectedStudents: number;
}
```

## Health

### Health Check

```http
GET /health
```

Response `200`:

```json
{
  "status": "ok"
}
```

## Auth

### Register

```http
POST /auth/register
```

Request:

```json
{
  "name": "Anna Teacher",
  "email": "anna@example.com",
  "password": "password",
  "role": "teacher"
}
```

Response `201`:

```ts
AuthSessionDto
```

### Login

```http
POST /auth/login
```

Request:

```json
{
  "email": "anna@example.com",
  "password": "password",
  "role": "teacher"
}
```

Response `200`:

```ts
AuthSessionDto
```

### Current User

```http
GET /auth/me
```

Response `200`:

```ts
UserDto
```

### Logout

```http
POST /auth/logout
```

Response `204`: no body.

## Teacher Classes

### List Classes

```http
GET /teacher/classes
```

Response `200`:

```ts
ClassSummaryDto[]
```

### Create Class

```http
POST /teacher/classes
```

Request:

```json
{
  "name": "English A2"
}
```

Response `201`:

```ts
ClassSummaryDto
```

### Get Class Details

```http
GET /teacher/classes/:classId
```

Response `200`:

```ts
interface ClassDetailsDto extends ClassSummaryDto {
  inviteCode: string;
  level: string;
  description: string;
  studentsList: StudentDto[];
  wordSetsList: Array<{
    id: string;
    classId: string;
    title: string;
    description: string;
    words: number;
    assignedStudents: number;
    averageProgress: number;
  }>;
  problemWords: ProblemWordDto[];
}
```

### Update Class

```http
PUT /teacher/classes/:classId
```

Request:

```json
{
  "name": "English A2",
  "description": "Core everyday vocabulary.",
  "level": "A2"
}
```

Response `200`:

```ts
ClassDetailsDto
```

### Delete Class

```http
DELETE /teacher/classes/:classId
```

Response `200`:

```json
{
  "id": "class-id"
}
```

## Students And Membership

### Add Student To Class

```http
POST /teacher/classes/:classId/students
```

Request:

```json
{
  "name": "Student Name",
  "email": "student@example.com"
}
```

Response `201`:

```ts
StudentDto
```

### Update Student In Class

```http
PUT /teacher/classes/:classId/students/:studentId
```

Request:

```json
{
  "name": "Updated Student",
  "email": "updated@example.com"
}
```

Response `200`:

```ts
StudentDto
```

### Remove Student From Class

```http
DELETE /teacher/classes/:classId/students/:studentId
```

Response `200`:

```json
{
  "studentId": "student-id"
}
```

### Student Joins Class

```http
POST /student/classes/join
```

Request:

```json
{
  "inviteCode": "A2-7KQ9"
}
```

Response `201`:

```ts
interface StudentClassDto {
  id: string;
  name: string;
  teacherName: string;
  level: string;
  progress: number;
  wordSets: StudentAssignedWordSetDto[];
}
```

## Word Sets

### List Word Sets

```http
GET /teacher/word-sets
```

Response `200`:

```ts
WordSetSummaryDto[]
```

### Create Word Set

```http
POST /teacher/word-sets
```

Request:

```json
{
  "title": "Daily routines",
  "description": "Common everyday verbs."
}
```

Response `201`:

```ts
WordSetSummaryDto
```

### Get Word Set Details

```http
GET /teacher/word-sets/:wordSetId
GET /student/word-sets/:assignmentId
```

Teacher response resolves by `wordSetId`. Student response resolves by `assignmentId` and must verify the authenticated student belongs to the assigned class.

Response `200`:

```ts
interface WordSetDetailsDto {
  id: string;
  classId: string;
  className: string;
  title: string;
  description: string;
  words: number;
  assignedStudents: number;
  averageProgress: number;
  createdAt: string;
  wordsList: WordDto[];
}
```

### Update Word Set

```http
PUT /teacher/word-sets/:wordSetId
```

Request:

```json
{
  "title": "Updated routines",
  "description": "Updated description.",
  "tag": "A2"
}
```

Response `200`:

```ts
WordSetDetailsDto
```

### Delete Word Set

```http
DELETE /teacher/word-sets/:wordSetId
```

Response `200`:

```json
{
  "id": "word-set-id"
}
```

## Words

### Add Words

```http
POST /teacher/word-sets/:wordSetId/words
```

Request:

```json
{
  "words": [
    {
      "term": "borrow",
      "translation": "take and return later",
      "exampleSentence": "Can I borrow your dictionary?",
      "transcription": null
    }
  ]
}
```

Response `201`:

```ts
WordDto[]
```

### Update Word

```http
PUT /teacher/word-sets/:wordSetId/words/:wordId
```

Request:

```json
{
  "term": "borrow",
  "translation": "take and return later",
  "exampleSentence": "Can I borrow your dictionary?",
  "transcription": null
}
```

Response `200`:

```ts
WordDto
```

### Delete Word

```http
DELETE /teacher/word-sets/:wordSetId/words/:wordId
```

Response `200`:

```json
{
  "wordId": "word-id"
}
```

### Bulk Delete Words

```http
POST /teacher/word-sets/:wordSetId/words/bulk-delete
```

Request:

```json
{
  "wordIds": ["word-1", "word-2"]
}
```

Response `200`:

```json
{
  "wordIds": ["word-1", "word-2"]
}
```

## Assignments

### Assign Word Set To Class

```http
POST /teacher/assignments
```

Request:

```json
{
  "classId": "class-id",
  "wordSetId": "word-set-id"
}
```

Response `201`:

```ts
AssignmentDto
```

Rules:

- Assignment is unique by `classId + wordSetId`.
- Creating an existing assignment returns the existing assignment record.
- The current NestJS endpoint responds with the standard POST `201` status for both newly created and existing assignment records.

### List Assignments

```http
GET /teacher/assignments?classId=:classId&wordSetId=:wordSetId
```

Query parameters are optional.

Response `200`:

```ts
AssignmentDto[]
```

### Student Assigned Word Sets

```http
GET /student/assignments
```

Response `200`:

```ts
interface StudentAssignedWordSetDto {
  id: string;
  classId: string;
  className: string;
  title: string;
  words: number;
  completedWords: number;
  progress: number;
  dueLabel: string;
}

StudentAssignedWordSetDto[]
```

Rules:

- `id` is the `assignmentId`, not the base `wordSetId`.
- Backend must return only assignments for classes joined by the authenticated student.

## Practice Attempts

### Save Practice Session

```http
POST /student/practice-sessions
```

Request:

```json
{
  "assignmentId": "assignment-id",
  "mode": "writing",
  "attempts": [
    {
      "wordId": "word-id",
      "status": "correct",
      "answeredAt": "2026-05-17T10:00:00.000Z"
    }
  ]
}
```

Backend derives `studentId` from the authenticated user. The frontend may keep sending `studentId` during mock mode, but the backend should not trust client-provided identity.

API practice mode values are `flashcard`, `multiple_choice`, and `writing`. The frontend maps its internal UI value `multiple-choice` to API value `multiple_choice` before sending backend requests.

Response `201`:

```ts
interface PracticeSessionResultDto {
  assignmentId: string;
  studentId: string;
  mode: PracticeMode;
  correctAnswers: number;
  wrongAnswers: number;
  wordResults: Array<{
    wordId: string;
    correctAnswers: number;
    wrongAnswers: number;
  }>;
}
```

Stored attempt shape:

```ts
interface PracticeAttemptDto {
  id: string;
  assignmentId: string;
  studentId: string;
  wordId: string;
  status: AnswerStatus;
  mode: PracticeMode;
  answeredAt: string;
}
```

## Student Progress

### Joined Classes

```http
GET /student/classes
```

Response `200`:

```ts
StudentClassDto[]
```

### Progress Words

```http
GET /student/progress/words
```

Response `200`:

```ts
interface StudentProgressWordDto {
  id: string;
  assignmentId: string;
  term: string;
  translation: string;
  masteryLevel: number;
  correctCount: number;
  wrongCount: number;
  lastPracticedAt: string | null;
}

StudentProgressWordDto[]
```

## Teacher Analytics

### Analytics Overview

```http
GET /teacher/analytics?classId=:classId&problemWordWindow=:window
```

Query parameters:

- `classId` optional. If present, return analytics scoped to that class.
- `problemWordWindow` optional. Allowed values: `14`, `30`, `90`, `all`. Defaults to `14`.

Response `200`:

```ts
interface TeacherAnalyticsDto {
  totalStudents: number;
  totalWordSets: number;
  averageProgress: number;
  classProgress: ClassDetailsDto[];
  problemWords: ProblemWordDto[];
}
```

Rules:

- `problemWords` must be derived from stored practice attempts.
- For `problemWordWindow = 14 | 30 | 90`, `problemWords` are limited to attempts in that time window and include only words with at least one wrong answer and a wrong-answer rate of at least 40%.
- For `problemWordWindow = all`, `problemWords` include every historical word with at least one wrong answer.
- `affectedStudents` is the count of distinct students with at least one wrong attempt for that word.
- `averageProgress` should be derived from assignment/word completion, not static counters.

## MVP Authorization Rules

- Teacher endpoints require `role = teacher`.
- Student endpoints require `role = student`.
- A teacher can access only classes and word sets they own.
- A student can access only classes they joined.
- A student can practice only assignments belonging to joined classes.
- Practice attempt `studentId` is backend-derived from the token.

## Backend Data Model Target

Minimum persistent entities:

- `User`
- `Class`
- `ClassEnrollment`
- `WordSet`
- `Word`
- `Assignment`
- `PracticeAttempt`

Recommended unique constraints:

- `User.email`
- `Class.inviteCode`
- `ClassEnrollment(classId, studentId)`
- `Assignment(classId, wordSetId)`
- `Word(wordSetId, term)`

## Frontend Migration Notes

Current frontend domain files can map to these endpoints:

- `auth-service.ts` -> `/auth/*`
- `classes-service.ts` -> `/teacher/classes/*`
- `word-sets-service.ts` -> `/teacher/word-sets/*` and `/student/word-sets/*`
- `assignments-service.ts` -> `/teacher/assignments`, `/student/assignments`
- `practice-service.ts` -> `/student/practice-sessions`
- `analytics-service.ts` -> `/teacher/analytics`

Keep mock mode until backend endpoints are available, then replace one domain facade at a time.
