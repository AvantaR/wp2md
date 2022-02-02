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

    const posts: { id: number; postDate: string; slug: string; frontMatter: string; content: string }[] =
      parsedXml.rss.channel.item
        .map((item: any) => {
          return {
            title: item.title,
            link: item.link,
            postId: item['wp:post_id'],
            slug: this.getSlug(item),
            pubDate: item.pubDate !== '' ? item.pubDate : undefined,
            postDate: item['wp:post_date'],
            content: nhm.translate(item['content:encoded']),
            status: item['wp:status'],
          };
        })
        .map((post: Post) => {
          const metadata = {
            title: post.title,
            link: post.link,
            slug: post.slug,
            postDate: post.postDate,
            pubDate: post.pubDate ?? undefined,
          };

          if (post.status === 'draft') {
            metadata['draft'] = true;
          }

          return {
            id: post.postId,
            slug: post.slug,
            postDate: post.postDate,
            frontMatter: yaml.dump(metadata),
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

    const writeToFiles = posts.map((post) => {
      let output = `---\n`;
      output += post.frontMatter;
      output += '---\n\n';
      output += post.content;
      output += '\n';

      return fs.writeFile(`posts/${dayjs(post.postDate).format('YYYY-MM-DD')}-${post.slug}.md`, output);
    });

    Promise.all(writeToFiles);
  }

  private getSlug(item: { title: string; link: string }): string {
    const slugFromLink = this.getSlugFromLink(item.link);

    return slugFromLink !== '' ? slugFromLink : this.getSlugFromTitle(item.title);
  }

  private getSlugFromLink(link: string): string {
    return decodeURIComponent(new URL(link).pathname.replace(/\//g, ''));
  }

  private getSlugFromTitle(title: string): string {
    console.log(title);
    return title
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '');
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
