import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

type MessageInputMethod = 'direct' | 'file';
type TargetType = 'individual' | 'group' | 'multiple';
type ConnectionState = 'connected' | 'disconnected';

type Credentials = {
  token: string;
} | null;

type MessageFile = {
  fileName: string;
  file: File;
} | null;

type Log = {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
};

type ValidationResult = {
  valid: boolean;
  message: string;
};

type MessagingContextType = {
  connectionState: ConnectionState;
  isMessaging: boolean;
  credentials: Credentials;
  phoneNumber: string;
  targetType: TargetType;
  targetNumbers: string;
  messageInputMethod: MessageInputMethod;
  messageText: string;
  messageFile: MessageFile;
  messageDelay: number;
  retryCount: number;
  notificationEnabled: boolean;
  logs: Log[];
  setCredentials: (credentials: Credentials) => void;
  setPhoneNumber: (phoneNumber: string) => void;
  setTargetType: (targetType: TargetType) => void;
  setTargetNumbers: (targetNumbers: string) => void;
  setMessageInputMethod: (method: MessageInputMethod) => void;
  setMessageText: (text: string) => void;
  setMessageFile: (file: MessageFile) => void;
  setMessageDelay: (delay: number) => void;
  setRetryCount: (count: number) => void;
  setNotificationEnabled: (enabled: boolean) => void;
  startMessaging: () => void;
  stopMessaging: () => void;
  clearLogs: () => void;
  validateInputs: () => ValidationResult;
};

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

export function MessagingProvider({ children }: { children: ReactNode }) {
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [isMessaging, setIsMessaging] = useState(false);
  const [credentials, setCredentials] = useState<Credentials>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [targetType, setTargetType] = useState<TargetType>('individual');
  const [targetNumbers, setTargetNumbers] = useState('');
  const [messageInputMethod, setMessageInputMethod] = useState<MessageInputMethod>('direct');
  const [messageText, setMessageText] = useState('');
  const [messageFile, setMessageFile] = useState<MessageFile>(null);
  const [messageDelay, setMessageDelay] = useState(1500);
  const [retryCount, setRetryCount] = useState(2);
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [logs, setLogs] = useState<Log[]>([{
    timestamp: new Date().toLocaleTimeString(),
    message: 'System initialized. Ready to connect.',
    type: 'info'
  }]);
  const [messageQueue, setMessageQueue] = useState<any[]>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  
  const { toast } = useToast();

  const addLog = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prevLogs => [...prevLogs, { timestamp, message, type }]);
    
    if (type === 'error' && notificationEnabled) {
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive'
      });
    }

    if (type === 'success' && notificationEnabled) {
      toast({
        title: 'Success',
        description: message,
      });
    }
  };

  const clearLogs = () => {
    setLogs([{
      timestamp: new Date().toLocaleTimeString(),
      message: 'Log cleared',
      type: 'info'
    }]);
  };

  const validateInputs = (): ValidationResult => {
    if (!credentials) {
      return { valid: false, message: 'No WhatsApp token provided' };
    }

    if (!phoneNumber) {
      return { valid: false, message: 'Your phone number is required' };
    }

    if (!targetNumbers) {
      return { valid: false, message: 'No target recipients specified' };
    }

    if (messageInputMethod === 'direct' && !messageText) {
      return { valid: false, message: 'Message text is empty' };
    }

    if (messageInputMethod === 'file' && !messageFile) {
      return { valid: false, message: 'No message file selected' };
    }

    return { valid: true, message: '' };
  };

  // Start messaging process
  const startMessaging = async () => {
    setIsMessaging(true);
    
    addLog('Starting messaging service...');
    addLog(`Target type: ${targetType}`);
    
    const recipients = targetNumbers.split('\n').filter(r => r.trim() !== '');
    addLog(`Recipients: ${recipients.length}`);
    
    try {
      // Initialize session with server
      const formData = new FormData();
      
      if (credentials) {
        formData.append('apiToken', credentials.token);
      }
      
      formData.append('phoneNumber', phoneNumber);
      formData.append('targetType', targetType);
      formData.append('targetNumbers', targetNumbers);
      formData.append('messageDelay', messageDelay.toString());
      formData.append('retryCount', retryCount.toString());
      
      if (messageInputMethod === 'direct') {
        formData.append('messageInputMethod', 'direct');
        formData.append('messageText', messageText);
      } else {
        formData.append('messageInputMethod', 'file');
        if (messageFile) {
          formData.append('messageFile', messageFile.file);
        }
      }

      const response = await fetch('/api/whatsapp/initialize', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || response.statusText);
      }

      const { sessionId } = await response.json();
      
      // Start polling for session status
      setConnectionState('connected');
      
      // Start messaging
      const startResponse = await apiRequest('POST', '/api/whatsapp/start', { sessionId });
      
      if (!startResponse.ok) {
        const errorText = await startResponse.text();
        throw new Error(errorText || startResponse.statusText);
      }
      
      // Start polling for message status
      const statusPolling = setInterval(async () => {
        if (!isMessaging) {
          clearInterval(statusPolling);
          return;
        }
        
        try {
          const statusResponse = await fetch('/api/whatsapp/status', {
            credentials: 'include'
          });
          
          if (statusResponse.ok) {
            const { messages, completed } = await statusResponse.json();
            
            // Update logs with new messages
            messages.forEach((msg: any) => {
              addLog(msg.message, msg.type);
            });
            
            // If completed, stop messaging
            if (completed) {
              setIsMessaging(false);
              addLog('All messages sent successfully!', 'success');
              clearInterval(statusPolling);
            }
          }
        } catch (error) {
          console.error('Status polling error:', error);
        }
      }, 1000);
      
    } catch (error) {
      addLog(`Error initializing messaging: ${error instanceof Error ? error.message : String(error)}`, 'error');
      setIsMessaging(false);
      setConnectionState('disconnected');
    }
  };

  // Stop messaging process
  const stopMessaging = async () => {
    try {
      await apiRequest('POST', '/api/whatsapp/stop', {});
      setIsMessaging(false);
      addLog('Messaging stopped by user', 'warning');
    } catch (error) {
      addLog(`Error stopping messaging: ${error instanceof Error ? error.message : String(error)}`, 'error');
    }
  };

  useEffect(() => {
    // Cleanup function
    return () => {
      if (isMessaging) {
        stopMessaging();
      }
    };
  }, []);

  return (
    <MessagingContext.Provider value={{
      connectionState,
      isMessaging,
      credentials,
      phoneNumber,
      targetType,
      targetNumbers,
      messageInputMethod,
      messageText,
      messageFile,
      messageDelay,
      retryCount,
      notificationEnabled,
      logs,
      setCredentials,
      setPhoneNumber,
      setTargetType,
      setTargetNumbers,
      setMessageInputMethod,
      setMessageText,
      setMessageFile,
      setMessageDelay,
      setRetryCount,
      setNotificationEnabled,
      startMessaging,
      stopMessaging,
      clearLogs,
      validateInputs
    }}>
      {children}
    </MessagingContext.Provider>
  );
}

export function useMessaging() {
  const context = useContext(MessagingContext);
  if (context === undefined) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  return context;
}
