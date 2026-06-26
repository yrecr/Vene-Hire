'use client';

import { Button } from '@/components/ui/button';
import { useData } from '@/lib/data-context';
import { FileText, Download } from 'lucide-react';

export default function ResourcesPage() {
  const { resources } = useData();
  const studentResources = resources.filter(
    (r) => r.visibility === 'student' || r.visibility === 'all'
  );
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Learning Resources</h2>
        <p className="text-muted-foreground mt-1">
          Access guides, handbooks, and materials to support your learning journey.
        </p>
      </div>

      {/* Resource Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {studentResources.map((resource) => (
          <div
            key={resource.id}
            className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow flex flex-col"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(210,100%,45%)]/10 to-[hsl(170,60%,42%)]/10 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-[hsl(210,100%,45%)]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground">{resource.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-3">
                  {resource.description}
                </p>
              </div>
            </div>
            <div className="mt-auto pt-2">
              <Button variant="outline" size="sm" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        ))}
      </div>

      {studentResources.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-muted-foreground">No resources available yet.</p>
        </div>
      )}
    </div>
  );
}
