import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';

describe('AuthService.refresh', () => {
  const user = { id: 1, email: 'a@b.vn', name: 'A', role: 'CUSTOMER' };
  const prisma: any = { user: { findUnique: jest.fn() } };
  const config: any = {
    get: (k: string) => ({ JWT_REFRESH_EXPIRES_IN: '7d' } as Record<string, string>)[k],
    getOrThrow: () => 'test-secret',
  };
  const jwt = new JwtService({ secret: 'test-secret', signOptions: { expiresIn: '15m' } });
  const service = new AuthService(prisma, jwt, config);

  beforeEach(() => prisma.user.findUnique.mockResolvedValue(user));

  async function login() {
    // register/login cần bcrypt + DB nên lấy cặp token qua refresh nội bộ
    return (service as any).buildAuthResponse(user);
  }

  it('đổi refresh token hợp lệ lấy cặp token mới', async () => {
    const { refreshToken } = await login();
    const res = await service.refresh(refreshToken);
    expect(res.accessToken).toBeTruthy();
    expect(res.refreshToken).toBeTruthy();
    expect(res.user.id).toBe(1);
  });

  it('từ chối access token dùng làm refresh token', async () => {
    const { accessToken } = await login();
    await expect(service.refresh(accessToken)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('từ chối chuỗi rác', async () => {
    await expect(service.refresh('abc')).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
