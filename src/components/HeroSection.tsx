
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection: React.FC = () => {
  return (
    <div className="relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 pattern-bg"></div>
      
      <div className="relative z-10">
        <div className="container max-w-6xl py-16 md:py-24">
          <div className="flex flex-col items-center text-center">
            <div className="max-w-4xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
                Share Code Snippets with Ease
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                Create, share, and store your code snippets in seconds. Perfect syntax highlighting,
                with powerful features to make sharing your code effortless.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild size="lg" className="gap-2">
                  <Link to="/">
                    Start Pasting
                    <ArrowRight size={16} />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/pricing">
                    View Plans
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="w-full max-w-3xl mt-16 rounded-lg overflow-hidden shadow-xl bg-gradient-to-b from-background to-background/80 border border-border/50">
              <div className="p-1 bg-[#151520] font-mono">
                <div className="flex items-center h-6">
                  <div className="flex gap-1.5 ml-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                </div>
              </div>
              <div className="bg-[#151520] text-slate-100 p-4 font-mono text-sm overflow-auto">
                <div className="grid grid-cols-[auto,1fr] gap-x-4">
                  <div className="text-slate-500 select-none text-right">
                    <div>1</div>
                    <div>2</div>
                    <div>3</div>
                    <div>4</div>
                    <div>5</div>
                  </div>
                  <div>
                    <div><span className="text-[#ff79c6]">function</span> <span className="text-[#8be9fd]">createPaste</span>() {"{"}</div>
                    <div>&nbsp;&nbsp;<span className="text-[#ff79c6]">const</span> code = <span className="text-[#f1fa8c]">"Your awesome code here"</span>;</div>
                    <div>&nbsp;&nbsp;<span className="text-[#ff79c6]">const</span> link = <span className="text-[#bd93f9]">generateUniqueLink</span>();</div>
                    <div>&nbsp;&nbsp;<span className="text-[#ff79c6]">return</span> link;</div>
                    <div>{"}"}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
