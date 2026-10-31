'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useCartStore } from '@/features/cart/store';
import { API_MOCKING } from '@/lib/env';
import { shouldRetry } from '@/lib/queryRetry';

// Chỉ khởi động MSW một lần, kể cả khi React StrictMode chạy effect hai lần ở dev.
let mockingPromise: Promise<unknown> | null = null;
function startMocking() {
  mockingPromise ??= import('@/mocks/browser').then(({ worker }) =>
    worker.start({ onUnhandledRequest: 'bypass' }),
  );
  return mockingPromise;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, retry: shouldRetry, refetchOnWindowFocus: false },
        },
      }),
  );
  // Khi bật mock, chờ worker sẵn sàng rồi mới render để request đầu tiên không lọt ra mạng.
  const [ready, setReady] = useState(!API_MOCKING);

  // Đọc giỏ hàng từ localStorage sau khi mount (store dùng skipHydration).
  useEffect(() => {
    void useCartStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    if (!API_MOCKING) return;
    let active = true;
    startMocking()
      .catch((err) =>
        console.warn('[MSW] Không khởi động được mock API. Đã chạy `npm run mocks:init` chưa?', err),
      )
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  if (!ready) return null;

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
