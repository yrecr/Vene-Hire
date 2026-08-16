'use client';

import Image from 'next/image';
import { SkillBar } from '@/components/skill-bar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Globe, Briefcase, CreditCard as Edit } from 'lucide-react';

const profile = {
  name: 'Maria Gonzalez',
  title: 'Full Stack Developer',
  email: 'maria@email.com',
  englishLevel: 'Advanced',
  availability: 'In Training',
  photo:
    'https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?auto=compress&cs=tinysrgb&w=200',
  techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS', 'Docker'],
};

const skills = [
  { name: 'React', score: 92 },
  { name: 'TypeScript', score: 88 },
  { name: 'Node.js', score: 85 },
  { name: 'PostgreSQL', score: 80 },
];

export default function ProfilePage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">My Profile</h2>
          <p className="text-muted-foreground mt-1">
            View and manage your personal information and skills.
          </p>
        </div>
        <Button variant="outline">
          <Edit className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gradient mb-4 ring-4 ring-[hsl(210,100%,45%)]/10">
            <Image
              src={profile.photo}
              alt={profile.name}
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="text-lg font-semibold text-foreground">{profile.name}</h3>
          <p className="text-sm text-muted-foreground">{profile.title}</p>

          <div className="w-full mt-6 space-y-3">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Mail className="w-4 h-4 text-[hsl(210,100%,45%)]" />
              <span>{profile.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Globe className="w-4 h-4 text-[hsl(210,100%,45%)]" />
              <span>English Level: {profile.englishLevel}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Briefcase className="w-4 h-4 text-[hsl(210,100%,45%)]" />
              <span>{profile.availability}</span>
            </div>
          </div>
        </div>

        {/* Skills & Tech Stack */}
        <div className="lg:col-span-2 space-y-6">
          {/* Skills Section */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-foreground mb-5">Skills</h3>
            <div className="space-y-4">
              {skills.map((skill) => (
                <SkillBar key={skill.name} name={skill.name} score={skill.score} />
              ))}
            </div>
          </div>

          {/* Tech Stack Section */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Tech Stack</h3>
            <div className="flex flex-wrap gap-2">
              {profile.techStack.map((tech) => (
                <Badge
                  key={tech}
                  variant="secondary"
                  className="bg-[hsl(210,100%,45%)]/10 text-[hsl(210,100%,45%)] border border-[hsl(210,100%,45%)]/20 hover:bg-[hsl(210,100%,45%)]/15"
                >
                  {tech}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
