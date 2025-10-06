/* Lightweight boot tracer utility for startup diagnostics.
   - Collects events in window.__BOOT_TRACE
   - Provides trace, mark, error, getTrace, clear APIs
*/

export type BootEvent = {
  t: number; // epoch ms
  phase: string;
  level: 'info' | 'mark' | 'error';
  msg?: string;
  data?: unknown;
};

declare global {
  interface Window {
    __BOOT_TRACE?: BootEvent[];
  }
}

function push(event: BootEvent) {
  const arr = (window.__BOOT_TRACE = window.__BOOT_TRACE || []);
  arr.push(event);
  // Mirror to console for quick visibility
  const time = new Date(event.t).toISOString();
  const prefix = `[BOOT ${event.level.toUpperCase()}][${time}] ${event.phase}`;
  if (event.level === 'error') {
    // eslint-disable-next-line no-console
    console.error(prefix, event.msg || '', event.data ?? '');
  } else if (event.level === 'mark') {
    // eslint-disable-next-line no-console
    console.warn(prefix, event.msg || '', event.data ?? '');
  } else {
    // eslint-disable-next-line no-console
    console.log(prefix, event.msg || '', event.data ?? '');
  }
}

export const bootTracer = {
  trace(phase: string, msg?: string, data?: unknown) {
    push({ t: Date.now(), phase, level: 'info', msg, data });
  },
  mark(phase: string, data?: unknown) {
    push({ t: Date.now(), phase, level: 'mark', data });
  },
  error(phase: string, err: unknown, data?: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    push({ t: Date.now(), phase, level: 'error', msg, data });
  },
  getTrace(): BootEvent[] {
    return window.__BOOT_TRACE ? [...window.__BOOT_TRACE] : [];
  },
  clear() {
    window.__BOOT_TRACE = [];
  },
};

export default bootTracer;
