import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useMessaging } from "@/contexts/MessagingContext";
import { FaLock } from "react-icons/fa";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

export default function AuthenticationSection() {
  const [token, setToken] = useState('');
  const { credentials, setCredentials } = useMessaging();
  
  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setToken(e.target.value);
  };
  
  const handleSaveToken = () => {
    if (token.trim()) {
      setCredentials({
        token: token.trim()
      });
    }
  };
  
  const handleClearToken = () => {
    setCredentials(null);
    setToken('');
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && token.trim()) {
      handleSaveToken();
    }
  };
  
  return (
    <div className="border-b border-border pb-5">
      <h3 className="text-md font-medium text-blue-400 mb-3">Authentication</h3>
      
      <div>
        <Label htmlFor="token" className="block text-sm font-medium mb-1">
          WhatsApp Business API Token
        </Label>
        <div className="flex items-center">
          <div className={cn(
            "flex-1 relative",
            credentials && "bg-muted/50"
          )}>
            <Input
              id="token"
              type="password"
              value={token}
              onChange={handleTokenChange}
              onKeyPress={handleKeyPress}
              placeholder="Enter your WhatsApp Business API token"
              className={cn(
                "pr-10",
                credentials && "bg-muted border-muted"
              )}
              disabled={!!credentials}
            />
            {credentials && (
              <FaLock className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 opacity-70" size={14} />
            )}
          </div>
          {!credentials ? (
            <Button 
              size="sm"
              variant="outline" 
              onClick={handleSaveToken} 
              className="ml-2"
              disabled={!token.trim()}
            >
              Save
            </Button>
          ) : (
            <Button 
              size="sm"
              variant="destructive" 
              onClick={handleClearToken} 
              className="ml-2"
            >
              Clear
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Enter the token from WhatsApp Business API for authentication
        </p>
        
        {credentials && (
          <div className="mt-2 p-2 bg-muted/50 rounded-md border border-border">
            <p className="text-xs text-green-500">✓ Token saved and secured</p>
          </div>
        )}
      </div>
      
      <Separator className="my-5" />
    </div>
  );
}
