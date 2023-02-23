export interface IParser {
  launchParser(): Promise<void>;
  initialConsumer(url: string):  Promise<void>;
}