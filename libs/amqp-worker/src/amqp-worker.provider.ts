import { Queue, Haredo, HaredoChain } from 'haredo';
import { AmqpWorkerModuleOptions, AmqpWorkerHandler } from '.';
import { getQueueToken, getQueueOptionsToken } from './ampq-worker.utils';

function buildQueue(moduleOptions: AmqpWorkerModuleOptions): HaredoChain {
  const queue = new Queue(moduleOptions.queueName, moduleOptions.queueOptions);
  const connection = new Haredo(moduleOptions.connectionOptions);

  return connection
    .queue(queue)
    .prefetch(1)
    .autoAck(false)
    .reestablish(true);
}

export function createQueueProviders(option: AmqpWorkerModuleOptions): any {
  return [
    {
      provide: getQueueToken(option.queueName),
      useFactory: o => buildQueue(o),
      inject: [getQueueOptionsToken(option.queueName)],
    },
  ];
}

export function createQueueOptionProviders(
  option: AmqpWorkerModuleOptions,
): any {
  return [
    {
      provide: getQueueOptionsToken(option.queueName),
      useValue: option,
    },
  ];
}
