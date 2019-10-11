import { Test, TestingModule } from '@nestjs/testing';
import { AmqpWorkerService } from './amqp-worker.service';

describe('AmqpWorkerService', () => {
  let service: AmqpWorkerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AmqpWorkerService],
    }).compile();

    service = module.get<AmqpWorkerService>(AmqpWorkerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
