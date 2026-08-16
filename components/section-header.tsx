interface SectionHeaderProps {
  badge?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
}

export function SectionHeader({ badge, title, description, align = 'center' }: SectionHeaderProps) {
  return (
    <div className={`max-w-3xl ${align === 'center' ? 'mx-auto text-center' : ''} mb-12 lg:mb-16`}>
      {badge && (
        <span className="inline-block px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 rounded-full mb-4">
          {badge}
        </span>
      )}
      <h2 className="text-4xl sm:text-5xl font-bold text-foreground leading-[1.12]">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
