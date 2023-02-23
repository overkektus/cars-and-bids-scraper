import "reflect-metadata";
import { config, DotenvParseOutput } from 'dotenv';
import { injectable } from 'inversify';
import { IConfigService } from './config.interface';

@injectable()
export class ConfigService implements IConfigService {
  private config: DotenvParseOutput;

  constructor() {
    const { error, parsed } = config();
    if (error) {
      throw new Error('Не найден файл .env');
    }
    if (!parsed) {
      throw new Error('Пустой файл .env');
    }
    this.config = parsed;
  }

  get(key: string): string {
    const res = this.config[key];
    if (!res) {
      throw new Error('Нет такого ключа');
    }
    return res;
  }
}
