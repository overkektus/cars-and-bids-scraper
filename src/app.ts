import { inject, injectable } from "inversify";

import { IApp } from "./app.interface";
import { IMQ } from "./services/mq/mq.interface";
import { TYPES } from "./types";

const QUEUE_NAME = "car-queue";

@injectable()
export class App implements IApp {
  constructor(
    @inject(TYPES.RabbitMQ) public rabbitMQ: IMQ
  ) { }

  async launch(): Promise<void> {
    await this.rabbitMQ.connect();
    this.rabbitMQ.assertQueue(QUEUE_NAME);
    this.rabbitMQ.setConsume(QUEUE_NAME, (data) => {
      console.log("Data received : ", `${Buffer.from(data!.content)}` );
    });
  }
}