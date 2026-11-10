import { Icon } from '@/components/ui/Icon'

/** Study Buddy mark: navy tile, saffron sparkle. Replaces MandalaMark (brief §1, §6). */
export function BrandTile({ size = 38 }: { size?: number }) {
  return (
    <span
      aria-hidden
      style={{
        width: size, height: size, borderRadius: Math.round(size / 3), background: 'linear-gradient(150deg,#1E2B57,#0A0F24)', color: '#FF9933',
        display: 'grid', placeItems: 'center', flex: 'none',
        // On the dark page the tile gets a hairline so it doesn't dissolve into the background.
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,.18), 0 8px 18px -8px rgba(10,15,36,.7), 0 0 0 1px rgba(255,255,255,.06)',
      }}
    >
      <Icon name="sparkle" weight="fill" size={Math.round(size * 0.55)} />
    </span>
  )
}

export function Brand({ size = 38, onNavy = false, href }: { size?: number; onNavy?: boolean; href?: string }) {
  const inner = (
    <>
      <BrandTile size={size} />
      <span style={{ fontFamily: 'var(--sb-font-display)', fontWeight: 800, fontSize: Math.round(size * 0.53), letterSpacing: '-.02em', whiteSpace: 'nowrap', color: onNavy ? '#fff' : 'var(--sb-ink)' }}>
        Study Buddy
      </span>
    </>
  )
  const style = { display: 'flex', alignItems: 'center', gap: 10, color: 'inherit', textDecoration: 'none' } as const
  return href ? <a href={href} style={style}>{inner}</a> : <span style={style}>{inner}</span>
}

export default Brand
