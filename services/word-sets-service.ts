import type {
  MockClassSummary,
  MockWord,
  MockWordSetDetails,
  MockWordSetSummary,
} from "../types/mock.ts";
import type { ApiClient } from "./api-client.ts";
import {
  wordSetsService as mockWordSetsService,
  type CreateWordSetInput,
  type WordInput,
  type WordProfileInput,
  type WordSetOverviewInput,
} from "./mock-services.ts";
import {
  apiClient,
  isBackendMode,
  type DataSource,
} from "./service-runtime.ts";

export type {
  CreateWordSetInput,
  WordInput,
  WordProfileInput,
  WordSetOverviewInput,
};

export interface WordSetsService {
  listWordSetSummaries(): Promise<MockWordSetSummary[]>;
  getWordSetDetails(id: string): Promise<MockWordSetDetails | undefined>;
  createWordSet(input: CreateWordSetInput): Promise<MockWordSetSummary>;
  updateWordSetOverview(
    id: string,
    input: WordSetOverviewInput,
  ): Promise<MockWordSetDetails>;
  deleteWordSet(id: string): Promise<{ id: string }>;
  assignToClass(
    wordSetId: string,
    classItem: MockClassSummary,
  ): Promise<MockClassSummary>;
  addWords(wordSetId: string, input: WordInput[]): Promise<MockWord[]>;
  updateWord(wordSetId: string, input: WordProfileInput): Promise<MockWord>;
  deleteWord(wordSetId: string, wordId: string): Promise<{ wordId: string }>;
  deleteWords(
    wordSetId: string,
    wordIds: string[],
  ): Promise<{ wordIds: string[] }>;
}

export function createWordSetsService({
  client = apiClient,
  dataSource,
}: {
  client?: ApiClient;
  dataSource?: DataSource;
} = {}): WordSetsService {
  const usesBackend = () => dataSource === "backend" || (!dataSource && isBackendMode());

  return {
    async listWordSetSummaries() {
      if (!usesBackend()) {
        return mockWordSetsService.listWordSetSummaries();
      }

      return client.get<MockWordSetSummary[]>("/teacher/word-sets");
    },

    async getWordSetDetails(id) {
      if (!usesBackend()) {
        return mockWordSetsService.getWordSetDetails(id);
      }

      return client.get<MockWordSetDetails>(`/teacher/word-sets/${id}`);
    },

    async createWordSet(input) {
      if (!usesBackend()) {
        return mockWordSetsService.createWordSet(input);
      }

      return client.post<MockWordSetSummary, CreateWordSetInput>(
        "/teacher/word-sets",
        input,
      );
    },

    async updateWordSetOverview(id, input) {
      if (!usesBackend()) {
        return mockWordSetsService.updateWordSetOverview(id, input);
      }

      return client.put<MockWordSetDetails, WordSetOverviewInput>(
        `/teacher/word-sets/${id}`,
        input,
      );
    },

    async deleteWordSet(id) {
      if (!usesBackend()) {
        return mockWordSetsService.deleteWordSet(id);
      }

      return client.delete<{ id: string }>(`/teacher/word-sets/${id}`);
    },

    async assignToClass(wordSetId, classItem) {
      if (!usesBackend()) {
        return mockWordSetsService.assignToClass(wordSetId, classItem);
      }

      await client.post<
        { id: string; classId: string; wordSetId: string },
        { classId: string; wordSetId: string }
      >("/teacher/assignments", {
        classId: classItem.id,
        wordSetId,
      });

      return classItem;
    },

    async addWords(wordSetId, input) {
      if (!usesBackend()) {
        return mockWordSetsService.addWords(wordSetId, input);
      }

      return client.post<MockWord[], { words: WordInput[] }>(
        `/teacher/word-sets/${wordSetId}/words`,
        { words: input },
      );
    },

    async updateWord(wordSetId, input) {
      if (!usesBackend()) {
        return mockWordSetsService.updateWord(wordSetId, input);
      }

      const { id, ...body } = input;

      return client.put<MockWord, WordInput>(
        `/teacher/word-sets/${wordSetId}/words/${id}`,
        body,
      );
    },

    async deleteWord(wordSetId, wordId) {
      if (!usesBackend()) {
        return mockWordSetsService.deleteWord(wordSetId, wordId);
      }

      return client.delete<{ wordId: string }>(
        `/teacher/word-sets/${wordSetId}/words/${wordId}`,
      );
    },

    async deleteWords(wordSetId, wordIds) {
      if (!usesBackend()) {
        return mockWordSetsService.deleteWords(wordSetId, wordIds);
      }

      return client.post<{ wordIds: string[] }, { wordIds: string[] }>(
        `/teacher/word-sets/${wordSetId}/words/bulk-delete`,
        { wordIds },
      );
    },
  };
}

export const wordSetsService = createWordSetsService();
