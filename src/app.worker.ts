import { Queue, Handler } from '@app/amqp-worker/amqp-worker.decorator';
import { MessageCallback, HaredoMessage } from 'haredo';

interface Worker {
  execute: MessageCallback<void>;
}

@Queue({ name: 'ms-algo.q1' })
export class AppWorker implements Worker {
  @Handler()
  public execute(data, message: HaredoMessage<any>) {
    console.log(data);
    message.ack();
  }
}
