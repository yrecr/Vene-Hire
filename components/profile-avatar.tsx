import { User } from 'lucide-react';

interface ProfileAvatarProps {
  src?: string | null;
  name: string;
  className?: string;
}

export function ProfileAvatar({ src, name, className = '' }: ProfileAvatarProps) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={name} className={`object-cover ${className}`} />;
  }
  return (
    <div
      role="img"
      aria-label={name}
      className={`flex items-center justify-center bg-gray-100 text-gray-400 ${className}`}
    >
      <User className="w-1/2 h-1/2" />
    </div>
  );
}
