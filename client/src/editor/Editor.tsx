import { Toolbar } from "./Toolbar";
import { Presence } from "./Presence";

export const Editor = () => {
  return (
    <section className="editor">
      <Toolbar />
      <div className="editor-canvas" aria-label="Document editor">
        <p>Editor surface placeholder.</p>
      </div>
      <Presence />
    </section>
  );
};
