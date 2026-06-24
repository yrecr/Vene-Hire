'use client';

import { useState, useMemo } from 'react';
import { useMockData } from '@/lib/data-context';
import type { TalentProfile } from '@/types';
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

export default function TalentPage() {
  const { talentProfiles } = useMockData();
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
  }, [searchTerm, roleFilter, techFilter, englishFilter, availabilityFilter]);

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

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-white border-b border-gray-100">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-white to-teal-50/50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <SectionHeader
            badge="Talent Pool"
            title="Browse Our Talent Pool"
            description="Discover pre-trained, vetted engineers ready to make an impact on your team. Each candidate has completed our rigorous accelerator program and is prepared for international remote work."
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
              placeholder="Search by name or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 bg-gray-50/80 border-gray-200 focus-visible:bg-white"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="font-medium">Filters</span>
            </div>

            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 w-full sm:w-auto sm:flex-1">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-[180px] bg-gray-50/80 border-gray-200">
                  <SelectValue placeholder="Role / Title" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {uniqueRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={techFilter} onValueChange={setTechFilter}>
                <SelectTrigger className="w-full sm:w-[180px] bg-gray-50/80 border-gray-200">
                  <SelectValue placeholder="Tech Stack" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Technologies</SelectItem>
                  {uniqueTech.map((tech) => (
                    <SelectItem key={tech} value={tech}>
                      {tech}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={englishFilter} onValueChange={setEnglishFilter}>
                <SelectTrigger className="w-full sm:w-[180px] bg-gray-50/80 border-gray-200">
                  <SelectValue placeholder="English Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
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
                  <SelectValue placeholder="Availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Availability</SelectItem>
                  {uniqueAvailability.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
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
                Clear all ({activeFilterCount})
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
              Showing{' '}
              <span className="font-semibold text-foreground">
                {filteredProfiles.length}
              </span>{' '}
              {filteredProfiles.length === 1 ? 'engineer' : 'engineers'}
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
              No engineers found
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mb-6">
              We could not find any engineers matching your current filters. Try
              adjusting your search criteria or clearing the filters.
            </p>
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[hsl(210,100%,45%)] hover:bg-[hsl(210,100%,40%)] rounded-lg transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
