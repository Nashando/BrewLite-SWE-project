import { CupIcon } from './CupIcon';

interface ProductTileProps {
  imageUrl?: string | null;
  size?: 'md' | 'lg';
  dimmed?: boolean;
}

export function ProductTile({ imageUrl, size = 'md', dimmed = false }: ProductTileProps) {
  const box = size === 'lg' ? 'h-28 w-28 rounded-3xl' : 'h-[72px] w-[72px] rounded-2xl';
  const icon = size === 'lg' ? 'h-14 w-14' : 'h-8 w-8';

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden bg-pine/10 text-pine ${box} ${
        dimmed ? 'opacity-50' : ''
      }`}
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
