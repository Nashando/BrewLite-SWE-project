'use client';

import { Button } from '@/components/ui/Button';

export default function RouteError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main role="alert" className="flex flex-col items-center px-6 py-24 text-center">
      <h1 className="font-display text-3xl font-bold">Trang gặp lỗi</h1>
      <p className="mt-3 max-w-xs text-ink/70">
        Có lỗi khi hiển thị trang này. Tải lại để thử lần nữa.
      </p>
      <Button className="mt-6" onClick={reset}>
        Tải lại trang
      </Button>
    </main>
  );
}
