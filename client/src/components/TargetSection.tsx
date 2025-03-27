import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useMessaging } from "@/contexts/MessagingContext";
import { Separator } from "@/components/ui/separator";

export default function TargetSection() {
  const { targetType, setTargetType, targetNumbers, setTargetNumbers } = useMessaging();
  
  return (
    <div className="border-b border-border pb-5">
      <h3 className="text-md font-medium text-blue-400 mb-3">Target Recipients</h3>
      
      <div className="mb-4">
        <Label htmlFor="targetType" className="block text-sm font-medium mb-1">
          Target Type
        </Label>
        <Select 
          value={targetType} 
          onValueChange={setTargetType}
        >
          <SelectTrigger id="targetType" className="w-full bg-muted border border-input">
            <SelectValue placeholder="Select target type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="individual">Individual Contact</SelectItem>
            <SelectItem value="group">Group</SelectItem>
            <SelectItem value="multiple">Multiple Recipients</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="mb-4">
        <Label htmlFor="targetNumbers" className="block text-sm font-medium mb-1">
          {targetType === 'group' ? 'Group IDs' : 'Phone Numbers'}
        </Label>
        <Textarea 
          id="targetNumbers" 
          rows={3} 
          value={targetNumbers}
          onChange={(e) => setTargetNumbers(e.target.value)}
          className="w-full bg-muted border border-input"
          placeholder={
            targetType === 'group'
              ? "Enter group IDs, one per line"
              : "Enter phone numbers with country code, one per line"
          }
        />
        <p className="text-xs text-muted-foreground mt-1">
          {targetType === 'group'
            ? "Enter group IDs, one per line"
            : "Enter phone numbers with country code, one per line (e.g., 491234567890)"}
        </p>
      </div>
      
      <Separator className="my-5" />
    </div>
  );
}
