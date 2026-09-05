import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mx-auto w-14 h-14 rounded-full bg-[hsl(210,100%,45%)]/10 flex items-center justify-center mb-6">
          <Compass className="w-7 h-7 text-[hsl(210,100%,45%)]" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Page not found</h1>
        <p className="text-muted-foreground mb-8">
          The page you are looking for does not exist or may have moved.
        </p>
        <Link href="/">
          <Button className="bg-gradient-to-r from-[hsl(210,100%,45%)] to-[hsl(210,100%,38%)] text-white">
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
