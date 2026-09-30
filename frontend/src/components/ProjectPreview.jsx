import { cn } from '../utils/cn';

/**
 * Coded preview "screenshots" of the three demo sites, drawn with HTML/CSS in
 * each project's own palette and type. Scales with its container (cqw units),
 * so it stays crisp at any size and costs no image bytes.
 * Replace with real screenshots later by passing `image`.
 */
export default function ProjectPreview({ slug, image, alt, className }) {
  return (
    <div className={cn('overflow-hidden rounded-[18px] bg-[#1b1c20] shadow-[0_40px_80px_-40px_rgba(0,0,0,.55)] ring-1 ring-black/10', className)}>
      <div className="flex items-center gap-2 px-4 py-3" aria-hidden="true">
        <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
        <span className="ml-3 h-5 flex-1 rounded-md bg-white/[.07] px-3 font-mono text-[10px] leading-5 text-white/40">{slug}.demo</span>
      </div>
      <div className="relative aspect-[16/10] overflow-hidden [container-type:inline-size]">
        {image ? (
          <img src={image} alt={alt} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div role="img" aria-label={alt} className="preview-zoom absolute inset-0">
            {slug === 'brew-and-bite' && <BrewBite />}
            {slug === 'ironcore-fitness' && <IronCore />}
            {slug === 'lumora-interiors' && <Lumora />}
          </div>
        )}
      </div>
    </div>
  );
}

const serif = { fontFamily: 'Fraunces, Georgia, "Times New Roman", serif' };
const cond = { fontFamily: '"Barlow Condensed", "Arial Narrow", Impact, sans-serif' };
const garamond = { fontFamily: '"Cormorant Garamond", Garamond, Georgia, serif' };

