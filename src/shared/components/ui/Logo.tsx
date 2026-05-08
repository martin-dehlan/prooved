import Image from 'next/image';

interface LogoProps {
  size?: number;
  withWordmark?: boolean;
  className?: string;
}

export function Logo({ size = 28, withWordmark = true, className }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ''}`}>
      <Image
        src="/logo.png"
        alt="Prooved"
        width={size}
        height={size}
        priority
        className="h-auto w-auto"
        style={{ width: size, height: size }}
      />
      {withWordmark && (
        <span className="text-lg font-bold tracking-tight text-text">Prooved</span>
      )}
    </span>
  );
}
