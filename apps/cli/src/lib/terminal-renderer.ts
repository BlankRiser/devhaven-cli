import chalk from "chalk";

import markdownit from "markdown-it";
import terminalLink from "terminal-link";
import stripAnsi from "strip-ansi";
import wrapAnsi from "wrap-ansi";

const md = markdownit();
const terminalWidth = process.stdout.columns || 80;

/**
 * Convert markdown to terminal-friendly output with ANSI formatting
 */
function markdownToTerminal(text: string): string {
  // Parse markdown to HTML
  const html = md.render(text);

  // Convert HTML to terminal-friendly format
  let result = html
    // Handle headings
    .replace(
      /<h1>(.*?)<\/h1>/g,
      (_, content) => `\n${chalk.bold.underline.blue(content)}\n`
    )
    .replace(
      /<h2>(.*?)<\/h2>/g,
      (_, content) => `\n${chalk.bold.blue(content)}\n`
    )
    .replace(/<h3>(.*?)<\/h3>/g, (_, content) => `\n${chalk.bold(content)}\n`)

    // Handle emphasis and bold
    .replace(/<em>(.*?)<\/em>/g, (_, content) => chalk.italic(content))
    .replace(/<strong>(.*?)<\/strong>/g, (_, content) => chalk.bold(content))

    // Handle code blocks and inline code
    .replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/g, (_, content) => {
      const codeBlock = content.trim();
      const lines = codeBlock.split("\n");
      const paddedLines = lines.map((line: string) => `  ${line}`);
      return `\n${chalk.bgBlack.white(paddedLines.join("\n"))}\n`;
    })
    .replace(/<code>(.*?)<\/code>/g, (_, content) =>
      chalk.bgBlack.white(` ${content} `)
    )

    // Handle lists
    .replace(/<li>(.*?)<\/li>/g, (_, content) => `  • ${content}`)

    // Handle links
    .replace(/<a href="(.*?)">(.*?)<\/a>/g, (_, url, text) => {
      return terminalLink(text, url, {
        fallback: (text, url) => `${text} (${url})`,
      });
    })

    // Handle paragraphs
    .replace(/<p>(.*?)<\/p>/g, (_, content) => `${content}\n`);

  // Clean up remaining HTML tags
  result = result.replace(/<[^>]*>/g, "");

  // Wrap text to terminal width and handle line breaks
  result = wrapAnsi(result, terminalWidth, { hard: true });

  return result;
}

/**
 * Manage terminal output for streaming content
 */
export class TerminalRendererClass {
  private buffer: string = "";
  private lastRenderedLines: number = 0;

  constructor(private clearPrevious: boolean = true) {}

  render(content: string): void {
    // Add new content to buffer
    this.buffer += content;

    // Format the entire buffer
    const formattedText = markdownToTerminal(this.buffer);

    if (this.clearPrevious && this.lastRenderedLines > 0) {
      // Move cursor up to overwrite previous output
      process.stdout.write(`\x1b[${this.lastRenderedLines}A`);
      process.stdout.write("\x1b[J");
    }

    // Write the formatted text
    process.stdout.write(formattedText);

    // Calculate number of lines for next render
    this.lastRenderedLines = stripAnsi(formattedText).split("\n").length;
  }

  clear(): void {
    this.buffer = "";
    if (this.lastRenderedLines > 0) {
      process.stdout.write(`\x1b[${this.lastRenderedLines}A`);
      process.stdout.write("\x1b[J");
      this.lastRenderedLines = 0;
    }
  }
}

export const terminalRenderer = new TerminalRendererClass();
