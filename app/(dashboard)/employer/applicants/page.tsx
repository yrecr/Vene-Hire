'use client';

import { useState, useMemo } from 'react';
import { Search, Star, MessageSquare, ExternalLink, StarOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockTalentProfiles } from '@/data/mock';
import { useDemoAuth } from '@/lib/demo-auth';
import { useMockData } from '@/lib/data-context';
import { InterviewRequestModal } from '@/components/interview-request-modal';
import { EmptyState } from '@/components/empty-state';
import Link from 'next/link';
import type { TalentProfile } from '@/types';

const technologyTags = [
  'Backend', 'AI', 'C#', '.NET', 'Python', 'Java', 'React', 'Node.js',
  'Cloud', 'TypeScript', 'Docker', 'AWS', 'PostgreSQL', 'Go', 'GraphQL',
];

const englishLevels = ['All', 'Fluent', 'Advanced', 'Intermediate'];
const availabilityOptions = ['All', 'Available', 'In Training', 'On Hold'];
const experienceLevels = ['All', '1-2 years', '3-4 years', '5+ years'];

export default function EmployerApplicantsPage() {
  const { currentUser } = useDemoAuth();
  const mockData = useMockData();
  const { isShortlisted, toggleShortlist } = mockData;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [englishFilter, setEnglishFilter] = useState('All');
  const [availabilityFilter, setAvailabilityFilter] = useState('All');
  const [experienceFilter, setExperienceFilter] = useState('All');
  const [selectedApplicant, setSelectedApplicant] = useState<TalentProfile | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const employerProfile = currentUser?.employer_profile_id
    ? mockData.getEmployerById(currentUser.employer_profile_id)
    : undefined;

  const employerId = employerProfile?.id || 'ep-acme';

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const filteredApplicants = useMemo(() => {
    return mockTalentProfiles
      .filter((t) => t.public_visible)
      .filter((t) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
          t.display_name.toLowerCase().includes(q) ||
          t.title.toLowerCase().includes(q) ||
          t.summary.toLowerCase().includes(q)
        );
      })
      .filter((t) => {
        if (selectedTags.length === 0) return true;
        return selectedTags.some(
          (tag) =>
            t.tech_stack.some((tech) => tech.toLowerCase().includes(tag.toLowerCase())) ||
            t.title.toLowerCase().includes(tag.toLowerCase()) ||
            t.summary.toLowerCase().includes(tag.toLowerCase())
        );
      })
      .filter((t) => {
        if (englishFilter === 'All') return true;
        return t.english_level === englishFilter;
      })
      .filter((t) => {
        if (availabilityFilter === 'All') return true;
        return t.availability_status === availabilityFilter;
      })
      .filter((t) => {
        if (experienceFilter === 'All') return true;
        if (experienceFilter === '1-2 years') return t.years_experience >= 1 && t.years_experience <= 2;
        if (experienceFilter === '3-4 years') return t.years_experience >= 3 && t.years_experience <= 4;
        if (experienceFilter === '5+ years') return t.years_experience >= 5;
        return true;
      });
  }, [searchQuery, selectedTags, englishFilter, availabilityFilter, experienceFilter]);

  function handleRequestInterview(applicant: TalentProfile) {
    setSelectedApplicant(applicant);
    setModalOpen(true);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Browse Applicants</h2>
        <p className="text-muted-foreground mt-1">
          Search and filter through our vetted talent pool to find the perfect fit.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, title, or skills..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Filters</h3>
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Technologies</p>
          <div className="flex flex-wrap gap-2">
            {technologyTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                  selectedTags.includes(tag)
                    ? 'bg-[hsl(210,100%,45%)] text-white border-[hsl(210,100%,45%)]'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">English Level</label>
            <select
              value={englishFilter}
              onChange={(e) => setEnglishFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(210,100%,45%)]/20 focus:border-[hsl(210,100%,45%)]"
            >
              {englishLevels.map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Availability</label>
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(210,100%,45%)]/20 focus:border-[hsl(210,100%,45%)]"
            >
              {availabilityOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Experience</label>
            <select
              value={experienceFilter}
              onChange={(e) => setExperienceFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(210,100%,45%)]/20 focus:border-[hsl(210,100%,45%)]"
            >
              {experienceLevels.map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Showing{' '}
        <span className="font-semibold text-foreground">{filteredApplicants.length}</span>{' '}
        applicant{filteredApplicants.length !== 1 ? 's' : ''}
      </p>

      {filteredApplicants.length === 0 ? (
        <EmptyState
          title="No applicants found"
          description="Try adjusting your search or filters to find more candidates."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredApplicants.map((applicant) => {
            const shortlisted = isShortlisted(applicant.id);
            return (
              <div
                key={applicant.id}
                className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={applicant.profile_image_url || ''}
                    alt={applicant.display_name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{applicant.display_name}</h3>
                    <p className="text-sm text-muted-foreground">{applicant.title}</p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{applicant.summary}</p>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {applicant.tech_stack.slice(0, 5).map((tech) => (
                    <Badge key={tech} variant="secondary" className="text-xs font-normal">{tech}</Badge>
                  ))}
                </div>

                <div className="flex items-center gap-2 mb-4 mt-auto flex-wrap">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                    {applicant.english_level}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      applicant.availability_status === 'Available'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : applicant.availability_status === 'In Training'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-gray-100 text-gray-600 border-gray-200'
                    }`}
                  >
                    {applicant.availability_status}
                  </Badge>
                  <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 text-xs">
                    {applicant.years_experience} yr{applicant.years_experience !== 1 ? 's' : ''} exp
                  </Badge>
                </div>

                <div className="flex gap-2">
                  <Link href={`/talent/${applicant.slug}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full gap-1.5">
                      <ExternalLink className="w-3.5 h-3.5" />
                      View Profile
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => handleRequestInterview(applicant)}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`gap-1.5 ${shortlisted ? 'text-amber-500 hover:text-amber-600' : ''}`}
                    onClick={() => toggleShortlist(applicant.id)}
                  >
                    {shortlisted ? <Star className="w-3.5 h-3.5 fill-amber-400" /> : <StarOff className="w-3.5 h-3.5" />}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedApplicant && (
        <InterviewRequestModal
          applicant={selectedApplicant}
          employerId={employerId}
          open={modalOpen}
          onOpenChange={setModalOpen}
        />
      )}
    </div>
  );
}
