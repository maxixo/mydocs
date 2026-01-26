export const debounce = <Args extends unknown[]>(
  fn: (...args: Args) => void | Promise<void>,
  delayMs: number
) => {
  let timeoutId: ReturnType<typeof window.setTimeout> | undefined;

  const debounced = (...args: Args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => fn(...args), delayMs);
  };

  debounced.cancel = () => {
    window.clearTimeout(timeoutId);
  };

  return debounced;
};
