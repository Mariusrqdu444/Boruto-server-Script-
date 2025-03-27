import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMessaging } from "@/contexts/MessagingContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2 } from "lucide-react";

type LogEntryProps = {
  timestamp: string;
  message: string;
  type?: 'info' | 'success' | 'error' | 'warning';
};

const LogEntry = ({ timestamp, message, type = 'info' }: LogEntryProps) => {
  const colorClass = {
    info: 'text-slate-300',
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-yellow-500'
  }[type];

  const iconClass = {
    info: '•',
    success: '✓',
    error: '✗',
    warning: '⚠️'
  }[type];

  return (
    <div className={`font-mono text-xs mb-1 ${colorClass}`}>
      <span className="text-slate-500">[{timestamp}]</span> <span className="mr-1">{iconClass}</span> {message}
    </div>
  );
};

export default function LogSection() {
  const { logs, clearLogs } = useMessaging();
  
  return (
    <Card className="border border-border">
      <CardHeader className="border-b border-border flex flex-row items-center justify-between py-3 px-4">
        <CardTitle className="text-sm font-medium">Message Logs</CardTitle>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={clearLogs}
          className="h-8 px-2 text-muted-foreground hover:text-foreground"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Clear
        </Button>
      </CardHeader>
      
      <CardContent className="p-4">
        <ScrollArea className="bg-muted/40 rounded-md p-3 h-64 w-full border border-input">
          {logs.length === 0 ? (
            <div className="text-xs text-muted-foreground italic text-center py-2">
              No logs yet. Start messaging to see activity here.
            </div>
          ) : (
            logs.map((log, index) => (
              <LogEntry
                key={index}
                timestamp={log.timestamp}
                message={log.message}
                type={log.type}
              />
            ))
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
