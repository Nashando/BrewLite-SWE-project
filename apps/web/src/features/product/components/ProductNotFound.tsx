import { ButtonLink } from '@/components/ui/ButtonLink';

export function ProductNotFound() {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <h2 className="font-display text-xl font-semibold">Không tìm thấy món</h2>
      <p className="mt-2 max-w-xs text-ink/70">Món này không còn trong menu hoặc đường dẫn bị sai.</p>
      <ButtonLink href="/menu" className="mt-6">
        Về menu
      </ButtonLink>
    </div>
  );
}
