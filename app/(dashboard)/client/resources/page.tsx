'use client';

import { mockResources } from '@/data/mock';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';

export default function ClientResourcesPage() {
  const clientResources = mockResources.filter(
    (r) => r.visibility === 'client' || r.visibility === 'all'
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Shared Resources</h2>
        <p className="text-muted-foreground mt-1">
          Access guides and documents shared with your organization.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clientResources.map((resource) => (
          <div
            key={resource.id}
            className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow flex flex-col"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground text-sm truncate">
                  {resource.title}
                </h3>
                <p className="text-xs text-muted-foreground">PDF Document</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-4 flex-1">
              {resource.description}
            </p>

            <Button variant="outline" size="sm" className="w-full gap-2">
              <Download className="w-4 h-4" />
              Download
            </Button>
          </div>
        ))}

        {clientResources.length === 0 && (
          <div className="col-span-full text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold text-foreground">No resources available</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Resources shared with your organization will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
