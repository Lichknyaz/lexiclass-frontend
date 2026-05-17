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
  analyticsService,
  classesService,
  practiceService,
  studentService,
  wordSetsService,
  type CreateClassInput,
  type PracticeAttemptInput,
  type PracticeSessionResult,
  type PracticeWordResult,
  type SavePracticeSessionInput,
  type StoredPracticeAttempt,
  type TeacherAnalytics,
} from "./mock-services";
