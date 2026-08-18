import { ChevronDownIcon } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { type Locale } from '@/i18n/locales'
import { localeHref } from '@/i18n/availability'
import { textLang } from '@/i18n/script'
import { NavButton } from './nav-button'
import { NavDropdown } from './nav-dropdown'

function NavIcon() {
  return <ChevronDownIcon className="size-5 group-hover:rotate-180 transition-transform duration-200" />
}

/**
 * Every href goes through `localeHref`, so a link resolves to this locale's
 * version of the page when one exists and to the English URL when it does not.
 * That keeps `/blog` and `/news` pointing at the English archive — there is no
 * Japanese or Korean blog — while the marketing pages Phase 3 adds start
 * prefixing themselves as soon as they appear in the availability map, with no
 * change needed here.
 *
 * The link targets here are still placeholders (`/products/1`, `/resources/2`)
 * and are replaced in #30 with the legacy menu structure — Overview, Protocols,
 * Resources, Community. The labels are wired to the message catalog now so that
 * work is a matter of swapping hrefs and adding keys, not retrofitting i18n.
 *
 * The locale is a prop for the same reason as in the header: next-intl's hooks
 * resolve against `getRequestConfig`, which cannot know the locale without a
 * `[locale]` segment or middleware, so they silently returned English here.
 */
export async function NavMenu({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'nav' })

  return (
    <div className="relative">
      <ul className="flex items-center gap-4">
        <li className="group relative">
          <NavButton href={localeHref('/products', locale)} lang={textLang(t('products'), locale)}>
            {t('products')} <NavIcon />
          </NavButton>
          <NavDropdown>
            <ul>
              <li>
                <NavButton href={localeHref('/products/1', locale)} lang={textLang(t('liquidityHub'), locale)}>{t('liquidityHub')}</NavButton>
              </li>
              <li>
                <NavButton href={localeHref('/products/2', locale)} lang={textLang(t('perpetualHub'), locale)}>{t('perpetualHub')}</NavButton>
              </li>
              <li>
                <NavButton href={localeHref('/products/3', locale)} lang={textLang('dTWAP', locale)}>
                  <span>
                    <span className="lowercase">d</span>TWAP
                  </span>
                </NavButton>
              </li>
              <li>
                <NavButton href={localeHref('/products/3', locale)} lang={textLang('dTWAP', locale)}>
                  <span>
                    <span className="lowercase">d</span>LIMIT
                  </span>
                </NavButton>
              </li>
              <li>
                <NavButton href={localeHref('/products/3', locale)} lang={textLang('dTWAP', locale)}>
                  <span>
                    <span className="lowercase">d</span>SLTP
                  </span>
                </NavButton>
              </li>
            </ul>
          </NavDropdown>
        </li>
        <li className="group relative">
          <NavButton href={localeHref('/resources', locale)} lang={textLang(t('resources'), locale)}>
            {t('resources')} <NavIcon />
          </NavButton>
          <NavDropdown>
            <ul>
              <li>
                <NavButton href={localeHref('/resources/1', locale)} lang={textLang(t('tetra'), locale)}>{t('tetra')}</NavButton>
              </li>
              <li>
                <NavButton href={localeHref('/resources/2', locale)} lang={textLang(t('stakingCalculator'), locale)}>{t('stakingCalculator')}</NavButton>
              </li>
              <li>
                <NavButton href={localeHref('/resources/3', locale)} lang={textLang(t('faqSupport'), locale)}>{t('faqSupport')}</NavButton>
              </li>
              <li>
                <NavButton href={localeHref('/resources/3', locale)} lang={textLang(t('brandingKit'), locale)}>{t('brandingKit')}</NavButton>
              </li>
            </ul>
          </NavDropdown>
        </li>
        <li className="group relative">
          <NavButton href={localeHref('/developers', locale)} lang={textLang(t('developers'), locale)}>
            {t('developers')} <NavIcon />
          </NavButton>
          <NavDropdown>
            <ul>
              <li>
                <NavButton href={localeHref('/developers/1', locale)} lang={textLang(t('documentation'), locale)}>{t('documentation')}</NavButton>
              </li>
              <li>
                <NavButton href={localeHref('/developers/2', locale)} lang={textLang(t('apiReference'), locale)}>{t('apiReference')}</NavButton>
              </li>
              <li>
                <NavButton href={localeHref('/developers/3', locale)} lang={textLang(t('github'), locale)}>{t('github')}</NavButton>
              </li>
            </ul>
          </NavDropdown>
        </li>
        <li>
          <NavButton href={localeHref('/blog', locale)} lang={textLang(t('blog'), locale)}>{t('blog')}</NavButton>
        </li>
        <li>
          {/* "Media" matches the legacy navbar and footer label for /news. */}
          <NavButton href={localeHref('/news', locale)} lang={textLang(t('media'), locale)}>{t('media')}</NavButton>
        </li>
      </ul>
    </div>
  )
}
