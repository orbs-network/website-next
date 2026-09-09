import { getTranslations } from 'next-intl/server'
import { SkillList } from '@/components/marketing/skill-list'
import { AI_SKILLS } from '@/content/pages/ai-skills'
import { resolveLocaleLink } from '@/content/shared/link'
import type { Locale } from '@/i18n/locales'
import { textLang } from '@/i18n/script'

/**
 * The AI skills index at `/ai/skills/`.
 *
 * Note there is no `/ai/` page above it: the legacy site 404s on `/ai/`, and
 * this index is the section's entry point. #31 lists `/ai` as a product page,
 * which is wrong about the URL — flagged on that issue.
 */
export async function AiSkillsPage({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'pages.aiSkills' })

  return (
    <SkillList
      title={t('title')}
      intro={t('intro')}
      chainsLabel={t('chainsLabel')}
      orderTypesLabel={t('orderTypesLabel')}
      skills={AI_SKILLS.map((skill) => ({
        ...skill,
        // Through `localeHref`, so the Korean index links to the Korean skill
        // page rather than sending the reader back to English.
        href: resolveLocaleLink({ href: skill.href }, locale).href,
        description: t(`items.${skill.id}.description`),
      }))}
      lang={textLang(t('intro'), locale)}
    />
  )
}
