export interface IMQ<C> {
  connect(): Promise<void>;
  closeConnection(): Promise<void>;
  sendData<T>(queueName: string, data: T): void;
  accept(data: C): void;
  setConsume(queueName: string, consumer: (msg: C) => void): void;
  assertQueue(queueName: string): void;
}