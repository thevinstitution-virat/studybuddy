'use client'

import { Icon } from '@/components/ui/Icon'
import { Brand } from '@/components/sb/Brand'
import { ThemeToggle } from '@/components/sb/ThemeToggle'

/**
 * LandingFooter — the app's existing footer, kept (per request) with the Study Buddy name:
 * company blurb, ecosystem badge, socials, quick links, contact info and the legal block.
 * Restyled onto the paper + saffron tokens, and it takes the best parts of the new landing
 * footer: the "Buddy family" cards and a day/night toggle. Rendered on every public page.
 */

const QUICK_LINKS = [
  { label: 'About Us', href: '#' },
  { label: 'Features', href: '/#features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Blog', href: '#' },
  { label: 'Help Center', href: '#' },
  { label: 'Contact', href: '#contact' },
]

const FAMILY = [
  { name: 'Book Buddy', blurb: 'Digital library', href: 'https://bookbuddy.live', icon: 'books', tile: ['#0A0F24', '#FFFFFF'] },
  { name: 'Vidyaverse', blurb: 'Campus OS', href: 'https://vgraphics.in', icon: 'graduation-cap', tile: ['#DDEBFA', '#1F5CA3'] },
]

const dim = '#A9AEC6'
const heading = { fontSize: 12, fontWeight: 800, letterSpacing: '.09em', textTransform: 'uppercase' as const, color: '#FF9933', margin: '0 0 18px' }
const link = 'transition-colors duration-200 hover:text-[#FF9933]'

export function LandingFooter() {
  return (
    <footer id="contact" style={{ background: 'var(--sb-navy)', color: '#F2F3F8', borderTop: '1px solid var(--sb-line)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 mb-12">
          {/* Company info */}
          <div className="lg:col-span-4">
            <div className="mb-5"><Brand size={40} onNavy /></div>
            <p className="mb-6 max-w-md" style={{ color: dim, lineHeight: 1.6 }}>
              Revolutionizing education with AI-powered, NCERT-grounded learning. Launching 2026 —
              join the founding cohort shaping the future of CBSE &amp; ICSE study.
            </p>
            {/* Ecosystem badge — part of the Vidyaverse trio */}
            <a
              href="https://vgraphics.in"
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full mb-6"
              style={{ background: '#FFFFFF0D', border: '1px solid #FF99332E' }}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: '#FF9933' }} />
              <span className="text-xs font-semibold" style={{ color: '#C9CCDD' }}>
                Part of the <span style={{ color: '#FF9933', fontWeight: 800 }}>Vidyaverse</span> ecosystem — one login across Campus OS, Library &amp; Tutor
              </span>
            </a>
            <div className="flex gap-3">
              {(['facebook', 'twitter', 'instagram', 'linkedin', 'youtube'] as const).map((n) => (
                <a
                  key={n}
                  href="#"
                  aria-label={n}
                  className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-200 hover:scale-110"
                  style={{ background: '#FFFFFF10', border: '1px solid #FFFFFF1F' }}
                >
                  <Icon name={n} size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div className="lg:col-span-2">
            <h3 style={heading}>Quick Links</h3>
            <ul className="space-y-3">
              {QUICK_LINKS.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className={link} style={{ color: dim, fontWeight: 600 }}>{l.label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact info */}
          <div className="lg:col-span-3">
            <h3 style={heading}>Contact Info</h3>
            <div className="space-y-4" style={{ color: dim }}>
              <div className="flex items-center gap-3">
                <Icon name="mail" size={20} color="#FF9933" />
                <span>support@mydigiclassroom.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Icon name="phone" size={20} color="#FF9933" />
                <a href="tel:+919310959596" className={link}>+91 93109 59596</a>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-0.5"><Icon name="pin" size={20} color="#FF9933" /></span>
                <span>
                  Vinstitution, 2nd Floor, Property No. 44, Regal Building,
                  Connaught Place, New Delhi — 110090
                </span>
              </div>
            </div>
          </div>

          {/* The Buddy family (from the new landing footer) */}
          <div className="lg:col-span-3">
            <h3 style={heading}>The Buddy family</h3>
            <div className="flex flex-col gap-2.5">
              {FAMILY.map((f) => (
                <a
                  key={f.name}
                  href={f.href}
                  className="flex items-center gap-3 px-3 py-2.5 transition-colors duration-200 hover:bg-white/10"
                  style={{ borderRadius: 16, border: '1px solid #FFFFFF1F' }}
                >
                  <span style={{ width: 36, height: 36, borderRadius: 12, background: f.tile[0], color: f.tile[1], display: 'grid', placeItems: 'center', flex: 'none' }}>
                    <Icon name={f.icon} size={20} weight="duotone" />
                  </span>
                  <span>
                    <span style={{ display: 'block', fontWeight: 800, fontSize: 14, color: '#fff' }}>{f.name}</span>
                    <span style={{ display: 'block', fontSize: 12, color: dim }}>{f.blurb}</span>
                  </span>
                  <span className="ml-auto"><Icon name="arrow-up-right" size={16} color={dim} /></span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8" style={{ borderTop: '1px solid #FFFFFF1F' }}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4" style={{ color: dim }}>
            <p className="text-center md:text-left leading-relaxed">
              Study Buddy is a brand of the Vinstitution segment of VPD Vastus
              Ventures Private Limited.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
              <a href="#" className={link}>Privacy Policy</a>
              <a href="#" className={link}>Terms of Service</a>
              <a href="#" className={link}>Cookie Policy</a>
              <ThemeToggle variant="pill" />
            </div>
          </div>

          {/* Legal identifiers + copyright — same block across the trio, only the brand name above changes */}
          <div
            className="mt-6 pt-6 flex flex-col items-center gap-1.5 text-center text-xs"
            style={{ borderTop: '1px solid #FFFFFF14', color: '#7F85A3' }}
          >
            <p>PAN: AAMCV2938B &middot; GSTIN: 07AAMCV2938B1ZA &middot; ISO 9001:2015 Certified</p>
            <p>
              &copy; {new Date().getFullYear()} VPD Vastus Ventures Pvt. Ltd. All rights reserved.
              &middot; Proudly powered by Vinstitution &middot; Designed by{' '}
              <a href="https://vgraphics.in" className={link}>VGraphics.in</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
