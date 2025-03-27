import { 
  users, 
  sessions, 
  messages, 
  messageLogs,
  type User, 
  type InsertUser,
  type Session,
  type InsertSession,
  type Message,
  type InsertMessage,
  type MessageLog,
  type InsertMessageLog
} from "@shared/schema";

// Storage interface for all CRUD operations
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Session methods
  getSession(id: string): Promise<Session | undefined>;
  createSession(session: InsertSession & { id: string }): Promise<Session>;
  updateSessionConnection(id: string, isConnected: boolean): Promise<boolean>;
  updateSessionMessagingStatus(id: string, isMessaging: boolean): Promise<boolean>;
  
  // Message methods
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesBySession(sessionId: string): Promise<Message[]>;
  
  // Message logs methods
  createMessageLog(log: InsertMessageLog): Promise<MessageLog>;
  getLogsBySession(sessionId: string): Promise<MessageLog[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private sessions: Map<string, Session>;
  private messagesMap: Map<number, Message>;
  private messageLogs: Map<number, MessageLog>;
  private userId: number;
  private messageId: number;
  private messageLogId: number;

  constructor() {
    this.users = new Map();
    this.sessions = new Map();
    this.messagesMap = new Map();
    this.messageLogs = new Map();
    this.userId = 1;
    this.messageId = 1;
    this.messageLogId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Session methods
  async getSession(id: string): Promise<Session | undefined> {
    return this.sessions.get(id);
  }
  
  async createSession(sessionData: InsertSession & { id: string }): Promise<Session> {
    const session: Session = {
      id: sessionData.id,
      userId: null,
      credentials: sessionData.credentials || null,
      phoneNumber: sessionData.phoneNumber,
      targetType: sessionData.targetType,
      targetNumbers: sessionData.targetNumbers,
      messageInputMethod: sessionData.messageInputMethod,
      messageText: sessionData.messageText || null,
      messageFilePath: sessionData.messageFilePath || null,
      messageDelay: sessionData.messageDelay || 1500,
      retryCount: sessionData.retryCount || 2,
      isMessaging: sessionData.isMessaging || false,
      isConnected: sessionData.isConnected || false,
      createdAt: new Date()
    };
    this.sessions.set(session.id, session);
    return session;
  }
  
  async updateSessionConnection(id: string, isConnected: boolean): Promise<boolean> {
    const session = this.sessions.get(id);
    if (!session) return false;
    
    session.isConnected = isConnected;
    this.sessions.set(id, session);
    return true;
  }
  
  async updateSessionMessagingStatus(id: string, isMessaging: boolean): Promise<boolean> {
    const session = this.sessions.get(id);
    if (!session) return false;
    
    session.isMessaging = isMessaging;
    this.sessions.set(id, session);
    return true;
  }
  
  // Message methods
  async createMessage(messageData: InsertMessage): Promise<Message> {
    const id = this.messageId++;
    const message: Message = {
      id,
      sessionId: messageData.sessionId,
      recipient: messageData.recipient,
      message: messageData.message || null,
      status: messageData.status || 'pending',
      error: messageData.error || null,
      createdAt: new Date(),
      sentAt: null // Initialize as null
    };
    this.messagesMap.set(id, message);
    return message;
  }
  
  async getMessagesBySession(sessionId: string): Promise<Message[]> {
    return Array.from(this.messagesMap.values())
      .filter(message => message.sessionId === sessionId);
  }
  
  // Message logs methods
  async createMessageLog(logData: InsertMessageLog): Promise<MessageLog> {
    const id = this.messageLogId++;
    const log: MessageLog = {
      id,
      sessionId: logData.sessionId,
      message: logData.message,
      type: logData.type || 'info', // Ensure type is not undefined
      timestamp: new Date()
    };
    this.messageLogs.set(id, log);
    return log;
  }
  
  async getLogsBySession(sessionId: string): Promise<MessageLog[]> {
    return Array.from(this.messageLogs.values())
      .filter(log => log.sessionId === sessionId)
      .sort((a, b) => {
        // Handle null timestamps by considering them "greater" (more recent)
        if (!a.timestamp) return 1;
        if (!b.timestamp) return -1;
        return a.timestamp.getTime() - b.timestamp.getTime();
      });
  }
}

export const storage = new MemStorage();
