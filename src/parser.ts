import * as fs from 'fs/promises';
import * as xmlParser from 'fast-xml-parser';
import { NodeHtmlMarkdown } from 'node-html-markdown';
import * as yaml from 'js-yaml';
import { Post } from '@app/post';
import * as dayjs from 'dayjs';

export class Parser {
  async parse(xmlContent: string) {
    const parsedXml = xmlParser.parse(xmlContent);

    const nhm = new NodeHtmlMarkdown();

    const posts: { id: number; pubDate: string; slug: string; frontMatter: string; content: string }[] =
      parsedXml.rss.channel.item
        .map((item) => {
          return {
            title: item.title,
            link: item.link,
            postId: item['wp:post_id'],
            slug: this.getSlug(item.link),
            pubDate: item.pubDate,
            content: nhm.translate(item['content:encoded']),
          };
        })
        .map((post: Post) => {
          return {
            id: post.postId,
            slug: post.slug,
            pubDate: post.pubDate,
            frontMatter: yaml.dump({ title: post.title, link: post.link, slug: post.slug, pubDate: post.pubDate }),
            content: post.content,
          };
        });

    try {
      await fs.mkdir('posts', {});
    } catch (err) {
      if (err.code === 'EEXIST') {
        console.log(`Directory exists, skipped creating`);
      }
    }

    const writeToFile = posts.map(async (post) => {
      let output = `---\n`;
      output += post.frontMatter;
      output += '---\n\n';
      output += post.content;
      output += '\n';

      return await fs.writeFile(`posts/${dayjs(post.pubDate).format('YYYY-MM-DD')}-${post.slug}.md`, output);
    });

    // Promise.all(writeToFile);
  }

  private getSlug(link): string {
    return decodeURIComponent(new URL(link).pathname.replace(/\//g, ''));
  }
}

// async parsePost(xmlPost: string): Promise<Post> {
//   const parsedXml = xmlParser.parse(xmlPost);
//   console.log(parsedXml);
//   return {
//     title: parsedXml.item.title,
//     postId: parsedXml.item['wp:post_id'],
//     content: parsedXml.item['content:encoded'],
//   };
// }
