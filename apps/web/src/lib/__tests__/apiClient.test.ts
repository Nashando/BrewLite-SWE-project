import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it } from 'vitest';
import { server } from '@/mocks/server';
import { apiFetch, setTokenGetter } from '../apiClient';
import { API_URL } from '../env';
import { ApiError, getErrorMessage } from '../errors';

afterEach(() => setTokenGetter(() => null));

describe('apiFetch', () => {
  it('trả về JSON khi thành công', async () => {
    server.use(http.get(`${API_URL}/ping`, () => HttpResponse.json({ ok: true })));

    await expect(apiFetch<{ ok: boolean }>('/ping')).resolves.toEqual({ ok: true });
  });

  it('gắn JWT vào header Authorization khi có token', async () => {
    server.use(
      http.get(`${API_URL}/me`, ({ request }) =>
        HttpResponse.json({ auth: request.headers.get('authorization') }),
      ),
    );
    setTokenGetter(() => 'abc.def.ghi');

    await expect(apiFetch<{ auth: string }>('/me')).resolves.toEqual({
      auth: 'Bearer abc.def.ghi',
    });
  });

  it('ném ApiError kèm status và message từ NestJS', async () => {
    server.use(
      http.get(`${API_URL}/missing`, () =>
        HttpResponse.json({ statusCode: 404, message: 'Không tìm thấy' }, { status: 404 }),
      ),
    );

    await expect(apiFetch('/missing')).rejects.toMatchObject({
      name: 'ApiError',
      status: 404,
      message: 'Không tìm thấy',
    });
  });

  it('gộp mảng message khi validate DTO lỗi', async () => {
    server.use(
      http.post(`${API_URL}/orders`, () =>
        HttpResponse.json({ message: ['a bắt buộc', 'b không hợp lệ'] }, { status: 400 }),
      ),
    );

    await expect(apiFetch('/orders', { method: 'POST', body: {} })).rejects.toMatchObject({
      status: 400,
      message: 'a bắt buộc, b không hợp lệ',
    });
  });

  it('ném ApiError status 0 khi lỗi mạng', async () => {
    server.use(http.get(`${API_URL}/down`, () => HttpResponse.error()));

    const error = await apiFetch('/down').catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(0);
  });
});

describe('getErrorMessage', () => {
  it('map lỗi mạng và lỗi 5xx sang thông báo thân thiện', () => {
    expect(getErrorMessage(new ApiError('x', 0))).toContain('Không kết nối được');
    expect(getErrorMessage(new ApiError('x', 503))).toContain('Máy chủ đang gặp sự cố');
  });

  it('giữ nguyên message của lỗi 4xx', () => {
    expect(getErrorMessage(new ApiError('Email đã tồn tại', 409))).toBe('Email đã tồn tại');
  });

  it('có thông báo mặc định cho lỗi không xác định', () => {
    expect(getErrorMessage(new Error('lạ'))).toBe('Đã có lỗi xảy ra. Thử lại sau.');
  });
});
