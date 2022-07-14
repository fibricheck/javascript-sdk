export class FCError extends Error {
  message: string;

  constructor(name: string, message?: string) {
    super(message);
    this.name = name;
    this.message = message || this.stack || '';
  }

  toJson() {
    return ({
      name: this.name,
      message: this.message,
    });
  }
}
