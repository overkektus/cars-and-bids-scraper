import { inject, injectable } from "inversify";
import mongoose from "mongoose";

import { IApp } from "./app.interface";
import { INITIAL_QUEUE_NAME, CHECK_QUEUE_NAME } from "./constants";
import { IConfigService } from "./services/config/config.interface";
import { IMQ } from "./services/mq/mq.interface";
import { ConsumerMessageType } from "./services/mq/rabbitMQ";
import { IParser } from "./services/parser/parser.interface";
import { TYPES } from "./types";

@injectable()
export class App implements IApp {
  constructor(
    @inject(TYPES.Config) public config: IConfigService,
    @inject(TYPES.RabbitMQ) public rabbitMQ: IMQ<ConsumerMessageType>,
    @inject(TYPES.Parser) public parser: IParser
  ) { }

  async launch(): Promise<void> {
    await mongoose.set('strictQuery', true);
    await mongoose.connect(this.config.get("MONGODB_URI"));
    console.log('db connected');
    
    await this.rabbitMQ.connect(this.config.get("RABBITMQ_URI"));
    this.rabbitMQ.assertQueue(INITIAL_QUEUE_NAME);
    this.rabbitMQ.assertQueue(CHECK_QUEUE_NAME);

    this.rabbitMQ.setConsume(INITIAL_QUEUE_NAME, (data) => {
      console.log("Data received : ", `${Buffer.from(data!.content)}`);

      const url: string = Buffer.from(data!.content).toString().slice(1, -1);
      this.parser.initialConsumer(url);
      this.rabbitMQ.accept(data);
    });

    this.rabbitMQ.setConsume(CHECK_QUEUE_NAME, (data) => {
      console.log(Buffer.from(data!.content).toString());
      this.parser.checkConsumer(Buffer.from(data!.content).toString().slice(1, -1));
      this.rabbitMQ.accept(data);
    });
  }
}