import fs from 'fs';
import { storage } from './storage';

type MessageCallback = (sessionId: string, message: string, type: string) => void;

class WhatsAppClient {
  private sessions: Map<string, any> = new Map();
  private messageCallback: MessageCallback = () => {};
  private abortControllers: Map<string, AbortController> = new Map();
  private baseApiUrl = 'https://graph.facebook.com/v17.0';

  constructor() {}

  public setMessageCallback(callback: MessageCallback) {
    this.messageCallback = callback;
  }

  /**
   * Initialize WhatsApp client for a session
   */
  public async initialize(
    sessionId: string, 
    credentials: { apiToken: string }, 
    phoneNumber: string
  ): Promise<boolean> {
    try {
      this.logMessage(sessionId, 'Initializing WhatsApp client...', 'info');
      
      // Validate inputs
      if (!credentials.apiToken) {
        throw new Error('API token is required');
      }
      
      if (!phoneNumber) {
        throw new Error('Phone number is required');
      }

      // Store session with API token
      this.sessions.set(sessionId, {
        apiToken: credentials.apiToken,
        phoneNumber,
        isConnected: false,
        isMessaging: false
      });
      
      // Verify WhatsApp Business API token by making a test request
      try {
        this.logMessage(sessionId, 'Verifying API token...', 'info');
        
        // Make a real API call to verify the token
        const businessProfileUrl = `${this.baseApiUrl}/${phoneNumber}/whatsapp_business_profile`;
        const response = await fetch(businessProfileUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${credentials.apiToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        // Check if the response is valid
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
          throw new Error(`API verification failed: ${errorData.error?.message || 'Unknown error'}`);
        }
        
        // Update session status
        const session = this.sessions.get(sessionId);
        if (!session) {
          throw new Error('Session not found');
        }
        
        session.isConnected = true;
        this.sessions.set(sessionId, session);
        
        await storage.updateSessionConnection(sessionId, true);
        
        this.logMessage(sessionId, 'Successfully connected to WhatsApp Business API using token', 'success');
        return true;
      } catch (apiError) {
        throw new Error(`API token validation failed: ${apiError instanceof Error ? apiError.message : String(apiError)}`);
      }
    } catch (error) {
      this.logMessage(
        sessionId, 
        `Failed to initialize WhatsApp client: ${error instanceof Error ? error.message : String(error)}`, 
        'error'
      );
      return false;
    }
  }

  /**
   * Start sending messages using the provided configuration
   */
  public async startMessaging(
    sessionId: string,
    targetType: string,
    targetNumbers: string,
    messageInputMethod: string,
    messageText: string | null,
    messageFilePath: string | null,
    messageDelay: number,
    retryCount: number
  ): Promise<boolean> {
    try {
      const session = this.sessions.get(sessionId);
      
      if (!session) {
        throw new Error('Session not found');
      }
      
      if (!session.isConnected) {
        throw new Error('WhatsApp client not connected');
      }
      
      // Update session status
      session.isMessaging = true;
      this.sessions.set(sessionId, session);
      await storage.updateSessionMessagingStatus(sessionId, true);
      
      this.logMessage(sessionId, 'Starting to send messages...', 'info');
      
      // Parse recipients
      const recipients = targetNumbers
        .split('\n')
        .map(r => r.trim())
        .filter(r => r.length > 0);
      
      if (recipients.length === 0) {
        throw new Error('No valid recipients found');
      }
      
      this.logMessage(sessionId, `Sending to ${recipients.length} recipients`, 'info');
      
      // Load message content
      let messageContent: string;
      
      if (messageInputMethod === 'direct' && messageText) {
        messageContent = messageText;
      } else if (messageInputMethod === 'file' && messageFilePath) {
        try {
          messageContent = fs.readFileSync(messageFilePath, 'utf8');
        } catch (error) {
          throw new Error(`Failed to read message file: ${error instanceof Error ? error.message : String(error)}`);
        }
      } else {
        throw new Error('No valid message content found');
      }
      
      // Create an abort controller for this session
      const abortController = new AbortController();
      this.abortControllers.set(sessionId, abortController);
      
      // Start sending messages asynchronously
      this.sendMessages(
        sessionId, 
        recipients, 
        messageContent, 
        messageDelay, 
        retryCount,
        abortController.signal
      );
      
      return true;
    } catch (error) {
      this.logMessage(
        sessionId, 
        `Failed to start messaging: ${error instanceof Error ? error.message : String(error)}`, 
        'error'
      );
      
      // Update session status
      const session = this.sessions.get(sessionId);
      if (session) {
        session.isMessaging = false;
        this.sessions.set(sessionId, session);
        await storage.updateSessionMessagingStatus(sessionId, false);
      }
      
      return false;
    }
  }
  
  /**
   * Stop sending messages for a session
   */
  public async stopMessaging(sessionId: string): Promise<boolean> {
    try {
      // Get the abort controller for this session and abort
      const abortController = this.abortControllers.get(sessionId);
      if (abortController) {
        abortController.abort();
        this.abortControllers.delete(sessionId);
      }
      
      // Update session status
      const session = this.sessions.get(sessionId);
      if (session) {
        session.isMessaging = false;
        this.sessions.set(sessionId, session);
        await storage.updateSessionMessagingStatus(sessionId, false);
      }
      
      this.logMessage(sessionId, 'Messaging stopped', 'warning');
      return true;
    } catch (error) {
      this.logMessage(
        sessionId, 
        `Failed to stop messaging: ${error instanceof Error ? error.message : String(error)}`, 
        'error'
      );
      return false;
    }
  }
  
  /**
   * Send messages to recipients
   */
  private async sendMessages(
    sessionId: string,
    recipients: string[],
    messageContent: string,
    messageDelay: number,
    retryCount: number,
    abortSignal: AbortSignal
  ): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      this.logMessage(sessionId, 'Session not found', 'error');
      return;
    }

