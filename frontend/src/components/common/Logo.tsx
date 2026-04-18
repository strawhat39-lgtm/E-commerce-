import Image from 'next/image';

export default function Logo({ className = "", hideText = false }: { className?: string, hideText?: boolean }) {
  return (
    <div className={`flex items-center gap-3 group ${className}`}>
      <div className="relative w-10 h-10 sm:w-12 sm:h-12 overflow-hidden rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_0_10px_rgba(57,255,20,0.3)] group-hover:drop-shadow-[0_0_20px_rgba(57,255,20,0.6)]">
        <Image 
          src="/logo.png" 
          alt="Reuse_Mart Logo" 
          fill
          className="object-contain"
          priority
        />
      </div>
      {!hideText && (
        <span className="font-heading font-black text-xl sm:text-2xl tracking-widest uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
          REUSE<span className="text-neon-green drop-shadow-[0_0_10px_rgba(57,255,20,0.8)]">_MART</span>
        </span>
      )}
    </div>
  );
}
