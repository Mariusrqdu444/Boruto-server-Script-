import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useMessaging } from "@/contexts/MessagingContext";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdvancedOptionsSection() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { 
    messageDelay, 
    setMessageDelay, 
    retryCount, 
    setRetryCount,
    notificationEnabled,
    setNotificationEnabled
  } = useMessaging();
  
  return (
    <div>
      <button 
        className="flex items-center text-sm text-blue-400 focus:outline-none" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <ChevronRight className={cn(
          "h-4 w-4 mr-1 transition-transform duration-200",
          isExpanded && "transform rotate-90"
        )} />
        Advanced Options
      </button>
      
      {isExpanded && (
        <div className="mt-4 space-y-4">
          <div>
            <Label htmlFor="messageDelay" className="block text-sm font-medium mb-1">
              Delay Between Messages (ms)
            </Label>
            <Input 
              type="number" 
              id="messageDelay" 
              min={1000} 
              step={500} 
              value={messageDelay}
              onChange={(e) => setMessageDelay(parseInt(e.target.value) || 1500)}
              className="w-full bg-muted border border-input"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Recommended minimum delay: 1000ms to avoid rate limiting
            </p>
          </div>
          
          <div>
            <Label htmlFor="retryCount" className="block text-sm font-medium mb-1">
              Retry Count on Failure
            </Label>
            <Input 
              type="number" 
              id="retryCount" 
              min={0} 
              max={5} 
              value={retryCount}
              onChange={(e) => setRetryCount(parseInt(e.target.value) || 2)}
              className="w-full bg-muted border border-input"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Number of retry attempts if a message fails to send (0-5)
            </p>
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
              id="notificationEnabled" 
              checked={notificationEnabled}
              onCheckedChange={(checked) => setNotificationEnabled(checked as boolean)}
            />
            <Label htmlFor="notificationEnabled" className="text-sm">
              Enable desktop notifications for message status
            </Label>
          </div>
        </div>
      )}
    </div>
  );
}
