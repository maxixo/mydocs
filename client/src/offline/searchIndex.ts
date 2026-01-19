import MiniSearch from "minisearch";
import type { DocumentState } from "../types";
import { getMeta, setMeta } from "./indexedDb";
import { getTipTapText } from "../utils/tiptapContent";
import { debounce } from "../utils/debounce";

export type SearchResult = {
  id: string;
  title: string;
  workspaceId: string;
  updatedAt?: string;
  score: number;
};

type IndexableDocument = {
  id: string;
  title: string;
  workspaceId: string;
  updatedAt?: string;
  content?: DocumentState["content"] | unknown;
};

type IndexedDocument = {
  id: string;
  title: string;
  content: string;
  workspaceId: string;
  updatedAt?: string;
};

type SerializedIndex = ReturnType<MiniSearch<IndexedDocument>["toJSON"]>;

type StoredIndexSnapshot = {
  version: number;
  workspaceId: string;
  updatedAt: number;
  index: SerializedIndex;
};

const INDEX_VERSION = 1;
const INDEX_META_PREFIX = "search-index:";
const SEARCH_BOOST = { title: 2 };
const SAVE_DEBOUNCE_MS = 500;

const createIndex = () =>
  new MiniSearch<IndexedDocument>({
    fields: ["title", "content"],
    storeFields: ["title", "workspaceId", "updatedAt"],
    idField: "id"
  });

const indexCache = new Map<string, MiniSearch<IndexedDocument>>();
const lastIndexedContent = new Map<string, string>();
const persistQueue = new Map<string, ReturnType<typeof debounce>>();

const getIndexKey = (workspaceId: string) => `${INDEX_META_PREFIX}${workspaceId}`;

const getIndex = async (workspaceId: string): Promise<MiniSearch<IndexedDocument>> => {
  if (indexCache.has(workspaceId)) {
    return indexCache.get(workspaceId)!;
  }

  const stored = await getMeta<StoredIndexSnapshot>(getIndexKey(workspaceId));
  if (stored?.index && stored.version === INDEX_VERSION) {
    try {
      const restored = MiniSearch.loadJSON(stored.index, {
        fields: ["title", "content"],
        storeFields: ["title", "workspaceId", "updatedAt"],
        idField: "id"
      });
      indexCache.set(workspaceId, restored);
      return restored;
    } catch {
      // Fall back to a fresh index if the snapshot cannot be restored.
    }
  }

  const fresh = createIndex();
  indexCache.set(workspaceId, fresh);
  return fresh;
};

const persistIndex = async (workspaceId: string, index: MiniSearch<IndexedDocument>): Promise<void> => {
  const snapshot: StoredIndexSnapshot = {
    version: INDEX_VERSION,
    workspaceId,
    updatedAt: Date.now(),
    index: index.toJSON()
  };
  try {
    await setMeta(getIndexKey(workspaceId), snapshot);
  } catch {
    // Ignore IndexedDB failures to avoid blocking editor updates.
  }
};

const schedulePersist = (workspaceId: string, index: MiniSearch<IndexedDocument>) => {
  let schedule = persistQueue.get(workspaceId);
  if (!schedule) {
    schedule = debounce((nextIndex: MiniSearch<IndexedDocument>) => {
      void persistIndex(workspaceId, nextIndex);
    }, SAVE_DEBOUNCE_MS);
    persistQueue.set(workspaceId, schedule);
  }
  schedule(index);
};

const buildIndexEntry = (document: IndexableDocument): IndexedDocument => {
  const title = document.title?.trim() ?? "";
  const content = getTipTapText(document.content ?? "");
  return {
    id: document.id,
    title,
    content,
    workspaceId: document.workspaceId,
    updatedAt: document.updatedAt
  };
};

const makeDocumentKey = (workspaceId: string, documentId: string) => `${workspaceId}:${documentId}`;

export const indexDocument = async (document: IndexableDocument): Promise<void> => {
  if (!document.workspaceId || !document.id) {
    return;
  }

  const entry = buildIndexEntry(document);
  const contentKey = `${entry.title}\n${entry.content}`;
  const cacheKey = makeDocumentKey(entry.workspaceId, entry.id);
  if (lastIndexedContent.get(cacheKey) === contentKey) {
    return;
  }

  const index = await getIndex(entry.workspaceId);
  const mutableIndex = index as MiniSearch<IndexedDocument> & {
    remove?: (doc: IndexedDocument | string) => void;
    removeAll?: (docs: Array<IndexedDocument | string>) => void;
    discard?: (docId: string) => void;
  };
  if (mutableIndex.remove) {
    mutableIndex.remove(entry.id);
  } else if (mutableIndex.removeAll) {
    mutableIndex.removeAll([entry.id]);
  } else if (mutableIndex.discard) {
    mutableIndex.discard(entry.id);
  }
  index.add(entry);
  lastIndexedContent.set(cacheKey, contentKey);
  schedulePersist(entry.workspaceId, index);
};

export const searchDocumentsLocal = async (workspaceId: string, query: string): Promise<SearchResult[]> => {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }

  const index = await getIndex(workspaceId);
  const results = index.search(trimmed, {
    prefix: true,
    boost: SEARCH_BOOST
  }) as Array<{
    id: string;
    score: number;
    title?: string;
    workspaceId?: string;
    updatedAt?: string;
  }>;

  return results.map((result) => ({
    id: String(result.id),
    title: result.title ?? "",
    workspaceId: result.workspaceId ?? workspaceId,
    updatedAt: result.updatedAt,
    score: result.score
  }));
};
