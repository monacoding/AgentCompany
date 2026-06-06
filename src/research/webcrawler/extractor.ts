import { CrawlResult, ExtractedContent } from '../types';

export class Extractor {
  extract(crawl: CrawlResult): ExtractedContent {
    const markdown = this.cleanMarkdown(crawl.markdown);
    const text = markdown.replace(/[#*`>\-\[\]]/g, ' ').replace(/\s+/g, ' ').trim();

    return {
      url: crawl.url,
      title: crawl.title,
      text: text.slice(0, 8000),
      markdown: markdown.slice(0, 10000),
    };
  }

  merge(contents: ExtractedContent[]): string {
    return contents
      .map(
        (c, i) =>
          `## Source ${i + 1}: ${c.title}\nURL: ${c.url}\n\n${c.markdown.slice(0, 2500)}`
      )
      .join('\n\n---\n\n');
  }

  private cleanMarkdown(markdown: string): string {
    return markdown
      .replace(/\!\[[^\]]*\]\([^)]+\)/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\n{4,}/g, '\n\n')
      .trim();
  }
}
