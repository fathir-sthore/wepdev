import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DownloadButton({ scriptId }: { scriptId: string }) {
  return (
    <a href={`/api/scripts/${scriptId}/download`}>
      <Button size="lg" className="w-full">
        <Download size={16} />
        Download
      </Button>
    </a>
  );
}
