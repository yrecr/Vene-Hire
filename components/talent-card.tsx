import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SkillBar } from '@/components/skill-bar';
import { MapPin, Clock, ArrowRight } from 'lucide-react';
import type { TalentProfile, TalentSkill } from '@/types';

interface TalentCardProps {
  talent: TalentProfile & { skills?: TalentSkill[] };
  compact?: boolean;
}

const availabilityColor: Record<string, string> = {
  'Available': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'In Training': 'bg-amber-50 text-amber-700 border-amber-200',
  'Hired': 'bg-gray-100 text-gray-600 border-gray-200',
  'On Hold': 'bg-blue-50 text-blue-700 border-blue-200',
};

const englishColor: Record<string, string> = {
  'Native': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Fluent': 'bg-teal-50 text-teal-700 border-teal-200',
  'Advanced': 'bg-blue-50 text-blue-700 border-blue-200',
  'Intermediate': 'bg-amber-50 text-amber-700 border-amber-200',
  'Basic': 'bg-gray-100 text-gray-600 border-gray-200',
};

export function TalentCard({ talent, compact }: TalentCardProps) {
  if (compact) {
    // Real quantified skills (name + score) when the profile has them —
    // reused for both the tag row and the progress bars, same as the
    // reference layout. Falls back to plain tech_stack tags (no scores to
    // bar-chart) for the rare profile that hasn't set any skills yet.
    const topSkills = [...(talent.skills || [])].sort((a, b) => b.score - a.score).slice(0, 3);
    const tags = topSkills.length ? topSkills.map((s) => s.skill_name) : talent.tech_stack.slice(0, 4);

    return (
      <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 hover:border-gray-200 transition-all duration-300 flex-shrink-0 w-[340px] p-6">
        <div className="flex items-center gap-4 pb-5 border-b border-gray-100">
          <img
            src={talent.profile_image_url || 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100'}
            alt={talent.display_name}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-gray-100 group-hover:ring-blue-100 transition-all flex-shrink-0"
          />
          <div className="min-w-0">
            <h4 className="text-base font-semibold text-foreground truncate">{talent.display_name}</h4>
            <p className="text-sm text-muted-foreground truncate">{talent.title}</p>
          </div>
        </div>

        <div className="py-5 border-b border-gray-100 space-y-4">
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="bg-[hsl(210,100%,45%)]/10 text-[hsl(210,100%,38%)] py-1 px-3 text-xs font-medium rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc ps-4">
            <li>Spanish: Native or bilingual</li>
            <li>English: {talent.english_level}</li>
          </ul>
        </div>

        {topSkills.length > 0 && (
          <div className="pt-5 space-y-3">
            {topSkills.map((skill) => (
              <SkillBar key={skill.id} name={skill.skill_name} score={skill.score} />
            ))}
          </div>
        )}

        <Link href={`/talent/${talent.slug}`} className="mt-5 flex justify-center">
          <Button variant="outline" size="sm" className="rounded-full px-6 border-2 border-foreground text-foreground hover:bg-foreground hover:text-white">
            View Profile
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 hover:border-gray-200 transition-all duration-300">
      <div className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <img
            src={talent.profile_image_url || 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200'}
            alt={talent.display_name}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-gray-100 group-hover:ring-blue-100 transition-all"
          />
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-foreground">{talent.display_name}</h3>
            <p className="text-sm text-muted-foreground">{talent.title}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full border ${availabilityColor[talent.availability_status] || ''}`}>
                <Clock className="w-3 h-3" />
                {talent.availability_status}
              </span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full border ${englishColor[talent.english_level] || ''}`}>
                <MapPin className="w-3 h-3" />
                {talent.english_level}
              </span>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">
          {talent.summary}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-5 min-h-[5rem]">
          {talent.tech_stack.slice(0, 5).map((tech) => (
            <Badge key={tech} variant="secondary" className="text-xs font-medium bg-gray-50 hover:bg-gray-100 text-gray-700 border-0">
              {tech}
            </Badge>
          ))}
          {talent.tech_stack.length > 5 && (
            <Badge variant="secondary" className="text-xs font-medium bg-gray-50 text-gray-500 border-0">
              +{talent.tech_stack.length - 5}
            </Badge>
          )}
        </div>

        <Link href={`/talent/${talent.slug}`}>
          <Button variant="outline" className="w-full group-hover:bg-[hsl(210,100%,45%)] group-hover:text-white group-hover:border-[hsl(210,100%,45%)] transition-all duration-300" size="sm">
            View Profile <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
