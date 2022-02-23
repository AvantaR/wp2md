import { Command } from 'commander';
import { Parser } from './parser.js';
import { Runner } from './runner.js';
import consola from 'consola';

(async () => {
  try {
    const program = new Command();

    program.name('wp2md').description('CLI to converting Wordpress Export File to Markdown Format');
    program.option('-i, --input <string>', 'input file', 'export.xml');

    program.parse(process.argv);

    const options = { input: program.opts().input };

    const parser = new Parser();
    const app = new Runner(options, parser);

    await app.run();
  } catch (error) {
    consola.error(error.message);
  }
})();
