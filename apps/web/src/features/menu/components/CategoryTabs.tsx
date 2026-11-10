interface CategoryTabsProps {
  categories: string[];
  active: string | null;
  onChange: (category: string | null) => void;
}

function Chip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`min-h-[44px] shrink-0 rounded-full px-4 text-sm font-medium transition-colors ${
        selected ? 'bg-pine text-mist' : 'border border-line bg-transparent text-ink'
      }`}
    >
      {label}
    </button>
  );
}

export function CategoryTabs({ categories, active, onChange }: CategoryTabsProps) {
  return (
    <div className="sticky top-0 z-10 border-b border-line bg-mist/95 backdrop-blur">
      <div
        role="group"
        aria-label="Danh mục"
        className="flex gap-2 overflow-x-auto px-4 py-2 [scrollbar-width:none]"
      >
        <Chip label="Tất cả" selected={active === null} onClick={() => onChange(null)} />
        {categories.map((category) => (
          <Chip
            key={category}
            label={category}
            selected={active === category}
            onClick={() => onChange(category)}
          />
        ))}
      </div>
    </div>
  );
}
