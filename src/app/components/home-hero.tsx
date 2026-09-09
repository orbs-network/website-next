import { Button } from '@/components/ui/button'
import { OrbsLogo } from '@/components/icons'
import Link from 'next/link'
import { H1 } from './typography'

/**
 * Shared by the English, Japanese and Korean home pages.
 *
 * The copy is deliberately NOT in the message catalog. It is placeholder text
 * that Phase 3 (#31, #32) replaces with the real home page, and the legacy site
 * has no equivalent to translate it from — its Japanese home page is English,
 * and its Korean one is a different page entirely. Adding catalog keys for
 * strings that are about to be deleted would mean writing them twice.
 *
 * The blog link is not locale-prefixed: there is no Japanese or Korean blog, so
 * every locale links to the same English archive.
 */
export function HomeHero() {
  return (
    // `lang="en"` because this copy is English in every locale. Without it the
    // Japanese and Korean home pages declare English text as Japanese/Korean at
    // the document level, and a screen reader pronounces it accordingly. Phase 3
    // replaces this with real per-locale copy and the attribute goes with it.
    <section className="text-center mb-20" lang="en">
      <div className="mb-6 flex justify-center items-center">
        {/*
          Standalone, so it keeps its accessible name — the lockup's visible
          wordmark supplies it, no `role="img"` needed.
        */}
        <OrbsLogo className="text-5xl" />
      </div>
      <H1 className="mb-8">Bringing CeFi execution to DeFi</H1>

      <Button asChild size="lg">
        <Link href="/blog">View Blog</Link>
      </Button>
    </section>
  )
}
