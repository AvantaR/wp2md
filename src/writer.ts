import * as dayjs from 'dayjs';
import * as fs from 'fs/promises';

export class Writer {
  private constructor() {}

  private posts: [];

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

  promise(posts: any): Writer {
    const dir = 'posts/';

    this.posts = posts.map((post) => {
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
    const results: { status: string; value: any }[] = await Promise.allSettled(this.posts);

    const all = results.length;
    const failed = results.filter((result) => result.status === 'rejected').length;
    const success = results.length - failed;

    console.log(`All: ${all}`);
    console.log(`Succes: ${success}`);
    console.log(`Failed: ${failed}`);
  }

  async save(name: string, output: string): Promise<void> {
    return fs.writeFile(`${name}.md`, output);
  }
}
