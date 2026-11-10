import { Icon } from '@/components/ui/Icon'

/** Study Buddy mark: navy tile, saffron sparkle. Replaces MandalaMark (brief §1, §6). */
export function BrandTile({ size = 38 }: { size?: number }) {
  return (
    <span
      aria-hidden
      style={{
        width: size, height: size, borderRadius: Math.round(size / 3), background: '#0A0F24', color: '#FF9933',
        display: 'grid', placeItems: 'center', flex: 'none',
        // On the dark page the tile gets a hairline so it doesn't dissolve into the background.
        boxShadow: 'inset 0 0 0 1px var(--sb-line)',
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
