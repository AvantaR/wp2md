import { Parser } from '@app/parser';
import * as fs from 'fs/promises';

class App {
  constructor(private parser: Parser) {}

  async run(): Promise<void> {
    this.parser.parse(await this.loadFile());
  }

  private async loadFile(): Promise<string> {
    return fs.readFile('test.xml', 'utf8');
  }
}

const parser = new Parser();
const app = new App(parser);

app.run();
