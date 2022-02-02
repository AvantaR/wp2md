import { Parser } from '@app/parser';
import { Writer } from '@app/writer';
import * as fs from 'fs/promises';

class App {
  constructor(private parser: Parser) {}

  async run(): Promise<void> {
    const posts = this.parser.parse(await this.loadFile());
    await (await Writer.init()).promise(posts).keep();
    console.log('My work is done!');
  }

  private async loadFile(): Promise<string> {
    return fs.readFile('test.xml', 'utf8');
  }
}

const parser = new Parser();
const app = new App(parser);

app.run();
