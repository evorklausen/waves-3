import { Github, Info, Heart } from "lucide-react";
import { Button } from "./ui/button";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
      <div className="container h-full flex items-center justify-between">
        <div className="font-semibold text-lg">Waves.ai🌊</div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open("https://github.com/evorklausen/Waves.ai", "_blank")}
          >
            <Github className="h-4 w-4 mr-2" />
            GitHub
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open("/about", "_blank")}
          >
            <Info className="h-4 w-4 mr-2" />
            About
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open("/donate", "_blank")}
          >
            <Heart className="h-4 w-4 mr-2" />
            Donate
          </Button>
        </div>
      </div>
    </nav>
  );
}