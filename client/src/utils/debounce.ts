export const debounce = <T extends (...args: unknown[]) => void>(
  fn: T,
  delayMs: number
) => {
  let timeoutId: number | undefined;

  return (...args: Parameters<T>) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => fn(...args), delayMs);
  };
};
