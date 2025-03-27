import { MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type HeaderProps = {
  title: string;
  subtitle: string;
  connectionState: 'connected' | 'disconnected';
};

export default function Header({ title, subtitle, connectionState }: HeaderProps) {
  return (
    <header className="bg-card py-4 px-6 border-b border-border flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <div className="bg-primary/10 p-2 rounded-md">
          <MessageSquare className="text-primary h-5 w-5" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      
      <div className="flex items-center">
        <Badge 
          variant={connectionState === 'connected' ? "default" : "destructive"}
          className="font-normal"
        >
          <span className={`h-2 w-2 rounded-full ${connectionState === 'connected' ? 'bg-white' : 'bg-white'} mr-2`}></span>
          {connectionState === 'connected' ? 'Connected' : 'Disconnected'}
        </Badge>
      </div>
    </header>
  );
}
