import { PostParsed } from '@app/parser';
import dayjs from 'dayjs';
import fs from 'fs/promises';
import emoji from 'node-emoji';
import downloadCallback from 'download-file';
import util from 'util';
import consola from 'consola';

const download = util.promisify(downloadCallback);

export class Writer {
  private constructor() {}

  private posts: Promise<void>[];

  static async init() {
    try {
      await fs.mkdir('posts', {});
    } catch (err) {
      if (err.code === 'EEXIST') {
        console.log(`Directory exists, skipped creating`);
      }
    }

    return new Writer();
  }

  promise(posts: PostParsed[]): Writer {
    const dir = 'posts/';

    this.posts = posts.map((post) => {
      // post.images.forEach(async (image) => {
      //   const test = await download(image, { directory: './images' });

      //   console.log(test);
      // });

      let output = `---\n`;
      output += post.frontMatter;
      output += '---\n\n';
      output += post.content;
      output += '\n';

      const name = `${dayjs(post.postDate).format('YYYY-MM-DD')}-${post.slug}.md`;

      return this.save(`${dir}${name}`, output);
    });

    return this;
  }

  async keep() {
    const results = await Promise.allSettled(this.posts);

    const all = results.length;
    const failed = results.filter((result) => result.status === 'rejected').length;
    const success = results.length - failed;
    consola.success(`All: ${all}`);
    consola.success(`Succes: ${success}`);
    consola.info(`Failed: ${failed}`);
  }

  async save(name: string, output: string): Promise<void> {
    return fs.writeFile(`${name}.md`, output);
  }
}
