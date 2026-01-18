import { Awareness } from "y-protocols/awareness";
import * as Y from "yjs";

export interface YjsProvider {
  doc: Y.Doc;
  fragment: Y.XmlFragment;
  awareness: Awareness;
  connect: () => void;
  disconnect: () => void;
}

export const createYjsProvider = (): YjsProvider => {
  const doc = new Y.Doc();
  const fragment = doc.getXmlFragment("content");
  const awareness = new Awareness(doc);

  return {
    doc,
    fragment,
    awareness,
    connect: () => {
      // TODO: connect to Yjs WebSocket provider.
    },
    disconnect: () => {
      awareness.destroy();
      doc.destroy();
    }
  };
};
