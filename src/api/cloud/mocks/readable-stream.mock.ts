import { Readable } from "stream";

export class MockReadableStream extends Readable {
  private dataQueue: Buffer[];
  private ended: boolean;

  constructor(dataQueue: Buffer[]) {
    super();
    this.dataQueue = dataQueue;
    this.ended = false;
  }

  _read() {
    if (this.dataQueue.length > 0) {
      this.push(this.dataQueue.shift());
    } else if (!this.ended) {
      this.ended = true;
      this.push(null);
    }
  }

  emitData(data: Buffer) {
    this.dataQueue.push(data);
    this.read(0);
  }

  emitEnd() {
    this.ended = true;
    this.push(null);
  }

  emitError(error: Error) {
    this.emit("error", error);
  }
}
