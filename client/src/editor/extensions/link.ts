import { Mark, mergeAttributes } from "@tiptap/core";

export const Link = Mark.create({
  name: "link",
  inclusive: false,

  addAttributes() {
    return {
      href: {
        default: null
      },
      target: {
        default: null
      },
      rel: {
        default: null
      }
    };
  },

  parseHTML() {
    return [{ tag: "a[href]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["a", mergeAttributes(HTMLAttributes), 0];
  }
});
