interface PreviewProps {
  code: string;
}

export function Preview({ code }: PreviewProps) {
  return (
    <div className="h-full bg-white rounded-lg shadow overflow-hidden">
      <iframe
        srcDoc={code}
        title="preview"
        className="w-full h-full border-0"
        sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-modals"
      />
    </div>
  );
}