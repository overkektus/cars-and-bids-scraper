import "reflect-metadata";
import { Container } from "inversify";

import { TYPES } from "./types";
import { IApp } from "./app.interface";
import { App } from "./app";
import { IMQ } from "./services/mq/mq.interface";
import { IConfigService } from "./services/config/config.interface";
import { ConfigService } from "./services/config/config.service";
import { ConsumerMessageType, RabbitMQ } from "./services/mq/rabbitMQ";
import { IParser } from "./services/parser/parser.interface";
import { Parser } from "./services/parser/parser.service";

const container = new Container();
container.bind<IApp>(TYPES.App).to(App).inSingletonScope();
container.bind<IConfigService>(TYPES.Config).to(ConfigService).inSingletonScope();
container.bind<IMQ<ConsumerMessageType>>(TYPES.RabbitMQ).to(RabbitMQ).inSingletonScope();
container.bind<IParser>(TYPES.Parser).to(Parser);

export { container };