import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AuthenticationSection from "./AuthenticationSection";
import UserInfoSection from "./UserInfoSection";
import TargetSection from "./TargetSection";
import MessageDetailsSection from "./MessageDetailsSection";
import AdvancedOptionsSection from "./AdvancedOptionsSection";

export default function ConfigSection() {
  return (
    <Card className="mb-6">
      <CardHeader className="border-b border-border">
        <CardTitle>Configure Messaging</CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 space-y-6">
        <AuthenticationSection />
        <UserInfoSection />
        <TargetSection />
        <MessageDetailsSection />
        <AdvancedOptionsSection />
      </CardContent>
    </Card>
  );
}
