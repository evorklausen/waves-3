interface Message {
  content: string;
  isUser: boolean;
}

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  return (
    <div
      className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[80%] rounded-lg px-4 py-2 ${
          message.isUser
            ? "bg-indigo-600 text-white"
            : "bg-secondary text-secondary-foreground"
        }`}
      >
        <pre className="whitespace-pre-wrap font-mono text-sm">
          {message.content}
        </pre>
      </div>
    </div>
  );
}