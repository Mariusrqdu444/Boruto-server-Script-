import { Button } from "@/components/ui/button";
import { Play, Square } from "lucide-react";
import { useMessaging } from "@/contexts/MessagingContext";
import { useToast } from "@/hooks/use-toast";

export default function ControlButtons() {
  const { isMessaging, startMessaging, stopMessaging, validateInputs } = useMessaging();
  const { toast } = useToast();

  const handleStartMessaging = async () => {
    const isValid = validateInputs();
    if (!isValid.valid) {
      toast({
        title: "Validation Error",
        description: isValid.message,
        variant: "destructive"
      });
      return;
    }
    
    startMessaging();
  };

  return (
    <div className="flex justify-center space-x-3 py-4 mt-2">
      <Button 
        variant="default" 
        size="lg"
        onClick={handleStartMessaging}
        disabled={isMessaging}
        className="bg-primary text-white px-8 font-medium"
      >
        <Play className="mr-2 h-4 w-4" /> Start Messaging
      </Button>
      
      <Button 
        variant={isMessaging ? "destructive" : "outline"}
        size="lg"
        onClick={stopMessaging}
        disabled={!isMessaging}
        className="px-8 font-medium"
      >
        <Square className="mr-2 h-4 w-4" /> Stop Messaging
      </Button>
    </div>
  );
}
