/**
 * Sistema Centralitzador de Notificacions
 * Gestor únic per totes les notificacions de l'aplicació
 */

import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Interfaces
export interface NotificationPayload {
  id?: string;
  title: string;
  message: string;
  scheduledAt: Date;
  type: NotificationTypeEnum;
  priority: NotificationPriority;
  metadata?: Record<string, any>;
  taskId?: string;
  blockId?: string;
  userId?: string;
}

export interface NotificationRequest {
  payload: NotificationPayload;
  retryCount?: number;
  maxRetries?: number;
  createdAt: Date;
  correlationId: string;
}

export enum NotificationTypeEnum {
  TASK_REMINDER = 'task_reminder',
  TIME_BLOCK_START = 'time_block_start',
  TIME_BLOCK_END = 'time_block_end',
  CUSTOM = 'custom',
  SYSTEM = 'system',
  DEADLINE_ALERT = 'deadline_alert'
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum NotificationStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SENT = 'sent',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  RETRY = 'retry'
}

// Event Types per Observer Pattern
export interface NotificationEvent {
  type: 'queued' | 'processing' | 'sent' | 'failed' | 'cancelled' | 'retry';
  payload: NotificationPayload;
  correlationId: string;
  timestamp: Date;
  error?: Error;
}

type NotificationEventListener = (event: NotificationEvent) => void;

class NotificationManager {
  private static instance: NotificationManager;
  private queue: Map<string, NotificationRequest> = new Map();
  private processing: Set<string> = new Set();
  private listeners: Set<NotificationEventListener> = new Set();
  private healthCheck: boolean = true;
  private circuitBreaker: {
    isOpen: boolean;
    failureCount: number;
    lastFailureTime: number;
    threshold: number;
    timeout: number;
  } = {
    isOpen: false,
    failureCount: 0,
    lastFailureTime: 0,
    threshold: 5,
    timeout: 30000 // 30 segons
  };

  private constructor() {
    this.startQueueProcessor();
    this.startHealthMonitor();
  }

