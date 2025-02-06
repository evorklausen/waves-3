
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { ChatInterface } from "@/components/ChatInterface";
import { Preview } from "@/components/Preview";

const initialCode = `
<!DOCTYPE html>
<html>
  <head>
    <title>My Project</title>
    <style>
      body { font-family: system-ui; padding: 2rem; }
    </style>
  </head>
  <body>
    <h1>Welcome to Your Project</h1>
    <p>This is a preview of your HTML content!</p>
  </body>
</html>
`;

export default function Index() {
  const [code, setCode] = useState(initialCode);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container pt-14 h-screen">
        <div className="grid grid-cols-12 gap-4 h-[calc(100vh-4rem)] py-4">
          <div className="col-span-3 bg-card rounded-lg shadow-sm border overflow-hidden">
            <ChatInterface />
          </div>
          <div className="col-span-9 bg-card rounded-lg shadow-sm border overflow-hidden">
            <Preview code={code} language="html" />
          </div>
        </div>
      </main>
    </div>
  );
}
