import { useState } from "react";
import type { DocumentState } from "../types";

export const useDocument = () => {
  const [document, setDocument] = useState<DocumentState | null>(null);

  const updateDocument = (next: DocumentState) => {
    // TODO: apply CRDT updates and persist.
    setDocument(next);
  };

  return { document, updateDocument };
};
