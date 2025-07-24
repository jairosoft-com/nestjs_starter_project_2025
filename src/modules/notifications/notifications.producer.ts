import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

/**
 * Service responsible for producing notification jobs to the queue.
 *
 * This producer service abstracts the complexity of queue interactions, providing
 * a simple interface for other services to trigger asynchronous notifications.
 * All jobs are configured with exponential backoff retry logic to handle
 * transient failures gracefully.
 *
 * @class NotificationsProducer
 */
@Injectable()
export class NotificationsProducer {
  constructor(
    @InjectQueue('notifications') private notificationsQueue: Queue,
  ) {}

  /**
   * Queues a welcome email notification for a new user.
   *
   * This job is typically triggered after successful user registration. The job
   * will be retried up to 3 times with exponential backoff if it fails.
   *
   * @param {Object} data - The welcome email job data
   * @param {string} data.email - The recipient's email address
   * @param {string} data.userId - The ID of the newly registered user
   * @returns {Promise<void>} Resolves when job is successfully queued
   * @example
   * // In auth service after user registration
   * await notificationsProducer.sendWelcomeEmail({
   *   email: 'user@example.com',
   *   userId: '123e4567-e89b-12d3-a456-426614174000'
   * });
   */
  async sendWelcomeEmail(data: { email: string; userId: string }) {
    await this.notificationsQueue.add('welcome-email', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
  }

  /**
   * Queues a password reset email notification.
   *
   * Sends a password reset link to the user's email. The reset token should be
   * generated securely and have an expiration time. Job includes retry logic
   * to ensure delivery reliability.
   *
   * @param {Object} data - The password reset job data
   * @param {string} data.email - The recipient's email address
   * @param {string} data.resetToken - The token for password reset verification
   * @returns {Promise<void>} Resolves when job is successfully queued
   * @example
   * const resetToken = generateSecureToken();
   * await notificationsProducer.sendPasswordResetEmail({
   *   email: 'user@example.com',
   *   resetToken: resetToken
   * });
   */
  async sendPasswordResetEmail(data: { email: string; resetToken: string }) {
    await this.notificationsQueue.add('password-reset', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
  }

  /**
   * Queues a generic notification of any type.
   *
   * This flexible method allows queueing of any notification type not covered
   * by specific methods. The processor must have a handler for the specified
   * type, otherwise the job will fail.
   *
   * @param {string} type - The type/name of the notification (used for routing)
   * @param {any} data - The notification payload data (structure depends on type)
   * @returns {Promise<void>} Resolves when job is successfully queued
   * @example
   * // Queue an order confirmation notification
   * await notificationsProducer.sendNotification('order-confirmed', {
   *   orderId: '12345',
   *   email: 'customer@example.com',
   *   items: ['Product A', 'Product B']
   * });
   */
  async sendNotification(type: string, data: any) {
    await this.notificationsQueue.add(type, data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
  }
}
