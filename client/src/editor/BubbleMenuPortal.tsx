import { useEffect, useMemo, type ReactNode } from "react";
import { createPortal } from "react-dom";
import type { Editor } from "@tiptap/react";
import { BubbleMenuPlugin, type BubbleMenuPluginProps } from "@tiptap/extension-bubble-menu";

type BubbleMenuPortalProps = {
  editor: Editor | null;
  className?: string;
  children: ReactNode;
  shouldShow?: BubbleMenuPluginProps["shouldShow"];
  tippyOptions?: BubbleMenuPluginProps["tippyOptions"];
  updateDelay?: BubbleMenuPluginProps["updateDelay"];
};

export const BubbleMenuPortal = ({
  editor,
  className,
  children,
  shouldShow,
  tippyOptions,
  updateDelay
}: BubbleMenuPortalProps) => {
  const element = useMemo(() => {
    const container = document.createElement("div");
    container.style.visibility = "hidden";
    return container;
  }, []);

  useEffect(() => {
    if (!editor || editor.isDestroyed) {
      return;
    }

    element.className = className ?? "";

    const plugin = BubbleMenuPlugin({
      editor,
      element,
      pluginKey: "bubbleMenu",
      shouldShow,
      tippyOptions,
      updateDelay
    });

    editor.registerPlugin(plugin);

    return () => {
      editor.unregisterPlugin("bubbleMenu");
    };
  }, [editor, element]);

  useEffect(() => {
    element.className = className ?? "";
  }, [className, element]);

  if (!editor || editor.isDestroyed) {
    return null;
  }

  return createPortal(children, element);
};
