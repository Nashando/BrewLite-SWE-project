import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex flex-col items-center px-6 py-24 text-center">
      <h1 className="font-display text-3xl font-bold">Không tìm thấy trang</h1>
      <p className="mt-3 max-w-xs text-ink/70">
        Trang bạn mở không tồn tại hoặc đã được chuyển đi.
      </p>
      <Link
        href="/menu"
        className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-full bg-pine px-6 font-semibold text-mist"
      >
        Về menu
      </Link>
    </main>
  );
}
