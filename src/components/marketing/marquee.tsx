import { cn } from '@/lib/utils'

/**
 * A horizontally scrolling band of phrases.
 *
 * A server component with no JavaScript at all — the motion is one CSS
 * animation on a duplicated track. Marquees are usually built with a scroll
 * listener or a rAF loop, which costs a bundle and a main-thread job to do
 * something the compositor does for free.
 *
 * Two things that are not decoration:
 *
 * **The duplicate is `aria-hidden`.** Seamless looping needs the phrases twice
 * so the second copy is in place when the first scrolls out. To a screen reader
 * that is the sentence read twice, so only the first copy is exposed.
 *
 * **`motion-reduce` stops it.** Continuously moving text that cannot be paused
 * fails WCAG 2.2.2 if it runs longer than five seconds, and this runs forever.
 * Honouring `prefers-reduced-motion` is the fix that does not need a pause
 * button; without it this is an accessibility defect shipped on the home page.
 */
export function Marquee({
  phrases,
  lang,
  className,
}: {
  phrases: readonly string[]
  lang?: string
  className?: string
}) {
  const track = (
    <ul className="flex shrink-0 items-center gap-16 px-8">
      {phrases.map((phrase) => (
        <li key={phrase} className="whitespace-nowrap text-h2 text-fg">
          {phrase}
        </li>
      ))}
    </ul>
  )

  return (
    <div
      lang={lang}
      className={cn(
        'relative flex overflow-hidden py-16',
        'bg-gradient-to-r from-cyan-500/40 via-periwinkle-500/40 to-lilac-500/40',
        className
      )}
    >
      <div className="flex animate-marquee motion-reduce:animate-none">
        {track}
        {/*
          The second copy exists so the loop has no gap. It is the same words,
          so it is hidden from assistive technology rather than read twice.
        */}
        <div aria-hidden="true" className="flex">
          {track}
        </div>
      </div>
    </div>
  )
}
