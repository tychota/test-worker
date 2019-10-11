import { Module, DynamicModule, Logger, OnModuleInit } from '@nestjs/common';
import { QueueOptions, HaredoOptions } from 'haredo';
import {
  createQueueProviders,
  createQueueOptionProviders,
} from './amqp-worker.provider';
import { AmqpWorkerExplorer } from './amqp-worker.explorer';

export interface AmqpWorkerHandler {}

export interface ConnectionOptions {
  connection?: HaredoOptions['connection'] | string;
}

export interface AmqpWorkerModuleOptions {
  connectionOptions: ConnectionOptions;
  queueName: string;
  queueOptions: Partial<QueueOptions>;
  handler: AmqpWorkerHandler;
}

@Module({})
export class AmqpWorkerModule implements OnModuleInit {
  public static register(options: AmqpWorkerModuleOptions): DynamicModule {
    const queueProviders = createQueueProviders(options);
    const queueOptionProviders = createQueueOptionProviders(options);
    return {
      module: AmqpWorkerModule,
      providers: [
        ...queueProviders,
        ...queueOptionProviders,
        AmqpWorkerExplorer,
        { provide: Logger, useValue: new Logger('AMQPModule') },
      ],
      exports: queueProviders,
    };
  }

  constructor(private readonly explorer: AmqpWorkerExplorer) {}

  onModuleInit() {
    this.explorer.explore();
  }
}
