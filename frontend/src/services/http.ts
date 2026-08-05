/**
 * Thin async wrapper standing in for a future real HTTP client.
 *
 * All service functions in `src/services` are written as `async` and
 * return data through this helper so that swapping the mock data source
 * for a real `fetch`/axios call later only requires changing the body
 * of `resolveMock`, not any calling code in the UI layer.
 */
export function resolveMock<T>(data: T, delayMs = 260): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delayMs);
  });
}

export interface ApiListResult<T> {
  items: T[];
  total: number;
}
