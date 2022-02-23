import * as fs from 'fs/promises';
import { Parser } from './parser.js';
import { Options } from './types.js';
import { Writer } from './writer.js';

export class Runner {
  constructor(private options: Options, private parser: Parser) {}

  async run(): Promise<void> {
    const file = await this.loadFile();

    const posts = this.parser.parse(file);
    await (await Writer.init()).promise(posts).keep();
    console.log('My work is done!');
  }

  private async loadFile(): Promise<string> {
    try {
      return await fs.readFile(this.options.input, 'utf8');
    } catch {
      throw new Error('Cannot find file');
    }
  }
}
