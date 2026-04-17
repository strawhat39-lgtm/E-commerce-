import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-surface-low">
      <div className="section-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-neon-green/10 border border-neon-green/30 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#39FF14" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="font-heading font-bold text-lg tracking-wider">
                ECO<span className="text-neon-green">LOOP</span>
              </span>
            </div>
            <p className="text-sm text-muted leading-relaxed">
              Building a circular economy through community-powered reuse, rescue, and upcycling.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-heading text-xs font-semibold tracking-widest uppercase text-muted-dim mb-4">Platform</h4>
            <ul className="space-y-3">
              {['Swap & Rent', 'Food Rescue', 'Upcycling', 'Carbon Tracker'].map((item) => (
                <li key={item}>
                  <Link href="/marketplace" className="text-sm text-muted hover:text-neon-green transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-xs font-semibold tracking-widest uppercase text-muted-dim mb-4">Company</h4>
            <ul className="space-y-3">
              {['About', 'Impact Report', 'Blog', 'Careers'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-sm text-muted hover:text-neon-green transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-xs font-semibold tracking-widest uppercase text-muted-dim mb-4">Connect</h4>
            <ul className="space-y-3">
              {['Discord', 'Twitter', 'Instagram', 'Newsletter'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-sm text-muted hover:text-neon-green transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-dim">© 2025 Reuse_mart. Built for a sustainable future.</p>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-xs text-muted-dim hover:text-muted transition-colors">Privacy</Link>
            <Link href="#" className="text-xs text-muted-dim hover:text-muted transition-colors">Terms</Link>
            <div className="flex items-center gap-1.5 text-xs text-muted-dim">
              <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
              All systems operational
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
