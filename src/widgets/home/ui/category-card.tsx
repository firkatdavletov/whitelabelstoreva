import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export type CategoryCardProps = {
  href: string;
  imageSrc: string;
  name: string;
};

export function ClassicCategoryCard({ href, imageSrc, name }: CategoryCardProps) {
  return (
    <Link
      className="group border-border/60 bg-card/96 overflow-hidden rounded-2xl border shadow-[0_24px_60px_-48px_rgba(31,26,23,0.55)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_80px_-44px_rgba(31,26,23,0.42)]"
      href={href}
    >
      <div className="bg-muted/50 relative aspect-[4/3] overflow-hidden">
        <Image
          alt=""
          className="object-cover transition duration-500 group-hover:scale-[1.04]"
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
          src={imageSrc}
          unoptimized
        />
      </div>

      <div className="flex items-center justify-between gap-4 px-5 py-4">
        <span className="text-base font-semibold tracking-[0.02em]">
          {name}
        </span>
        <ArrowRight className="text-muted-foreground group-hover:text-foreground h-4 w-4 shrink-0 transition duration-300 group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

export function FashionCategoryCard({ href, imageSrc, name }: CategoryCardProps) {
  return (
    <Link
      className="group relative block overflow-hidden"
      href={href}
    >
      <div className="bg-muted/50 relative aspect-[3/4] overflow-hidden sm:aspect-[4/5]">
        <Image
          alt=""
          className="object-cover transition duration-700 group-hover:scale-[1.03]"
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
          src={imageSrc}
          unoptimized
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
      </div>

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-6">
        <span className="text-lg font-semibold tracking-tight text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)] sm:text-xl">
          {name}
        </span>
        <ArrowRight className="h-5 w-5 shrink-0 text-white/80 drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)] transition duration-300 group-hover:translate-x-1 group-hover:text-white" />
      </div>
    </Link>
  );
}
