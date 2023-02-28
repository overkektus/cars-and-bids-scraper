export type EventType = 'bid' | 'comment' | 'system-comment' | 'flagged-comment';

interface BaseEvent {
  id: string;
  type: EventType;
}

interface BidEvent extends BaseEvent {
  type: 'bid';
  value: number;
}

interface CommentEvent extends BaseEvent {
  type: 'comment' | 'system-comment' | 'flagged-comment';
  comment: string;
}

export type ThreadEvent = CommentEvent | BidEvent | null;

export interface INotificationMessage {
  carId: string,
  actions: Array<ThreadEvent>,
}

export interface ICar {
  userId: number;
  url: string;
  carTitle: string;
  lastEventId: string;
}