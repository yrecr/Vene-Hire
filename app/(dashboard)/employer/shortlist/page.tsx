'use client';

import { Star, ExternalLink, MessageSquare, Trash2, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockTalentProfiles } from '@/data/mock';
import { EmptyState } from '@/components/empty-state';
import Link from 'next/link';

export default function EmployerShortlistPage() {
  const shortlistedApplicants = mockTalentProfiles.slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          Shortlisted Applicants
        </h2>
        <p className="text-muted-foreground mt-1">
          Your saved candidates for quick access and comparison.
        </p>
      </div>

      {/* Compare note */}
      <div className="bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-3 flex items-start gap-3">
        <Info className="w-4 h-4 text-[hsl(210,100%,45%)] mt-0.5 flex-shrink-0" />
        <p className="text-sm text-blue-700">
          Use the shortlist to compare candidates side by side. Compare view
          coming soon.
        </p>
      </div>

      {shortlistedApplicants.length === 0 ? (
        <EmptyState
          icon={Star}
          title="No shortlisted applicants"
          description="Browse applicants and add candidates to your shortlist for easy comparison."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {shortlistedApplicants.map((applicant) => (
            <div
              key={applicant.id}
              className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={applicant.profile_image_url || ''}
                  alt={applicant.display_name}
                  className="w-14 h-14 rounded-full object-cover"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-foreground truncate">
                    {applicant.display_name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {applicant.title}
                  </p>
                </div>
                <Star className="w-5 h-5 text-amber-400 fill-amber-400 flex-shrink-0" />
              </div>

              {/* Tech stack */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {applicant.tech_stack.map((tech) => (
                  <Badge
                    key={tech}
                    variant="secondary"
                    className="text-xs font-normal"
                  >
                    {tech}
                  </Badge>
                ))}
              </div>

              {/* Info badges */}
              <div className="flex items-center gap-2 mb-4 mt-auto">
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200 text-xs"
                >
                  {applicant.english_level}
                </Badge>
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    applicant.availability_status === 'Available'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {applicant.availability_status}
                </Badge>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <Link href={`/talent/${applicant.slug}`} className="flex-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    View Profile
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() =>
                    alert(
                      `Interview request for ${applicant.display_name} - This feature is coming soon!`
                    )
                  }
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() =>
                    alert(
                      `${applicant.display_name} removed from shortlist - This feature is coming soon!`
                    )
                  }
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
