import Header from "@/components/Header";
import ControlButtons from "@/components/ControlButtons";
import ConfigSection from "@/components/ConfigSection";
import LogSection from "@/components/LogSection";
import { useMessaging } from "@/contexts/MessagingContext";

export default function Dashboard() {
  const { connectionState } = useMessaging();
  
  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col">
      <Header 
        title="WhatsApp Business Messaging" 
        subtitle="Send messages via WhatsApp Business API" 
        connectionState={connectionState} 
      />
      
      <main className="container mx-auto py-6 px-4 max-w-4xl flex-1">
        <div className="grid grid-cols-1 gap-8">
          <div className="bg-card rounded-lg border border-border shadow-sm p-6">
            <ConfigSection />
            <ControlButtons />
          </div>
          
          <div>
            <LogSection />
          </div>
        </div>
      </main>
      
      <footer className="py-4 px-4 text-center text-xs text-muted-foreground border-t border-border mt-auto">
        <p>WhatsApp Business Messaging API Interface © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
