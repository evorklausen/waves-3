interface PreviewProps {
  code: string;
  language?: 'html' | 'javascript';
}

export function Preview({ code, language = 'html' }: PreviewProps) {
  const getPreviewContent = () => {
    if (language === 'javascript') {
      return `
<!DOCTYPE html>
<html>
<head>
  <title>JavaScript Preview</title>
</head>
<body>
  <div id="output"></div>
  <script>
    const output = document.getElementById('output');
    const log = console.log;
    console.log = (...args) => {
      output.innerHTML += args.join(' ') + '<br>';
      log.apply(console, args);
    };
    try {
      ${code}
    } catch (error) {
      console.log('Error:', error.message);
    }
  </script>
</body>
</html>`;
    }
    return code;
  };

  return (
    <div className="h-full bg-white rounded-lg shadow overflow-hidden">
      <iframe
        srcDoc={getPreviewContent()}
        title="preview"
        className="w-full h-full border-0"
        sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-modals"
      />
    </div>
  );
}