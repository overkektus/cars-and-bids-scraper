import "reflect-metadata";
import { Container } from "inversify";

import { TYPES } from "./types";
import { IApp } from "./app.interface";
import { App } from "./app";
import { IMQ } from "./services/mq/mq.interface";
import { IConfigService } from "./services/config/config.interface";
import { ConfigService } from "./services/config/config.service";
import { RabbitMQ } from "./services/mq/rabbitMQ";

const container = new Container();
container.bind<IApp>(TYPES.App).to(App).inSingletonScope();
container.bind<IConfigService>(TYPES.Config).to(ConfigService).inSingletonScope();
container.bind<IMQ>(TYPES.RabbitMQ).to(RabbitMQ).inSingletonScope();

export { container };