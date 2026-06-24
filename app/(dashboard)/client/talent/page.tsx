'use client';

import { useMockData } from '@/lib/data-context';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ClientTalentPage() {
  const { talentProfiles } = useMockData();
  const availableTalent = talentProfiles.filter(
    (t) => t.availability_status === 'Available'
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Available Talent</h2>
        <p className="text-muted-foreground mt-1">
          Browse our vetted talent pool and find the right fit for your team.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {availableTalent.map((talent) => (
          <div
            key={talent.id}
            className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow flex flex-col"
          >
            <div className="flex items-center gap-3 mb-3">
              <img
                src={talent.profile_image_url || ''}
                alt={talent.display_name}
                className="w-14 h-14 rounded-full object-cover"
              />
              <div>
                <h3 className="font-semibold text-foreground">{talent.display_name}</h3>
                <p className="text-sm text-muted-foreground">{talent.title}</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
              {talent.summary}
            </p>

            <div className="flex flex-wrap gap-1.5 mb-4">
              {talent.tech_stack.map((tech) => (
                <Badge
                  key={tech}
                  variant="secondary"
                  className="text-xs font-normal"
                >
                  {tech}
                </Badge>
              ))}
            </div>

            <div className="flex items-center gap-2 mb-4 mt-auto">
              <Badge
                variant="outline"
                className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs"
              >
                {talent.availability_status}
              </Badge>
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 border-blue-200 text-xs"
              >
                {talent.english_level}
              </Badge>
            </div>

            <Link href={`/talent/${talent.slug}`}>
              <Button variant="outline" size="sm" className="w-full">
                View Details
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
