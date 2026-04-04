import type { ScreenMount } from './types';

type Cleanup = () => void;

export function createScreenMount(el: HTMLElement): ScreenMount {
  const cleanups = new Set<Cleanup>();
  let isCleanedUp = false;

  const register = (cleanup: Cleanup): Cleanup => {
    if (isCleanedUp) {
      cleanup();
      return () => {};
    }

    let active = true;
    const dispose = () => {
      if (!active) {
        return;
      }
      active = false;
      cleanups.delete(dispose);
      cleanup();
    };

    cleanups.add(dispose);
    return dispose;
  };

  const mount: ScreenMount = {
    el,
    cleanup: () => {
      if (isCleanedUp) {
        return;
      }
      isCleanedUp = true;

      const pending = Array.from(cleanups);
      cleanups.clear();
      for (let i = pending.length - 1; i >= 0; i--) {
        pending[i]();
      }
    },
    defer: (cleanup) => register(cleanup),
    listen: (target, type, listener, options) => {
      const eventListener = listener as EventListener;
      target.addEventListener(type, eventListener, options);
      return register(() => target.removeEventListener(type, eventListener, options));
    },
    timeout: (callback, ms) => {
      let cancel: Cleanup = () => {};
      const timer = window.setTimeout(() => {
        cancel();
        callback();
      }, ms);
      cancel = register(() => window.clearTimeout(timer));
      return cancel;
    },
    interval: (callback, ms) => {
      const timer = window.setInterval(callback, ms);
      return register(() => window.clearInterval(timer));
    },
    frame: (callback) => {
      let cancel: Cleanup = () => {};
      const frame = window.requestAnimationFrame((time) => {
        cancel();
        callback(time);
      });
      cancel = register(() => window.cancelAnimationFrame(frame));
      return cancel;
    },
  };

  return mount;
}
