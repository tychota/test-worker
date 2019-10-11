import {
  Injectable as InjectableDecorator,
  Type,
  Logger,
} from '@nestjs/common';
import { ModulesContainer, ModuleRef, Reflector } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { Module } from '@nestjs/core/injector/module';
import { Injectable } from '@nestjs/common/interfaces';
import { MetadataScanner } from '@nestjs/core/metadata-scanner';

import { HaredoChain, MessageCallback } from 'haredo';

import {
  AMQP_WORKER_MODULE_QUEUE,
  AMQP_WORKER_MODULE_QUEUE_HANDLER,
} from './amqp-worker.constant';
import { getQueueToken } from './ampq-worker.utils';

@InjectableDecorator()
// @ts-ignore
export class AmqpWorkerExplorer {
  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly modulesContainer: ModulesContainer,
    private readonly logger: Logger,
    private readonly reflector: Reflector,
  ) {}

  public explore() {
    const components = AmqpWorkerExplorer.getQueueComponents([
      ...this.modulesContainer.values(),
    ]);
    components.map((wrapper: InstanceWrapper) => {
      this.exploreComponent(wrapper);
    });
  }

  private exploreComponent(wrapper: InstanceWrapper) {
    const { instance, metatype } = wrapper;

    const queue = this.getQueue(metatype);

    const instancePrototype = Object.getPrototypeOf(instance);

    new MetadataScanner().scanFromPrototype(
      instance,
      instancePrototype,
      (key: string) => {
        const target = instance[key];
        if (AmqpWorkerExplorer.isHandler(target, this.reflector)) {
          AmqpWorkerExplorer.handle(
            target,
            queue,
            AmqpWorkerExplorer.getHandlerMetadata(
              instance[key],
              this.reflector,
            ),
          );
        }
      },
    );
  }

  private getQueue(metatype: Function | Type<any>) {
    const queueName = AmqpWorkerExplorer.getQueueComponentMetadata(metatype)
      .name;
    const queueToken = getQueueToken(queueName);
    let queue: HaredoChain;

    try {
      queue = AmqpWorkerExplorer.getQueue(this.moduleRef, queueToken);
    } catch (err) {
      this.logger.error(
        queueName
          ? `No Queue was found with the given name (${queueName}). Check your configuration.`
          : 'No Queue was found. Check your configuration.',
      );
      throw err;
    }

    return queue;
  }

  static handle(target: MessageCallback<any>, queue: HaredoChain, options?) {
    queue.subscribe(target);
  }

  static isQueueComponent(
    // tslint:disable-next-line: ban-types
    target: Type<any> | Function,
    reflector: Reflector = new Reflector(),
  ): boolean {
    return !!reflector.get(AMQP_WORKER_MODULE_QUEUE, target);
  }

  static getQueueComponentMetadata(
    target: Type<any> | Function,
    reflector: Reflector = new Reflector(),
  ): any {
    return reflector.get(AMQP_WORKER_MODULE_QUEUE, target);
  }

  static getHandlerMetadata(
    target: Type<any> | Function,
    reflector: Reflector = new Reflector(),
  ): any {
    return reflector.get(AMQP_WORKER_MODULE_QUEUE_HANDLER, target);
  }

  static isHandler(
    target: Type<any> | Function,
    reflector: Reflector = new Reflector(),
  ): boolean {
    return !!reflector.get(AMQP_WORKER_MODULE_QUEUE_HANDLER, target);
  }

  static getQueue(moduleRef: ModuleRef, queueToken: string): HaredoChain {
    return moduleRef.get<HaredoChain>(queueToken);
  }

  static getQueueComponents(
    modules: Module[],
  ): Array<InstanceWrapper<Injectable>> {
    return modules
      .map((module: Module) => module.components)
      .reduce((acc, map) => {
        acc.push(...map.values());
        return acc;
      }, [])
      .filter(
        (wrapper: InstanceWrapper) =>
          wrapper.metatype &&
          AmqpWorkerExplorer.isQueueComponent(wrapper.metatype),
      );
  }
}
