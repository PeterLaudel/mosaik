let value: string | null = null;

/** In-memory slot for the last mail sent through the JSON transport, read by the e2e suite. */
export const lastEmail = {
  set(info: string) {
    value = info;
  },
  take(): string | null {
    const current = value;
    value = null;
    return current;
  },
};
