export interface IParser {
  initialConsumer(url: string):  Promise<void>;
  checkConsumer(id: string): Promise<void>;
}