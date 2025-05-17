
import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, ExternalLink, Calendar, X } from "lucide-react";

interface LinkListSidebarProps {
  open: boolean;
  onClose: () => void;
}

export const LinkListSidebar: React.FC<LinkListSidebarProps> = ({ open, onClose }) => {
  // This would be fetched from your backend in a real implementation
  const userLinks = [
    {
      id: "abc123",
      title: "React useEffect Hook Example",
      url: "https://pastesharecopy.com/abc123",
      language: "javascript",
      views: 42,
      created: "2025-05-16T10:30:00Z",
      expires: "2025-05-18T10:30:00Z",
    },
    {
      id: "def456",
      title: "CSS Grid Layout",
      url: "https://pastesharecopy.com/def456",
      language: "css",
      views: 27,
      created: "2025-05-16T08:15:00Z",
      expires: "2025-05-18T08:15:00Z",
    },
    {
      id: "ghi789",
      title: "Python Data Processing",
      url: "https://pastesharecopy.com/ghi789",
      language: "python",
      views: 13,
      created: "2025-05-15T14:22:00Z",
      expires: "2025-05-17T14:22:00Z",
    },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Sheet open={open} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader className="pb-4 border-b">
          <div className="flex justify-between items-center">
            <SheetTitle>Your Shared Links</SheetTitle>
            <SheetClose asChild>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X size={18} />
                <span className="sr-only">Close</span>
              </Button>
            </SheetClose>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-8rem)] py-4">
          <div className="space-y-4">
            {userLinks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                You haven't created any links yet.
              </div>
            ) : (
              userLinks.map((link) => (
                <div key={link.id} className="p-4 rounded-lg border bg-card">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-card-foreground">{link.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded">
                          {link.language}
                        </span>
                        <span className="flex items-center">
                          <Eye size={12} className="mr-1" />
                          {link.views}
                        </span>
                        <span className="flex items-center">
                          <Calendar size={12} className="mr-1" />
                          {formatDate(link.created)}
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <a href={link.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink size={14} />
                        <span className="sr-only">Open link</span>
                      </a>
                    </Button>
                  </div>
                  <div className="mt-3">
                    <div className="text-xs bg-muted p-2 rounded font-mono truncate">
                      {link.url}
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      Expires: {formatDate(link.expires)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
