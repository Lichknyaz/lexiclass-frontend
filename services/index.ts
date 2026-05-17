export {
  AUTH_STORAGE_KEY,
  authService,
  createAuthService,
  type AuthService,
  type AuthStorage,
  type LoginInput,
  type RegisterInput,
} from "./auth-service";
export {
  ApiError,
  createApiClient,
  joinUrl,
  parseApiErrorMessage,
  type ApiClient,
  type ApiClientOptions,
  type ApiRequestOptions,
} from "./api-client";
export {
  classesService,
  type ClassOverviewInput,
  type CreateClassInput,
  type StudentInput,
  type StudentProfileInput,
} from "./classes-service";
export {
  wordSetsService,
  type CreateWordSetInput,
  type WordInput,
  type WordProfileInput,
  type WordSetOverviewInput,
} from "./word-sets-service";
export { studentService } from "./student-service";
export {
  assignmentsService,
  type AssignmentInput,
  type MockAssignment,
} from "./assignments-service";
export {
  practiceService,
  type PracticeAttemptInput,
  type PracticeSessionResult,
  type PracticeWordResult,
  type SavePracticeSessionInput,
  type StoredPracticeAttempt,
} from "./practice-service";
export {
  analyticsService,
  type TeacherAnalytics,
} from "./analytics-service";
