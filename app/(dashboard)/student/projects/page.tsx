'use client';

import { Badge } from '@/components/ui/badge';
import { Lock, CircleCheck as CheckCircle2, Code as Code2, Clock } from 'lucide-react';

const projects = [
  {
    title: 'REST API Service',
    category: 'Backend',
    progress: 100,
    status: 'Completed',
    description:
      'Build a RESTful API with authentication, CRUD operations, and database integration using Node.js and Express.',
  },
  {
    title: 'E-Commerce Dashboard',
    category: 'Frontend',
    progress: 75,
    status: 'In Progress',
    description:
      'Create a responsive admin dashboard for an e-commerce platform with React, charts, and data tables.',
  },
  {
    title: 'CI/CD Pipeline Setup',
    category: 'DevOps',
    progress: 0,
    status: 'Not Started',
    description:
      'Configure a complete CI/CD pipeline with GitHub Actions, Docker, and automated testing for deployment.',
  },
  {
    title: 'Capstone Project',
    category: 'Full Stack',
    progress: 0,
    status: 'Locked',
    description:
      'Design and build a full-stack application from scratch, demonstrating all skills learned during the bootcamp.',
  },
];

function getStatusStyles(status: string) {
  switch (status) {
    case 'Completed':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'In Progress':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Not Started':
      return 'bg-gray-100 text-gray-600 border-gray-200';
    case 'Locked':
      return 'bg-gray-100 text-gray-400 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-600 border-gray-200';
  }
}

function getCategoryStyles(category: string) {
  switch (category) {
    case 'Backend':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Frontend':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'DevOps':
      return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'Full Stack':
      return 'bg-teal-50 text-teal-700 border-teal-200';
    default:
      return 'bg-gray-100 text-gray-600 border-gray-200';
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'Completed':
      return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
    case 'In Progress':
      return <Code2 className="w-5 h-5 text-amber-500" />;
    case 'Not Started':
      return <Clock className="w-5 h-5 text-gray-400" />;
    case 'Locked':
      return <Lock className="w-5 h-5 text-gray-400" />;
    default:
      return null;
  }
}

export default function ProjectsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Projects & Assignments</h2>
        <p className="text-muted-foreground mt-1">
          View and track your bootcamp projects and assignments.
        </p>
      </div>

      {/* Project Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {projects.map((project) => (
          <div
            key={project.title}
            className={`bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow ${
              project.status === 'Locked' ? 'opacity-60' : ''
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {getStatusIcon(project.status)}
                <h3 className="text-base font-semibold text-foreground">{project.title}</h3>
              </div>
              <Badge
                variant="outline"
                className={`text-xs ${getCategoryStyles(project.category)}`}
              >
                {project.category}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {project.description}
            </p>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-muted-foreground">Progress</span>
                <span className="text-xs font-semibold text-foreground">{project.progress}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-700"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>

            <Badge
              variant="secondary"
              className={`text-xs border ${getStatusStyles(project.status)}`}
            >
              {project.status}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
