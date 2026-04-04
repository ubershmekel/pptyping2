import assert from 'node:assert/strict';
import test from 'node:test';

import { createScreenMount } from '../src/screenMount';

type TimerCallback = () => void;
type FrameCallback = FrameRequestCallback;

class FakeWindow {
  private nextId = 1;
  readonly timeouts = new Map<number, TimerCallback>();
  readonly intervals = new Map<number, TimerCallback>();
  readonly frames = new Map<number, FrameCallback>();

  setTimeout = (callback: TimerCallback): number => {
    const id = this.nextId++;
    this.timeouts.set(id, callback);
    return id;
  };

  clearTimeout = (id: number): void => {
    this.timeouts.delete(id);
  };

  setInterval = (callback: TimerCallback): number => {
    const id = this.nextId++;
    this.intervals.set(id, callback);
    return id;
  };

  clearInterval = (id: number): void => {
    this.intervals.delete(id);
  };

  requestAnimationFrame = (callback: FrameCallback): number => {
    const id = this.nextId++;
    this.frames.set(id, callback);
    return id;
  };

  cancelAnimationFrame = (id: number): void => {
    this.frames.delete(id);
  };

  flushTimeouts(): void {
    const callbacks = Array.from(this.timeouts.values());
    this.timeouts.clear();
    callbacks.forEach((callback) => callback());
  }

  runIntervals(): void {
    Array.from(this.intervals.values()).forEach((callback) => callback());
  }

  flushFrames(): void {
    const callbacks = Array.from(this.frames.values());
    this.frames.clear();
    callbacks.forEach((callback) => callback(16));
  }
}

function withFakeWindow(fn: (fakeWindow: FakeWindow) => void): void {
  const fakeWindow = new FakeWindow();
  const globals = globalThis as typeof globalThis & { window?: Window & typeof globalThis };
  const previousWindow = globals.window;
  globals.window = fakeWindow as unknown as Window & typeof globalThis;

  try {
    fn(fakeWindow);
  } finally {
    if (previousWindow === undefined) {
      Reflect.deleteProperty(globals, 'window');
    } else {
      globals.window = previousWindow;
    }
  }
}

test('ScreenMount listen disposer unregisters listeners immediately', () => {
  withFakeWindow(() => {
    const mount = createScreenMount({} as HTMLElement);
    const target = new EventTarget();
    let calls = 0;

    const stopListening = mount.listen<Event>(target, 'ping', () => {
      calls++;
    });

    target.dispatchEvent(new Event('ping'));
    stopListening();
    target.dispatchEvent(new Event('ping'));

    assert.equal(calls, 1);
  });
});

test('ScreenMount cleanup clears registered timers, frames, intervals, and deferred cleanup once', () => {
  withFakeWindow((fakeWindow) => {
    const mount = createScreenMount({} as HTMLElement);
    let deferredCalls = 0;
    let timeoutCalls = 0;
    let intervalCalls = 0;
    let frameCalls = 0;

    mount.defer(() => {
      deferredCalls++;
    });
    mount.timeout(() => {
      timeoutCalls++;
    }, 50);
    mount.interval(() => {
      intervalCalls++;
    }, 50);
    mount.frame(() => {
      frameCalls++;
    });

    assert.equal(fakeWindow.timeouts.size, 1);
    assert.equal(fakeWindow.intervals.size, 1);
    assert.equal(fakeWindow.frames.size, 1);

    mount.cleanup();
    mount.cleanup();

    fakeWindow.flushTimeouts();
    fakeWindow.runIntervals();
    fakeWindow.flushFrames();

    assert.equal(deferredCalls, 1);
    assert.equal(timeoutCalls, 0);
    assert.equal(intervalCalls, 0);
    assert.equal(frameCalls, 0);
  });
});

