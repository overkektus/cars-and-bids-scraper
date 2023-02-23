import ampq, { ConsumeMessage } from 'amqplib';
import { inject, injectable } from 'inversify';

import { IConfigService } from '../config/config.interface';
import { TYPES } from '../../types';
import { IMQ } from './mq.interface';

@injectable()
export class RabbitMQ implements IMQ {
  private connectionAMPQ!: ampq.Connection;
  private channelAMPQ!: ampq.Channel;
    
  constructor(@inject(TYPES.Config) public config: IConfigService) { }

  public async connect(): Promise<void> {
    try {
      this.connectionAMPQ = await ampq.connect(this.config.get('RABBITMQ_URL'));
      this.channelAMPQ = await this.connectionAMPQ.createChannel();
    } catch(error) {
      console.log(error);
    }
  }

  public async closeConnection(): Promise<void> {
    await this.channelAMPQ.close();
    await this.connectionAMPQ.close();
  }

  public sendData<T>(queueName: string, data: T): void {
    this.channelAMPQ.sendToQueue(queueName, Buffer.from(JSON.stringify(data)));
  }

  public setConsume(queueName: string, consumer: (msg: ConsumeMessage | null) => void): void {
    this.channelAMPQ.consume(queueName, consumer);
  }

  public assertQueue(queueName: string): void {
    this.channelAMPQ.assertQueue(queueName);
  }
}