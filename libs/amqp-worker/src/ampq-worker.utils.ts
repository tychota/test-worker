export function getQueueToken(name: string): string {
  return `AmqpWorker_queue_${name}`;
}

export function getQueueOptionsToken(name?: string): string {
  return `BullQueueOptions_${name}`;
}
