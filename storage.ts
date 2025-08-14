import { sessions, messages, curriculumDocuments, type Session, type InsertSession, type Message, type InsertMessage, type CurriculumDocument, type InsertCurriculumDocument } from "@shared/schema";

export interface IStorage {
  // Session management
  getSession(sessionId: string): Promise<Session | undefined>;
  createSession(session: InsertSession): Promise<Session>;
  updateSession(sessionId: string, updates: Partial<Session>): Promise<Session | undefined>;
  
  // Message management
  getMessages(sessionId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // Progress tracking
  incrementQuestionCount(sessionId: string): Promise<void>;
  updateStudyTime(sessionId: string, additionalMinutes: number): Promise<void>;

  // Curriculum document management
  createCurriculumDocument(document: InsertCurriculumDocument): Promise<CurriculumDocument>;
  getCurriculumDocuments(grade: number, subject: string): Promise<CurriculumDocument[]>;
  getAllCurriculumDocuments(): Promise<CurriculumDocument[]>;
  deleteCurriculumDocument(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private sessions: Map<string, Session>;
  private messages: Map<string, Message[]>;
  private curriculumDocs: Map<number, CurriculumDocument>;
  private currentSessionId: number;
  private currentMessageId: number;
  private currentDocumentId: number;

  constructor() {
    this.sessions = new Map();
    this.messages = new Map();
    this.curriculumDocs = new Map();
    this.currentSessionId = 1;
    this.currentMessageId = 1;
    this.currentDocumentId = 1;
  }

  async getSession(sessionId: string): Promise<Session | undefined> {
    return this.sessions.get(sessionId);
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const session: Session = {
      ...insertSession,
      id: this.currentSessionId++,
      questionsAsked: insertSession.questionsAsked || 0,
      studyTimeMinutes: insertSession.studyTimeMinutes || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.sessions.set(session.sessionId, session);
    this.messages.set(session.sessionId, []);
    return session;
  }

  async updateSession(sessionId: string, updates: Partial<Session>): Promise<Session | undefined> {
    const existingSession = this.sessions.get(sessionId);
    if (!existingSession) return undefined;

    const updatedSession: Session = {
      ...existingSession,
      ...updates,
      updatedAt: new Date(),
    };
    this.sessions.set(sessionId, updatedSession);
    return updatedSession;
  }

  async getMessages(sessionId: string): Promise<Message[]> {
    return this.messages.get(sessionId) || [];
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const message: Message = {
      ...insertMessage,
      id: this.currentMessageId++,
      mediaType: insertMessage.mediaType || null,
      mediaUrl: insertMessage.mediaUrl || null,
      mediaThumbnail: insertMessage.mediaThumbnail || null,
      createdAt: new Date(),
    };

    const sessionMessages = this.messages.get(insertMessage.sessionId) || [];
    sessionMessages.push(message);
    this.messages.set(insertMessage.sessionId, sessionMessages);
    
    return message;
  }

  async incrementQuestionCount(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      await this.updateSession(sessionId, {
        questionsAsked: session.questionsAsked + 1,
      });
    }
  }

  async updateStudyTime(sessionId: string, additionalMinutes: number): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      await this.updateSession(sessionId, {
        studyTimeMinutes: session.studyTimeMinutes + additionalMinutes,
      });
    }
  }

  async createCurriculumDocument(insertDocument: InsertCurriculumDocument): Promise<CurriculumDocument> {
    const document: CurriculumDocument = {
      ...insertDocument,
      id: this.currentDocumentId++,
      uploadedAt: new Date(),
      description: insertDocument.description || null,
      content: insertDocument.content || null,
      isActive: insertDocument.isActive || 1,
    };
    this.curriculumDocs.set(document.id, document);
    return document;
  }

  async getCurriculumDocuments(grade: number, subject: string): Promise<CurriculumDocument[]> {
    return Array.from(this.curriculumDocs.values()).filter(
      doc => doc.grade === grade && doc.subject === subject && doc.isActive === 1
    );
  }

  async getAllCurriculumDocuments(): Promise<CurriculumDocument[]> {
    return Array.from(this.curriculumDocs.values()).filter(doc => doc.isActive === 1);
  }

  async deleteCurriculumDocument(id: number): Promise<boolean> {
    const doc = this.curriculumDocs.get(id);
    if (doc) {
      const updatedDoc = { ...doc, isActive: 0 };
      this.curriculumDocs.set(id, updatedDoc);
      return true;
    }
    return false;
  }
}

export const storage = new MemStorage();
