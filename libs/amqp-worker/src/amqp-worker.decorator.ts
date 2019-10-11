import { SetMetadata } from '@nestjs/common';
import {
  AMQP_WORKER_MODULE_QUEUE,
  AMQP_WORKER_MODULE_QUEUE_HANDLER,
} from './amqp-worker.constant';

export interface QueueProcessDecoratorOptions {
  name?: string;
}

export interface QueueDecoratorOptions {
  name?: string;
}

export const Queue = (options?: QueueDecoratorOptions): ClassDecorator =>
  SetMetadata(AMQP_WORKER_MODULE_QUEUE, options || {});

export const Handler = (): MethodDecorator =>
  SetMetadata(AMQP_WORKER_MODULE_QUEUE_HANDLER, {});
