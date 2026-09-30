import { getTranslations } from 'next-intl/server'
import { DividedSection } from '@/components/marketing/divided-section'
import { SkillList } from '@/components/marketing/skill-list'
import { SplitHero } from '@/components/marketing/split-hero'
import { AI_SKILLS } from '@/content/pages/ai-skills'
import { HERO_GRAPHICS } from '@/content/shared/hero-graphics'
import { resolveLocaleLink } from '@/content/shared/link'
import type { Locale } from '@/i18n/locales'
import { InnerClosingCta } from './inner-closing'

/**
 * The AI skills index at `/ai/skills/`.
 *
 * Note there is no `/ai/` page above it: the legacy site 404s on `/ai/`, and
 * this index is the section's entry point. #31 lists `/ai` as a product page,
 * which is wrong about the URL — flagged on that issue.
 *
 * On the master since #227: the title, intro and illustration are a split
 * hero (they were centred, with the graphic stacked above the title), the list
 * follows under a rule, and the page closes on the shared block. The hero has
 * no button — the legacy page had none, and the skill cards are the way in.
 */
export async function AiSkillsPage({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'pages.aiSkills' })

  return (
    <>
      <SplitHero
        eyebrow={t('eyebrow')}
        headline={t('title')}
        intro={t('intro')}
        graphic={HERO_GRAPHICS.aiSkills}
        locale={locale}
      />

      <DividedSection eyebrow={t('listEyebrow')} locale={locale}>
        <SkillList
          chainsLabel={t('chainsLabel')}
          orderTypesLabel={t('orderTypesLabel')}
          skills={AI_SKILLS.map((skill) => ({
            ...skill,
            // Through `localeHref`, so the Korean index links to the Korean skill
            // page rather than sending the reader back to English.
            href: resolveLocaleLink({ href: skill.href }, locale).href,
            description: t(`items.${skill.id}.description`),
          }))}
          locale={locale}
        />
      </DividedSection>

      <InnerClosingCta locale={locale} />
    </>
  )
}