    const { apiToken, phoneNumber } = session;

    for (let i = 0; i < recipients.length; i++) {
      // Check if the operation has been aborted
      if (abortSignal.aborted) {
        this.logMessage(sessionId, 'Messaging operation aborted', 'warning');
        break;
      }
      
      const recipient = recipients[i];
      
      // Log starting to send message
      this.logMessage(sessionId, `Sending message to ${recipient}...`, 'info');
      
      // Message sending with real API integration and retries
      let success = false;
      let attempts = 0;
      
      while (!success && attempts <= retryCount) {
        // Check if aborted before each attempt
        if (abortSignal.aborted) break;
        
        attempts++;
        
        try {
          // Make a real API call to WhatsApp Business API
          const response = await fetch(`${this.baseApiUrl}/${phoneNumber}/messages`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiToken}`
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              recipient_type: 'individual',
              to: recipient,
              type: 'text',
              text: { body: messageContent }
            })
          });
          
          const responseData = await response.json();
          
          if (!response.ok) {
            throw new Error(responseData.error?.message || 'Error sending message');
          }
          
          // Message sent successfully
          success = true;
          
          // Store successful message
          await storage.createMessage({
            sessionId,
            recipient,
            message: messageContent,
            status: 'delivered'
          });
          
          this.logMessage(
            sessionId, 
            attempts > 1 
              ? `✓ Message delivered to ${recipient} on retry ${attempts}` 
              : `✓ Message delivered to ${recipient}`, 
            'success'
          );
          
          // Log message ID if available
          if (responseData.messages && responseData.messages.length > 0) {
            this.logMessage(
              sessionId,
              `Message ID: ${responseData.messages[0].id}`,
              'info'
            );
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          
          if (attempts <= retryCount) {
            this.logMessage(
              sessionId, 
              `✗ Failed to send message to ${recipient} (${errorMessage}). Retrying... (${attempts}/${retryCount})`, 
              'error'
            );
            
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
          } else {
            // Final failure
            await storage.createMessage({
              sessionId,
              recipient,
              message: messageContent,
              status: 'failed',
              error: errorMessage
            });
            
            this.logMessage(
              sessionId, 
              `✗ Failed to send message to ${recipient} after ${retryCount} retries`, 
              'error'
            );
          }
        }
      }
      
      // Check if aborted after processing a recipient
      if (abortSignal.aborted) break;
      
      // Wait for the specified delay before sending the next message
      if (i < recipients.length - 1) {
        this.logMessage(sessionId, `Waiting ${messageDelay}ms before sending next message...`, 'info');
        await new Promise(resolve => setTimeout(resolve, messageDelay));
      }
    }
    
    // If we completed all recipients and weren't aborted, log completion
    if (!abortSignal.aborted) {
      this.logMessage(sessionId, 'All messages processed', 'success');
      
      // Update session status
      const session = this.sessions.get(sessionId);
      if (session) {
        session.isMessaging = false;
        this.sessions.set(sessionId, session);
        await storage.updateSessionMessagingStatus(sessionId, false);
      }
    }
  }

  /**
   * Log a message for a session
   */
  private logMessage(sessionId: string, message: string, type: string = 'info'): void {
    // Call the message callback
    if (this.messageCallback) {
      this.messageCallback(sessionId, message, type);
    }
  }
}

export const whatsAppClient = new WhatsAppClient();
