import * as fs from 'fs/promises';
import * as xmlParser from 'fast-xml-parser';
import * as nodeHtmlMarkdown from 'node-html-markdown';
import * as yaml from 'js-yaml';
import { Post } from '@app/post';
import * as dayjs from 'dayjs';

export type PostParsed = {
  id: number;
  postDate: string;
  slug: string;
  frontMatter: string;
  content: string;
  images: string[];
};

export class Parser {
  parse(xmlContent: string): PostParsed[] {
    const parsedXml = xmlParser.parse(xmlContent);

    const nhm = new nodeHtmlMarkdown.NodeHtmlMarkdown();
    const posts = parsedXml.rss.channel.item;

    return posts
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
          images: this.getImages(item).map((image) => {
            return image[1];
          }),
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
          images: post.images,
        };
      });
  }

  private getImages(item: any): any[] {
    return [...item['content:encoded'].matchAll(/<img[^>]*src="(.+?\.(?:gif|jpe?g|png))"[^>]*>/gi)];
  }

  private getSlug(item: { title: string; link: string }): string {
    const slugFromLink = this.getSlugFromLink(item.link);

    return slugFromLink !== '' ? slugFromLink : this.getSlugFromTitle(item.title);
  }

  private getSlugFromLink(link: string): string {
    return decodeURIComponent(new URL(link).pathname.replace(/\//g, ''));
  }

  private getSlugFromTitle(title: string): string {
    return title
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '');
  }
}