  public static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  // Observer Pattern - Event Listeners
  public addListener(listener: NotificationEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(event: NotificationEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('❌ Error en listener de notificació:', error);
      }
    });
  }

  // API Pública - Entry Point Principal
  public async scheduleNotification(payload: NotificationPayload): Promise<string> {
    const correlationId = this.generateCorrelationId();
    
    // Validació
    if (!this.validatePayload(payload)) {
      throw new Error('Payload de notificació invàlid');
    }

    // Crear request
    const request: NotificationRequest = {
      payload: {
        ...payload,
        id: correlationId,
        userId: payload.userId || await this.getCurrentUserId()
      },
      retryCount: 0,
      maxRetries: payload.priority === NotificationPriority.URGENT ? 5 : 3,
      createdAt: new Date(),
      correlationId
    };

    // Afegir a la cua
    this.queue.set(correlationId, request);
    
    // Log i emit event
    this.logNotification('QUEUED', request);
    this.emit({
      type: 'queued',
      payload: request.payload,
      correlationId,
      timestamp: new Date()
    });

    return correlationId;
  }

  public async cancelNotification(correlationId: string): Promise<boolean> {
    // Cancel·lar de la cua
    if (this.queue.has(correlationId)) {
      const request = this.queue.get(correlationId)!;
      this.queue.delete(correlationId);
      
      // Cancel·lar a la base de dades
      await this.cancelInDatabase(request.payload);
      
      this.emit({
        type: 'cancelled',
        payload: request.payload,
        correlationId,
        timestamp: new Date()
      });
      
      return true;
    }

    return false;
  }

  public async cancelNotificationsByBlockId(blockId: string): Promise<number> {
    let cancelledCount = 0;
    
    // Cancel·lar de la cua
    for (const [id, request] of this.queue.entries()) {
      if (request.payload.blockId === blockId) {
        await this.cancelNotification(id);
        cancelledCount++;
      }
    }

    // Cancel·lar a la base de dades
    try {
      const { error } = await supabase
        .from('notification_reminders')
        .update({ status: 'cancelled' })
        .eq('status', 'pending')
        .like('metadata->block_id', blockId);

      if (error) {
        console.error('❌ Error cancel·lant notificacions a BD:', error);
      }
    } catch (error) {
      console.error('❌ Error en operació de cancel·lació BD:', error);
    }

    return cancelledCount;
  }

  // Circuit Breaker Pattern
  private isCircuitBreakerOpen(): boolean {
    if (!this.circuitBreaker.isOpen) return false;
    
    const now = Date.now();
    if (now - this.circuitBreaker.lastFailureTime > this.circuitBreaker.timeout) {
      this.circuitBreaker.isOpen = false;
      this.circuitBreaker.failureCount = 0;
      console.log('🔄 Circuit breaker reset');
      return false;
    }
    
    return true;
  }

  private recordFailure(): void {
    this.circuitBreaker.failureCount++;
    this.circuitBreaker.lastFailureTime = Date.now();
    
    if (this.circuitBreaker.failureCount >= this.circuitBreaker.threshold) {
      this.circuitBreaker.isOpen = true;
      console.log('🔴 Circuit breaker obert - massa fallades');
    }
  }

  private recordSuccess(): void {
    this.circuitBreaker.failureCount = 0;
  }

  // Queue Processor
  private startQueueProcessor(): void {
    setInterval(async () => {
      if (!this.healthCheck || this.isCircuitBreakerOpen()) {
        return;
      }

      const readyRequests = Array.from(this.queue.entries())
        .filter(([id, request]) => 
          !this.processing.has(id) && 
          request.payload.scheduledAt <= new Date()
        )
        .sort(([,a], [,b]) => this.getPriorityWeight(a.payload.priority) - this.getPriorityWeight(b.payload.priority))
        .slice(0, 3); // Processar màxim 3 a la vegada

      for (const [id, request] of readyRequests) {
        this.processNotification(id, request);
      }
    }, 5000); // Check every 5 seconds
  }

  private async processNotification(id: string, request: NotificationRequest): Promise<void> {
    this.processing.add(id);
    
    try {
      this.emit({
        type: 'processing',
        payload: request.payload,
        correlationId: id,
        timestamp: new Date()
      });

      // Processar la notificació
      await this.sendNotification(request);
      
      // Èxit
      this.queue.delete(id);
      this.recordSuccess();
      this.logNotification('SENT', request);
      
      this.emit({
        type: 'sent',
        payload: request.payload,
        correlationId: id,
        timestamp: new Date()
      });

    } catch (error) {
      this.recordFailure();
      await this.handleNotificationError(id, request, error as Error);
    } finally {
      this.processing.delete(id);
    }
  }

  private async sendNotification(request: NotificationRequest): Promise<void> {
    const { payload } = request;

    // Crear el reminder a la base de dades
    const { data, error } = await supabase
      .from('notification_reminders')
      .insert({
        user_id: payload.userId,
        task_id: payload.taskId,
        title: payload.title,
        message: payload.message,
        scheduled_at: payload.scheduledAt.toISOString(),
        notification_type: payload.type,
        status: 'pending',
        metadata: {
          ...payload.metadata,
          block_id: payload.blockId,
          priority: payload.priority,
          correlation_id: request.correlationId
        }
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error creant reminder: ${error.message}`);
    }

    // Processar immediatament si és urgent
    if (payload.priority === NotificationPriority.URGENT && 
        payload.scheduledAt <= new Date()) {
      await this.invokeProcessReminders();
    }
  }

  private async invokeProcessReminders(): Promise<void> {
    const { error } = await supabase.functions.invoke('process-reminders');
    if (error) {
      throw new Error(`Error invocant process-reminders: ${error.message}`);
    }
  }

  private async handleNotificationError(id: string, request: NotificationRequest, error: Error): Promise<void> {
    const retryCount = (request.retryCount || 0) + 1;
    const maxRetries = request.maxRetries || 3;

    this.logNotification('FAILED', request, error);

    if (retryCount <= maxRetries) {
      // Retry amb backoff exponencial
      const delay = Math.pow(2, retryCount) * 1000; // 2^n segons
      
      setTimeout(() => {
        const updatedRequest = { ...request, retryCount };
        this.queue.set(id, updatedRequest);
        
        this.emit({
          type: 'retry',
          payload: request.payload,
          correlationId: id,
          timestamp: new Date(),
          error
        });
      }, delay);

      console.log(`🔄 Reintent ${retryCount}/${maxRetries} per ${id} en ${delay}ms`);
    } else {
      // Fallada definitiva
      this.queue.delete(id);
      
      this.emit({
        type: 'failed',
        payload: request.payload,
        correlationId: id,
        timestamp: new Date(),
        error
      });
    }
  }

  // Health Monitor
  private startHealthMonitor(): void {
    setInterval(async () => {
      // Simple health check - verificar connectivitat amb Supabase
      try {
        await supabase.from('notification_preferences').select('count').limit(1);
        this.healthCheck = true;
      } catch (error) {
        this.healthCheck = false;
      }
    }, 30000); // Every 30 seconds
  }

  // Utility Methods
  private validatePayload(payload: NotificationPayload): boolean {
    return !!(payload.title && payload.message && payload.scheduledAt && payload.type);
  }

  private generateCorrelationId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async getCurrentUserId(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    return user.id;
  }

  private async cancelInDatabase(payload: NotificationPayload): Promise<void> {
    if (payload.taskId) {
      await supabase
        .from('notification_reminders')
        .update({ status: 'cancelled' })
        .eq('task_id', payload.taskId)
        .eq('status', 'pending');
    }
    
    if (payload.blockId) {
      await supabase
        .from('notification_reminders')
        .update({ status: 'cancelled' })
        .like('metadata->block_id', payload.blockId)
        .eq('status', 'pending');
    }
  }

  private getPriorityWeight(priority: NotificationPriority): number {
    switch (priority) {
      case NotificationPriority.URGENT: return 1;
      case NotificationPriority.HIGH: return 2;
      case NotificationPriority.NORMAL: return 3;
      case NotificationPriority.LOW: return 4;
      default: return 3;
    }
  }

  private logNotification(status: string, request: NotificationRequest, error?: Error): void {
    const prefix = status === 'SENT' ? '✅' : status === 'FAILED' ? '❌' : '📤';
    console.log(`${prefix} [${status}] ${request.payload.title} (${request.correlationId})`, {
      type: request.payload.type,
      priority: request.payload.priority,
      scheduledAt: request.payload.scheduledAt,
      retryCount: request.retryCount,
      error: error?.message
    });
  }

  // API d'estat per debugging
  public getQueueStatus() {
    return {
      queueSize: this.queue.size,
      processing: this.processing.size,
      healthCheck: this.healthCheck,
      circuitBreaker: { ...this.circuitBreaker }
    };
  }

  public getQueueContents() {
    return Array.from(this.queue.entries()).map(([id, request]) => ({
      id,
      title: request.payload.title,
      type: request.payload.type,
      priority: request.payload.priority,
      scheduledAt: request.payload.scheduledAt,
      retryCount: request.retryCount
    }));
  }
}

// Export singleton instance
export const notificationManager = NotificationManager.getInstance();