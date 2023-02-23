import { IApp } from './app.interface';
import { container } from './inversify.config';
import { TYPES } from './types';

const app = container.get<IApp>(TYPES.App);
app.launch();