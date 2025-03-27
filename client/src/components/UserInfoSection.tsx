import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMessaging } from "@/contexts/MessagingContext";
import { Separator } from "@/components/ui/separator";

export default function UserInfoSection() {
  const { phoneNumber, setPhoneNumber } = useMessaging();
  
  return (
    <div className="border-b border-border pb-5">
      <h3 className="text-md font-medium text-blue-400 mb-3">User Information</h3>
      
      <div className="mb-4">
        <Label htmlFor="phoneNumber" className="block text-sm font-medium mb-1">
          Your Phone Number with Country Code
        </Label>
        <Input 
          type="text" 
          id="phoneNumber" 
          placeholder="Example: 491234567890" 
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="w-full bg-muted border border-input"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Enter your WhatsApp phone number with country code (no + or spaces)
        </p>
      </div>
      
      <Separator className="my-5" />
    </div>
  );
}
