import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '@/test/renderWithProviders';
import { LoginForm } from '../components/LoginForm';
import { RegisterForm } from '../components/RegisterForm';
import { RequireAuth } from '../components/RequireAuth';
import { useAuthStore } from '../store';

const nav = vi.hoisted(() => ({ replace: vi.fn(), push: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => nav }));

beforeEach(() => {
  localStorage.clear();
  nav.replace.mockClear();
  useAuthStore.setState({ token: null, user: null, hydrated: true });
});

async function login(email: string, password: string) {
  const user = userEvent.setup();
  if (email) await user.type(screen.getByLabelText('Email'), email);
  if (password) await user.type(screen.getByLabelText('Mật khẩu'), password);
  await user.click(screen.getByRole('button', { name: 'Đăng nhập' }));
}

describe('LoginForm', () => {
  it('báo lỗi khi bỏ trống các ô', async () => {
    renderWithProviders(<LoginForm />);
    await login('', '');

    expect(await screen.findByText('Nhập email')).toBeInTheDocument();
    expect(screen.getByText('Nhập mật khẩu')).toBeInTheDocument();
  });

  it('báo lỗi khi email không hợp lệ', async () => {
    renderWithProviders(<LoginForm />);
    await login('abc', '123456');

    expect(await screen.findByText('Email không hợp lệ')).toBeInTheDocument();
    expect(useAuthStore.getState().token).toBeNull();
  });

  it('hiển thị lỗi từ server khi sai mật khẩu', async () => {
    renderWithProviders(<LoginForm />);
    await login('demo@brewlite.vn', 'sai-mat-khau');

    expect(await screen.findByRole('alert')).toHaveTextContent('Email hoặc mật khẩu không đúng');
    expect(useAuthStore.getState().token).toBeNull();
  });

  it('lưu phiên và chuyển về menu khi đăng nhập đúng', async () => {
    renderWithProviders(<LoginForm />);
    await login('demo@brewlite.vn', '123456');

    await waitFor(() => expect(nav.replace).toHaveBeenCalledWith('/menu'));
    expect(useAuthStore.getState().token).toBe('mock-token-u-1');
    expect(useAuthStore.getState().user?.email).toBe('demo@brewlite.vn');
  });

  it.each([
    ['/checkout', '/checkout'],
    ['//evil.com', '/menu'],
    ['https://evil.com', '/menu'],
  ])('chuyển hướng sau đăng nhập: next=%s -> %s', async (next, expected) => {
    renderWithProviders(<LoginForm next={next} />);
    await login('demo@brewlite.vn', '123456');

    await waitFor(() => expect(nav.replace).toHaveBeenCalledWith(expected));
  });
});

describe('Bảo mật form', () => {
  // Nếu bấm trước khi JavaScript tải xong, trình duyệt tự gửi form: phải là POST để mật khẩu không lên URL
  it('form đăng nhập và đăng ký dùng POST', () => {
    const { container, unmount } = renderWithProviders(<LoginForm />);
    expect(container.querySelector('form')).toHaveAttribute('method', 'post');
    unmount();
    const register = renderWithProviders(<RegisterForm />);
    expect(register.container.querySelector('form')).toHaveAttribute('method', 'post');
  });
});

describe('RegisterForm', () => {
  async function register(values: { name: string; email: string; password: string; confirm: string }) {
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Họ tên'), values.name);
    await user.type(screen.getByLabelText('Email'), values.email);
    await user.type(screen.getByLabelText('Mật khẩu'), values.password);
    await user.type(screen.getByLabelText('Nhập lại mật khẩu'), values.confirm);
    await user.click(screen.getByRole('button', { name: 'Đăng ký' }));
  }

  it('báo lỗi khi mật khẩu nhập lại không khớp', async () => {
    renderWithProviders(<RegisterForm />);
    await register({ name: 'An', email: 'an@example.com', password: '12345678', confirm: '87654321' });

    expect(await screen.findByText('Mật khẩu nhập lại không khớp')).toBeInTheDocument();
    expect(useAuthStore.getState().token).toBeNull();
  });

  it('báo lỗi khi mật khẩu quá ngắn', async () => {
    renderWithProviders(<RegisterForm />);
    await register({ name: 'An', email: 'an@example.com', password: '1234567', confirm: '1234567' });

    expect(await screen.findByText('Mật khẩu cần ít nhất 8 ký tự')).toBeInTheDocument();
  });

  it('hiển thị lỗi từ server khi email đã tồn tại', async () => {
    renderWithProviders(<RegisterForm />);
    await register({ name: 'An', email: 'demo@brewlite.vn', password: '12345678', confirm: '12345678' });

    expect(await screen.findByRole('alert')).toHaveTextContent('Email đã được đăng ký');
  });

  it('tạo tài khoản, lưu phiên và chuyển trang', async () => {
    renderWithProviders(<RegisterForm next="/orders" />);
    await register({ name: 'An', email: 'an@example.com', password: '12345678', confirm: '12345678' });

    await waitFor(() => expect(nav.replace).toHaveBeenCalledWith('/orders'));
    expect(useAuthStore.getState().token).toBeTruthy();
    expect(useAuthStore.getState().user?.name).toBe('An');
  });
});

describe('RequireAuth', () => {
  it('chờ khi chưa đọc xong phiên từ localStorage', () => {
    useAuthStore.setState({ hydrated: false });
    renderWithProviders(<RequireAuth next="/checkout">bí mật</RequireAuth>);

    expect(screen.getByRole('status')).toHaveTextContent('Đang kiểm tra đăng nhập');
    expect(screen.queryByText('bí mật')).not.toBeInTheDocument();
  });

  it('yêu cầu đăng nhập và nhớ trang cần quay lại', () => {
    renderWithProviders(<RequireAuth next="/checkout">bí mật</RequireAuth>);

    expect(screen.getByText('Bạn cần đăng nhập')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Đăng nhập' })).toHaveAttribute(
      'href',
      '/login?next=%2Fcheckout',
    );
    expect(screen.queryByText('bí mật')).not.toBeInTheDocument();
  });

  it('hiện nội dung khi đã đăng nhập', () => {
    useAuthStore.setState({ token: 'mock-token-u-1' });
    renderWithProviders(<RequireAuth next="/checkout">bí mật</RequireAuth>);

    expect(screen.getByText('bí mật')).toBeInTheDocument();
  });
});
