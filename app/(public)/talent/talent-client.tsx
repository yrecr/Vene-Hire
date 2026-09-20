'use client';

import { useState, useMemo } from 'react';
import { useData } from '@/lib/data-context';
import { TalentCard } from '@/components/talent-card';
import { SectionHeader } from '@/components/section-header';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Users, SlidersHorizontal } from 'lucide-react';
import { useT } from '@/lib/i18n';

export function TalentClient() {
  const { talentProfiles } = useData();
  const { t } = useT();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [techFilter, setTechFilter] = useState('all');
  const [englishFilter, setEnglishFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');

  const uniqueRoles = useMemo(
    () => Array.from(new Set(talentProfiles.map((t) => t.title))).sort(),
    [talentProfiles]
  );

  const uniqueTech = useMemo(
    () => Array.from(new Set(talentProfiles.flatMap((t) => t.tech_stack))).sort(),
    [talentProfiles]
  );

  const uniqueEnglishLevels = useMemo(
    () => Array.from(new Set(talentProfiles.map((t) => t.english_level))),
    [talentProfiles]
  );

  const uniqueAvailability = useMemo(
    () => Array.from(new Set(talentProfiles.map((t) => t.availability_status))),
    [talentProfiles]
  );

  const filteredProfiles = useMemo(() => {
    return talentProfiles.filter((profile) => {
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        !search ||
        profile.display_name.toLowerCase().includes(search) ||
        profile.summary.toLowerCase().includes(search);

      const matchesRole =
        roleFilter === 'all' || profile.title === roleFilter;

      const matchesTech =
        techFilter === 'all' || profile.tech_stack.includes(techFilter);

      const matchesEnglish =
        englishFilter === 'all' || profile.english_level === englishFilter;

      const matchesAvailability =
        availabilityFilter === 'all' ||
        profile.availability_status === availabilityFilter;

      return (
        matchesSearch &&
        matchesRole &&
        matchesTech &&
        matchesEnglish &&
        matchesAvailability
      );
    });
  }, [talentProfiles, searchTerm, roleFilter, techFilter, englishFilter, availabilityFilter]);

  const activeFilterCount = [
    roleFilter,
    techFilter,
    englishFilter,
    availabilityFilter,
  ].filter((f) => f !== 'all').length;

  function clearFilters() {
    setSearchTerm('');
    setRoleFilter('all');
    setTechFilter('all');
    setEnglishFilter('all');
    setAvailabilityFilter('all');
  }

  const getStatusLabel = (status: string) => {
    const key = status.toLowerCase().replace(/\s+/g, '_');
    return (t.badges as Record<string, string>)[key] || status;
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-white border-b border-gray-100">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-white to-teal-50/50 dark:from-blue-950/20 dark:via-background dark:to-teal-950/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <SectionHeader
            badge={t.talent.badge}
            title={t.talent.title}
            description={t.talent.subtitle}
          />
        </div>
      </section>

      {/* Filters Section */}
      <section className="sticky top-16 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t.talent.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 bg-gray-50/80 border-gray-200 focus-visible:bg-white"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="font-medium">{t.talent.filters}</span>
            </div>

            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 w-full sm:w-auto sm:flex-1">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-[180px] bg-gray-50/80 border-gray-200">
                  <SelectValue placeholder={t.talent.roleFilter} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.talent.allRoles}</SelectItem>
                  {uniqueRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={techFilter} onValueChange={setTechFilter}>
                <SelectTrigger className="w-full sm:w-[180px] bg-gray-50/80 border-gray-200">
                  <SelectValue placeholder={t.talent.techFilter} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.talent.allTech}</SelectItem>
                  {uniqueTech.map((tech) => (
                    <SelectItem key={tech} value={tech}>
                      {tech}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={englishFilter} onValueChange={setEnglishFilter}>
                <SelectTrigger className="w-full sm:w-[180px] bg-gray-50/80 border-gray-200">
                  <SelectValue placeholder={t.talent.englishFilter} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.talent.allEnglish}</SelectItem>
                  {uniqueEnglishLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={availabilityFilter}
                onValueChange={setAvailabilityFilter}
              >
                <SelectTrigger className="w-full sm:w-[180px] bg-gray-50/80 border-gray-200">
                  <SelectValue placeholder={t.talent.availabilityFilter} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.talent.allAvailability}</SelectItem>
                  {uniqueAvailability.map((status) => (
                    <SelectItem key={status} value={status}>
                      {getStatusLabel(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4 shrink-0"
              >
                {t.talent.clearAllFilters} ({activeFilterCount})
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>
              {t.talent.resultsCount
                .replace('{count}', String(filteredProfiles.length))
                .replace('{total}', String(talentProfiles.length))}
            </span>
          </div>
        </div>

        {/* Talent Grid */}
        {filteredProfiles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfiles.map((profile) => (
              <TalentCard key={profile.id} talent={profile} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-5">
              <Search className="h-7 w-7 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {t.talent.noCandidatesTitle}
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mb-6">
              {t.talent.noCandidatesDesc}
            </p>
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[hsl(210,100%,45%)] hover:bg-[hsl(210,100%,40%)] rounded-lg transition-colors"
            >
              {t.talent.clearAllFilters}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
