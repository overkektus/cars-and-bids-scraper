export interface IMQ<C> {
  connect(uri: string): Promise<void>;
  closeConnection(): Promise<void>;
  sendData<T>(queueName: string, data: T): void;
  accept(data: C): void;
  setConsume(queueName: string, consumer: (msg: C) => void): Promise<void>;
  assertQueue(queueName: string): Promise<void>;
}