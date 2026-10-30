import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase();
    if (await this.prisma.user.findUnique({ where: { email } })) {
      throw new ConflictException('Email đã được đăng ký');
    }
    const user = await this.prisma.user.create({
      data: { email, name: dto.name, password: await bcrypt.hash(dto.password, 10) },
    });
    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    // Cùng một thông báo cho cả "sai email" và "sai mật khẩu" để không lộ email nào tồn tại
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }
    return this.buildAuthResponse(user);
  }

  /** Đổi refresh token (còn hạn) lấy cặp token mới. Stateless theo ADR 003. */
  async refresh(refreshToken: string) {
    let payload: { sub: number; type?: string };
    try {
      payload = await this.jwt.verifyAsync(refreshToken, { secret: this.refreshSecret });
    } catch {
      throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn');
    }
    if (payload.type !== 'refresh') throw new UnauthorizedException('Refresh token không hợp lệ');

    // Đọc lại user từ DB để role/tên luôn mới nhất
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new UnauthorizedException('Tài khoản không còn tồn tại');
    return this.buildAuthResponse(user);
  }

  me(userId: number) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, walletBalance: true, createdAt: true },
    });
  }

  private get refreshSecret(): string {
    return this.config.get<string>('JWT_REFRESH_SECRET') ?? `${this.config.getOrThrow<string>('JWT_SECRET')}:refresh`;
  }

  private async buildAuthResponse(user: { id: number; email: string; name: string; role: string }) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync({ sub: user.id, email: user.email, role: user.role, type: 'access' }),
      this.jwt.signAsync(
        { sub: user.id, type: 'refresh' },
        { secret: this.refreshSecret, expiresIn: (this.config.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d') as any },
      ),
    ]);
    return { accessToken, refreshToken, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
  }
}
