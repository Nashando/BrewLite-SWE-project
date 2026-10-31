import { CupIcon } from './CupIcon';

const TILE_COLORS = [
  'bg-crema/40 text-pine',
  'bg-cherry/15 text-cherry',
  'bg-pine/10 text-pine',
  'bg-ink/10 text-ink',
];

// Mỗi danh mục luôn ra cùng một màu (băm tên danh mục), không cần cấu hình thủ công.
function tileColor(category: string) {
  const hash = Array.from(category).reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return TILE_COLORS[hash % TILE_COLORS.length];
}

interface ProductTileProps {
  category: string;
  imageUrl?: string | null;
  size?: 'md' | 'lg';
  dimmed?: boolean;
}

export function ProductTile({ category, imageUrl, size = 'md', dimmed = false }: ProductTileProps) {
  const box = size === 'lg' ? 'h-28 w-28 rounded-3xl' : 'h-[72px] w-[72px] rounded-2xl';
  const icon = size === 'lg' ? 'h-14 w-14' : 'h-8 w-8';

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden ${box} ${tileColor(
        category,
      )} ${dimmed ? 'opacity-50' : ''}`}
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
      ) : (
        <CupIcon className={icon} />
      )}
    </div>
  );
}