function BrewBite() {
  return (
    <div className="flex h-full flex-col bg-[#FAF7F2] text-[#1F1510]" style={{ fontSize: '1.2cqw' }}>
      <div className="flex items-center justify-between px-[4cqw] py-[2cqw]">
        <span style={{ ...serif, fontSize: '2cqw' }} className="font-semibold">Brew &amp; Bite</span>
        <span className="flex gap-[2.4cqw] opacity-70"><span>Menu</span><span>About</span><span>Gallery</span><span>Contact</span></span>
      </div>
      <div className="grid flex-1 grid-cols-[1.1fr_1fr] gap-[3cqw] px-[4cqw] pb-[3cqw]">
        <div className="flex flex-col justify-center">
          <span className="uppercase tracking-[.2em] text-[#B8733A]" style={{ fontSize: '1cqw' }}>Café · Kitchen</span>
          <p style={{ ...serif, fontSize: '5.2cqw', lineHeight: 1 }} className="mt-[1.2cqw] font-semibold">Fresh coffee.<br />Honest food.</p>
          <p className="mt-[1.6cqw] max-w-[80%] opacity-70">Brewed slow, served warm. Drop in or order on WhatsApp.</p>
          <div className="mt-[2.4cqw] flex gap-[1.2cqw]">
            <span className="rounded-full bg-[#1F1510] px-[2cqw] py-[1cqw] text-[#FAF7F2]">View menu</span>
            <span className="rounded-full border border-[#1F1510]/30 px-[2cqw] py-[1cqw]">WhatsApp</span>
          </div>
        </div>
        <div className="grid grid-cols-2 grid-rows-2 gap-[1.2cqw]">
          <div className="row-span-2 rounded-[1.4cqw] bg-[radial-gradient(circle_at_40%_35%,#D9A06A,#8A4E24_55%,#3B2416)]" />
          <div className="rounded-[1.4cqw] bg-[radial-gradient(circle_at_50%_50%,#F1E8DC,#C9A27A)]" />
          <div className="rounded-[1.4cqw] bg-[#F1E8DC] p-[1.2cqw]">
            <p style={serif} className="font-semibold">Cappuccino</p>
            <p className="text-[#B8733A]">₹180</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function IronCore() {
  return (
    <div className="flex h-full flex-col bg-[#09090A] text-white" style={{ fontSize: '1.2cqw' }}>
      <div className="flex items-center justify-between px-[4cqw] py-[2cqw]">
        <span style={{ ...cond, fontSize: '2.2cqw' }} className="font-bold tracking-wide">IRONCORE<span className="text-[#FF5A1F]">.</span></span>
        <span className="flex items-center gap-[2cqw] opacity-70"><span>Programs</span><span>Trainers</span><span>Membership</span><span className="rounded bg-[#FF5A1F] px-[1.4cqw] py-[.6cqw] text-white opacity-100">Join</span></span>
      </div>
      <div className="grid flex-1 grid-cols-[1.2fr_1fr] gap-[3cqw] px-[4cqw] pb-[3cqw]">
        <div className="flex flex-col justify-center">
          <p style={{ ...cond, fontSize: '6.6cqw', lineHeight: .9 }} className="font-extrabold uppercase">Train hard.<br /><span className="text-[#FF5A1F]">Track it.</span></p>
          <div className="mt-[2.4cqw] flex gap-[1.2cqw]">
            <span className="rounded bg-[#FF5A1F] px-[2cqw] py-[1cqw]">Register</span>
            <span className="rounded border border-white/25 px-[2cqw] py-[1cqw]">Log in</span>
          </div>
        </div>
        <div className="rounded-[1.2cqw] border border-white/10 bg-white/[.04] p-[1.8cqw]">
          <p className="uppercase tracking-[.15em] text-white/50" style={{ fontSize: '.95cqw' }}>Admin · Enquiries</p>
          {['New', 'Contacted', 'New', 'Resolved'].map((s, i) => (
            <div key={i} className="mt-[1.1cqw] flex items-center justify-between rounded-[.6cqw] bg-white/[.05] px-[1.2cqw] py-[.9cqw]">
              <span className="h-[.9cqw] w-[40%] rounded bg-white/25" />
              <span className={s === 'New' ? 'text-[#FF5A1F]' : 'text-white/50'}>{s}</span>
            </div>
          ))}
          <div className="mt-[1.4cqw] flex h-[6cqw] items-end gap-[.6cqw]">
            {[40, 65, 50, 80, 70, 95, 60].map((h, i) => <span key={i} className="flex-1 rounded-t bg-[#FF5A1F]/70" style={{ height: `${h}%` }} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

function Lumora() {
  return (
    <div className="flex h-full flex-col bg-[#F4EFE7] text-[#1D1B19]" style={{ fontSize: '1.2cqw' }}>
      <div className="flex items-center justify-between px-[4cqw] py-[2cqw]">
        <span style={{ ...garamond, fontSize: '2.4cqw', letterSpacing: '.3em' }}>LUMORA</span>
        <span className="flex gap-[2.4cqw] uppercase tracking-[.18em] opacity-70" style={{ fontSize: '.95cqw' }}><span>Projects</span><span>Studio</span><span>Services</span><span>Consult</span></span>
      </div>
      <div className="grid flex-1 grid-cols-[1fr_1.35fr] gap-[3cqw] px-[4cqw] pb-[3cqw]">
        <div className="flex flex-col justify-end pb-[1cqw]">
          <span className="uppercase tracking-[.25em] text-[#A67C5B]" style={{ fontSize: '.95cqw' }}>Interior architecture</span>
          <p style={{ ...garamond, fontSize: '5.4cqw', lineHeight: .95 }} className="mt-[1.2cqw] italic">Rooms with<br />quiet intent.</p>
          <span className="mt-[2cqw] w-fit border-b border-[#1D1B19] pb-[.4cqw]">Book a consultation</span>
        </div>
        <div className="grid grid-cols-[1.4fr_1fr] grid-rows-[1fr_1fr] gap-[1.2cqw]">
          <div className="row-span-2 bg-[linear-gradient(160deg,#D9CDBB,#A67C5B_60%,#7A5A40)]" />
          <div className="bg-[linear-gradient(200deg,#EBE4D9,#C4AE93)]" />
          <div className="flex flex-col justify-end bg-[#1D1B19] p-[1.2cqw] text-[#F4EFE7]">
            <span style={garamond} className="text-[1.8cqw] italic">No. 06</span>
            <span className="opacity-60">Villa, living room</span>
          </div>
        </div>
      </div>
    </div>
  );
}
