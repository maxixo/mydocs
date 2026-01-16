export const openEditorDb = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("collab-editor", 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("documents")) {
        db.createObjectStore("documents", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("operations")) {
        db.createObjectStore("operations", { keyPath: "id" });
      }
      // TODO: Add additional stores for presence and metadata.
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB error"));
  });
};
