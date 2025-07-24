import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';

interface NotificationData {
  email: string;
  userId?: string;
  resetToken?: string;
}

/**
 * Processor responsible for handling notification jobs from the queue.
 *
 * This worker processes asynchronous notification jobs, implementing the consumer
 * side of the queue pattern. It handles different notification types with specific
 * handlers and provides comprehensive logging for monitoring and debugging.
 * The processor includes automatic retry handling through BullMQ.
 *
 * @class NotificationsProcessor
 * @extends {WorkerHost}
 */
@Processor('notifications')
export class NotificationsProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationsProcessor.name);

  /**
   * Main processing method for notification jobs.
   *
   * This method is called by BullMQ for each job in the queue. It routes
   * jobs to specific handlers based on the job name/type. If a handler
   * throws an error, BullMQ will retry according to the job's configuration.
   *
   * @param {Job<NotificationData>} job - The BullMQ job containing notification data
   * @returns {Promise<{ success: boolean }>} Promise resolving to success status
   * @throws {Error} If job processing fails (triggers retry)
   */
  process(job: Job<NotificationData>): Promise<{ success: boolean }> {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);

    switch (job.name) {
      case 'welcome-email':
        if (job.data.userId) {
          this.handleWelcomeEmail({
            email: job.data.email,
            userId: job.data.userId,
          });
        }
        break;
      case 'password-reset':
        if (job.data.resetToken) {
          this.handlePasswordReset({
            email: job.data.email,
            resetToken: job.data.resetToken,
          });
        }
        break;
      default:
        this.handleGenericNotification(job.name, job.data);
    }

    return Promise.resolve({ success: true });
  }

  /**
   * Handles the processing of welcome email notifications.
   *
   * Sends a welcome email to newly registered users. In production, this would
   * integrate with an email service provider (e.g., SendGrid, AWS SES).
   *
   * @private
   * @param {Object} data - The welcome email data
   * @param {string} data.email - The recipient's email address
   * @param {string} data.userId - The ID of the newly registered user
   * @example
   * // Called internally by process() method
   * this.handleWelcomeEmail({ email: 'user@example.com', userId: '123' });
   */
  private handleWelcomeEmail(data: { email: string; userId: string }) {
    this.logger.log(`Sending welcome email to ${data.email}`);
    // Implement email sending logic here
    // For now, just logging
  }

  /**
   * Handles the processing of password reset email notifications.
   *
   * Sends password reset instructions with a secure token. The token should
   * be validated and have an expiration time when processed by the reset endpoint.
   *
   * @private
   * @param {Object} data - The password reset data
   * @param {string} data.email - The recipient's email address
   * @param {string} data.resetToken - The token for password reset verification
   * @example
   * // Called internally by process() method
   * this.handlePasswordReset({ email: 'user@example.com', resetToken: 'secure-token' });
   */
  private handlePasswordReset(data: { email: string; resetToken: string }) {
    this.logger.log(`Sending password reset email to ${data.email}`);
    // Implement password reset email logic here
  }

  /**
   * Handles the processing of generic notification types.
   *
   * Fallback handler for notification types that don't have specific handlers.
   * Can be extended to support additional notification types without modifying
   * the main process method.
   *
   * @private
   * @param {string} type - The type/name of the notification
   * @param {NotificationData} data - The notification payload data
   * @example
   * // Called for non-standard notification types
   * this.handleGenericNotification('order-shipped', { email: 'user@example.com' });
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private handleGenericNotification(type: string, data: NotificationData) {
    this.logger.log(`Handling notification of type: ${type}`);
    // Implement generic notification handling
  }

  /**
   * Event handler for failed jobs.
   *
   * Called when a job fails after all retry attempts are exhausted. This is
   * crucial for monitoring and alerting on persistent failures that may require
   * manual intervention.
   *
   * @param {Job} job - The failed job with all metadata
   * @param {Error} error - The error that caused the failure
   * @example
   * // Automatically called by BullMQ on job failure
   * // Logs: "Job 123 of type welcome-email failed with error: Connection timeout"
   */
  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(
      `Job ${job.id} of type ${job.name} failed with error: ${error.message}`,
      error.stack,
    );
  }

  /**
   * Event handler for completed jobs.
   *
   * Called when a job completes successfully. Useful for metrics collection,
   * audit logging, and monitoring job processing performance.
   *
   * @param {Job} job - The completed job with processing results
   * @example
   * // Automatically called by BullMQ on job completion
   * // Logs: "Job 123 of type welcome-email completed successfully"
   */
  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id} of type ${job.name} completed successfully`);
  }
}
