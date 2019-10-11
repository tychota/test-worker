import { Module } from '@nestjs/common';
import { AmqpWorkerService } from './amqp-worker.service';

@Module({
  providers: [AmqpWorkerService],
  exports: [AmqpWorkerService],
})
export class AmqpWorkerModule {}
