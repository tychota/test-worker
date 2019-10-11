import { Module } from '@nestjs/common';
import { AmqpWorkerModule } from '@app/amqp-worker';

import { AppWorker } from './app.worker';

@Module({
  imports: [
    AmqpWorkerModule.register({
      connectionOptions: { connection: 'amqp://guest:guest@localhost:5672' },
      queueName: 'ms-algo.q1',
      queueOptions: { type: 'x-consistent-hash' },
      handler: [AppWorker],
    }),
  ],
  providers: [AppWorker],
})
export class AppModule {}
