import { inject, injectable } from "inversify";
import * as puppeteer from "puppeteer";
import { NOTIFICATION_QUEUE_NAME } from "../../constants";
import { INotificationMessage, ThreadEvent } from "../../models/car.interface";

import carModel from "../../models/car.model";
import { TYPES } from "../../types";
import { IConfigService } from "../config/config.interface";
import { IMQ } from "../mq/mq.interface";
import { ConsumerMessageType } from "../mq/rabbitMQ";
import { IParser } from "./parser.interface";

const lastActionQuerySelector = ".comments > .thread > li";

@injectable()
export class Parser implements IParser {
  constructor(
    @inject(TYPES.Config) public config: IConfigService,
    @inject(TYPES.RabbitMQ) public rabbitMQ: IMQ<ConsumerMessageType>,
  ) { }

  public async initialConsumer(url: string): Promise<void> {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    try {
      await page.goto(url);
      await page.waitForSelector(lastActionQuerySelector);

      const actionElement = await page.$('.thread li:first-of-type');

      const dataId = await actionElement?.evaluate(el => el.getAttribute('data-id'));

      const car = await carModel.findOneAndUpdate(
        { url },
        { lastEventId: dataId },
        { new: true }
      );

      if (!car) {
        throw new Error('Car not found');
      }
    } catch(error) {
      console.error(`Error: ${error}`);
    } finally {
      await browser.close();
    }
  }

  public async checkConsumer(id: string): Promise<void> {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    try {
      const car = await carModel.findById(id);

      if (!car) {
        console.log('car not found');
        // TODO:
        return;
      }

      await page.goto(car.url);
      await page.waitForSelector(lastActionQuerySelector);

      const lastActionElement = await page.$(lastActionQuerySelector);
      const dataId = await lastActionElement?.evaluate(el => el.getAttribute('data-id'));

      if (car.lastEventId === dataId) {
        console.log('nothing new');
        // Nothing new
        return;
      }
      
      const newEvents = [];
      const newEventsIds: Array<string>= [dataId];

      let nextElement = await lastActionElement!.evaluateHandle(el => el.nextElementSibling);
      let nextDataId = await nextElement?.evaluate(el => el.getAttribute('data-id'));
      while (car.lastEventId !== nextDataId) {
        newEvents.push(nextElement);
        newEventsIds.push(nextDataId);
        nextElement = await nextElement!.evaluateHandle(el => el.nextElementSibling);
        nextDataId = await nextElement?.evaluate(el => el.getAttribute('data-id'));
      }

      await carModel.findOneAndUpdate(
        { id },
        { lastEventId: newEventsIds[0] },
        { new: true }
      );

      const result = await Promise.all(newEventsIds.map(id => this.transform(page, id)).reverse());

      this.rabbitMQ.sendData<INotificationMessage>(NOTIFICATION_QUEUE_NAME, { carId: car.id, actions: result });
    } catch(error) {
      console.error(`Error: ${error}`);
    } finally {
      await browser.close();
    }
  }

  private async transform(page: puppeteer.Page, id: string): Promise<ThreadEvent> {
    const actionElement = await page.$(`.thread li[data-id="${id}"]`);
    const className = await actionElement?.evaluate(el => el.getAttribute('class'));

    let actionData: ThreadEvent;

    switch(className) {
      case 'bid':
        const bidElement = await page.$(`.thread li[data-id="${id}"] > div > div.content > dl > dd`);
        const bidValue = await bidElement?.evaluate((el: any) => el.textContent);
        actionData = {
          id,
          type: className,
          value: bidValue,
        };
        break;
      case 'comment':
      case 'system-comment':
      case 'flagged-comment':
        const commentElement = await page.$(`.thread li[data-id="${id}"] > div > div.content > div.message > p`);
        const comment = await commentElement?.evaluate((el: any) => el.textContent);
        actionData = {
          id,
          type: className,
          comment,
        };
      break;
    }
    return actionData!;
  }

}