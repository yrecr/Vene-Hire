'use client';

import { TalentCard } from '@/components/talent-card';
import type { TalentProfile } from '@/types';

interface TalentCarouselProps {
  talents: TalentProfile[];
}

export function TalentCarousel({ talents }: TalentCarouselProps) {
  const doubled = [...talents, ...talents];

  return (
    <div className="overflow-hidden relative">
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none" />
      <div className="flex gap-5 animate-scroll" style={{ width: 'max-content' }}>
        {doubled.map((talent, i) => (
          <TalentCard key={`${talent.id}-${i}`} talent={talent} compact />
        ))}
      </div>
    </div>
  );
}
