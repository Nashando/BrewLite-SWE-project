import { describe, expect, it } from 'vitest';
import { ApiError } from '../errors';
import { shouldRetry } from '../queryRetry';

describe('shouldRetry', () => {
  it('không retry lỗi 4xx', () => {
    expect(shouldRetry(0, new ApiError('x', 404))).toBe(false);
    expect(shouldRetry(0, new ApiError('x', 400))).toBe(false);
  });

  it('retry một lần với lỗi mạng và 5xx', () => {
    expect(shouldRetry(0, new ApiError('x', 0))).toBe(true);
    expect(shouldRetry(0, new ApiError('x', 503))).toBe(true);
    expect(shouldRetry(1, new ApiError('x', 503))).toBe(false);
  });
});
