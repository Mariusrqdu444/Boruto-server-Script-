import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMessaging } from "@/contexts/MessagingContext";
import { useRef } from "react";
import { Separator } from "@/components/ui/separator";

export default function MessageDetailsSection() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { 
    messageInputMethod, 
    setMessageInputMethod, 
    messageText, 
    setMessageText,
    messageFile,
    setMessageFile
  } = useMessaging();
  
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };
  
  const handleActualFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setMessageFile({
      fileName: file.name,
      file: file
    });
  };
  
  return (
    <div className="border-b border-border pb-5">
      <h3 className="text-md font-medium text-blue-400 mb-3">Message Details</h3>
      
      <div className="mb-4">
        <Label className="block text-sm font-medium mb-2">Message Input Method</Label>
        <RadioGroup 
          value={messageInputMethod} 
          onValueChange={setMessageInputMethod as (value: string) => void}
          className="flex space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="direct" id="direct" />
            <Label htmlFor="direct">Direct Input</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="file" id="file" />
            <Label htmlFor="file">File Upload</Label>
          </div>
        </RadioGroup>
      </div>
      
      {messageInputMethod === 'direct' ? (
        <div>
          <Label htmlFor="messageText" className="block text-sm font-medium mb-1">
            Message Text
          </Label>
          <Textarea 
            id="messageText" 
            rows={4} 
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="w-full bg-muted border border-input"
            placeholder="Enter your message here"
          />
        </div>
      ) : (
        <div>
          <Label className="block text-sm font-medium mb-1">Message File</Label>
          <div className="flex items-center">
            <div className="flex-1 bg-muted border border-input rounded-md py-2 px-3 text-sm">
              <span>{messageFile?.fileName || "No file chosen"}</span>
            </div>
            <Button 
              size="sm"
              variant="outline" 
              onClick={handleFileSelect} 
              className="ml-2"
            >
              Choose file
            </Button>
          </div>
          <input 
            type="file" 
            accept=".txt,.csv"
            ref={fileInputRef}
            onChange={handleActualFileSelect}
            className="hidden"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Upload text file containing message content (.txt or .csv)
          </p>
        </div>
      )}
      
      <Separator className="my-5" />
    </div>
  );
}
