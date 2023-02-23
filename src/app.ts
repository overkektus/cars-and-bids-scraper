import { inject, injectable } from "inversify";

import { IApp } from "./app.interface";
import { IMQ } from "./services/mq/mq.interface";
import { ConsumerMessageType } from "./services/mq/rabbitMQ";
import { IParser } from "./services/parser/parser.interface";
import { TYPES } from "./types";

const QUEUE_NAME = "initial";

@injectable()
export class App implements IApp {
  constructor(
    @inject(TYPES.RabbitMQ) public rabbitMQ: IMQ<ConsumerMessageType>,
    @inject(TYPES.Parser) public parser: IParser
  ) { }

  async launch(): Promise<void> {
    await this.rabbitMQ.connect();
    this.rabbitMQ.assertQueue(QUEUE_NAME);

    await this.parser.launchParser();

    this.rabbitMQ.setConsume(QUEUE_NAME, (data) => {
      console.log("Data received : ", `${Buffer.from(data!.content)}`);

      const url: string = Buffer.from(data!.content).toString();
      this.parser.initialConsumer(url);
      this.rabbitMQ.accept(data);
    });
  }
}