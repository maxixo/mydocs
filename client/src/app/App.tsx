import { Editor } from "../editor/Editor";

export default function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Live Team Collaborative Editor</h1>
        <p>Scaffold UI for real-time collaboration.</p>
      </header>
      <main className="app-main">
        {/* TODO: Wire editor state and document selection. */}
        <Editor />
      </main>
    </div>
  );
}
