import CodeEditor from "@uiw/react-textarea-code-editor";

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
}

export function CodeEditorPanel({ code, onChange }: CodeEditorProps) {
  return (
    <div className="h-full overflow-hidden bg-[#1e1e1e] rounded-lg">
      <CodeEditor
        value={code}
        language="html"
        onChange={(e) => onChange(e.target.value)}
        padding={15}
        style={{
          fontSize: 14,
          fontFamily: "Fira Code, monospace",
          height: "100%",
          backgroundColor: "#1e1e1e",
          overflow: "auto",
        }}
        data-color-mode="dark"
      />
    </div>
  );
}