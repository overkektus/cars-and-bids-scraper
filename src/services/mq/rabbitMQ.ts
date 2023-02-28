import ampq, { ConsumeMessage } from 'amqplib';
import { inject, injectable } from 'inversify';

import { IConfigService } from '../config/config.interface';
import { TYPES } from '../../types';
import { IMQ } from './mq.interface';

export type ConsumerMessageType = ConsumeMessage | null;

@injectable()
export class RabbitMQ implements IMQ<ConsumerMessageType> {
  private connectionAMPQ!: ampq.Connection;
  public channelAMPQ!: ampq.Channel;
    
  constructor(@inject(TYPES.Config) public config: IConfigService) { }

  public accept(data: ConsumerMessageType): void {
    if (data) {
      this.channelAMPQ.ack(data);
    }
  }

  public async connect(uri: string): Promise<void> {
    try {
      this.connectionAMPQ = await ampq.connect(uri);
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
  
  public async setConsume(queueName: string, consumer: (msg: ConsumerMessageType) => void): Promise<void> {
    this.channelAMPQ.consume(queueName, consumer);
  }

  public async assertQueue(queueName: string): Promise<void> {
    this.channelAMPQ.assertQueue(queueName);
  }
}