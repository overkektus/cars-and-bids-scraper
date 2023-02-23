import { inject, injectable } from "inversify";
import * as puppeteer from "puppeteer";

import { TYPES } from "../../types";
import { IConfigService } from "../config/config.interface";
import { IParser } from "./parser.interface";

@injectable()
export class Parser implements IParser {
  private browser: puppeteer.Browser | null = null;

  constructor(@inject(TYPES.Config) public config: IConfigService) { }

  public async launchParser(): Promise<void> {
    this.browser = await puppeteer.launch();
  }

  public async initialConsumer(url: string): Promise<void> {
    const lastActionQuerySelector = ".comments > .thread > li";
    
    if (this.browser) {
      const page = await this.browser.newPage();
      await page.goto(url);
      await page.waitForSelector(lastActionQuerySelector);
      const id = await page.evaluate(`document.querySelector("${lastActionQuerySelector}").getAttribute("data-id")`);
      console.log(id);
      // 4) save in db
    }
  }

}