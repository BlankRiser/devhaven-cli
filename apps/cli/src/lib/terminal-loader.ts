import ora, { type Ora, type Options as OraOptions } from "ora";

export class TerminalLoader {
  private spinner: Ora;
  private isActive: boolean;

  /**
   * Create a new terminal loader using Ora
   * @param options Ora configuration options
   */
  constructor(options?: OraOptions) {
    // Set default options or use provided ones
    const defaultOptions: OraOptions = {
      color: "cyan",
      spinner: "dots",
      ...options,
    };

    this.spinner = ora(defaultOptions);
    this.isActive = false;
  }

  /**
   * Start the loader with a message
   * @param text Message to display alongside the spinner
   */
  start(text: string): void {
    this.spinner.text = text;
    this.spinner.start();
    this.isActive = true;
  }

  /**
   * Update the loader message
   * @param text New message to display
   */
  update(text: string): void {
    if (!this.isActive) {
      this.start(text);
      return;
    }

    this.spinner.text = text;
  }

  /**
   * Track and display progress
   * @param current Current progress value
   * @param total Total items
   * @param text Message to display with progress
   */
  progress(current: number, total: number, text: string): void {
    this.update(`${text} [${current}/${total}]`);
  }

  /**
   * Stop the loader and clear the line
   */
  stop(): void {
    if (!this.isActive) return;

    this.spinner.stop();
    this.isActive = false;
  }

  /**
   * Stop the loader and display a success message
   * @param text Success message to display
   */
  succeed(text?: string): void {
    if (text) {
      this.spinner.text = text;
    }
    this.spinner.succeed();
    this.isActive = false;
  }

  /**
   * Stop the loader and display a failure message
   * @param text Error message to display
   */
  fail(text?: string): void {
    if (text) {
      this.spinner.text = text;
    }
    this.spinner.fail();
    this.isActive = false;
  }

  /**
   * Stop the loader and display an info message
   * @param text Info message to display
   */
  info(text?: string): void {
    if (text) {
      this.spinner.text = text;
    }
    this.spinner.info();
    this.isActive = false;
  }

  /**
   * Stop the loader and display a warning message
   * @param text Warning message to display
   */
  warn(text?: string): void {
    if (text) {
      this.spinner.text = text;
    }
    this.spinner.warn();
    this.isActive = false;
  }

  /**
   * Change the spinner color
   * @param color Color name
   */
  color(
    color:
      | "black"
      | "red"
      | "green"
      | "yellow"
      | "blue"
      | "magenta"
      | "cyan"
      | "white"
      | "gray"
  ): void {
    this.spinner.color = color;
  }

  /**
   * Returns the underlying Ora instance for advanced use cases
   */
  get instance(): Ora {
    return this.spinner;
  }
}

export const terminalLoader = new TerminalLoader({
  color: "blue",
  spinner: "dots",
});
