export interface IMQ {
  connect(): Promise<void>;
  closeConnection(): Promise<void>;
  sendData<T>(queueName: string, data: T): void;
  setConsume(queueName: string, consumer: (arg0: any | null) => void): void;
  assertQueue(queueName: string): void;
}