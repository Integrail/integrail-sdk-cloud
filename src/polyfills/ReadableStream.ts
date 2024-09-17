if (typeof ReadableStream !== "undefined") {
  if (ReadableStream.prototype.values == null)
    ReadableStream.prototype.values = function ({
      preventCancel = false,
    } = {}): AsyncIterableIterator<any> {
      const reader = this.getReader();
      return {
        async next(): Promise<IteratorResult<any, any>> {
          try {
            const result = await reader.read();
            if (result.done) {
              reader.releaseLock();
            }
            return result as IteratorResult<any, any>;
          } catch (e) {
            reader.releaseLock();
            throw e;
          }
        },
        async return(value) {
          if (!preventCancel) {
            const cancelPromise = reader.cancel(value);
            reader.releaseLock();
            await cancelPromise;
          } else {
            reader.releaseLock();
          }
          return { done: true, value };
        },
        [Symbol.asyncIterator]() {
          return this;
        },
      };
    };

  if (ReadableStream.prototype[Symbol.asyncIterator] == null)
    ReadableStream.prototype[Symbol.asyncIterator] = ReadableStream.prototype.values;
}
