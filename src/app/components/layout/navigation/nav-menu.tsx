import { ChevronDownIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { NavButton } from './nav-button'
import { NavDropdown } from './nav-dropdown'

function NavIcon() {
  return <ChevronDownIcon className="size-5 group-hover:rotate-180 transition-transform duration-200" />
}

/**
 * The link targets here are still placeholders (`/products/1`, `/resources/2`)
 * and are replaced in #30 with the legacy menu structure — Overview, Protocols,
 * Resources, Community. The labels are wired to the message catalog now so that
 * work is a matter of swapping hrefs and adding keys, not retrofitting i18n.
 *
 * `useTranslations` rather than `getTranslations`: this is a shared component
 * with no locale of its own, so it reads the locale from the provider that its
 * root layout established.
 */
export function NavMenu() {
  const t = useTranslations('nav')

  return (
    <div className="relative">
      <ul className="flex items-center gap-4">
        <li className="group relative">
          <NavButton href="/products">
            {t('products')} <NavIcon />
          </NavButton>
          <NavDropdown>
            <ul>
              <li>
                <NavButton href="/products/1">{t('liquidityHub')}</NavButton>
              </li>
              <li>
                <NavButton href="/products/2">{t('perpetualHub')}</NavButton>
              </li>
              <li>
                <NavButton href="/products/3">
                  <span>
                    <span className="lowercase">d</span>TWAP
                  </span>
                </NavButton>
              </li>
              <li>
                <NavButton href="/products/3">
                  <span>
                    <span className="lowercase">d</span>LIMIT
                  </span>
                </NavButton>
              </li>
              <li>
                <NavButton href="/products/3">
                  <span>
                    <span className="lowercase">d</span>SLTP
                  </span>
                </NavButton>
              </li>
            </ul>
          </NavDropdown>
        </li>
        <li className="group relative">
          <NavButton href="/resources">
            {t('resources')} <NavIcon />
          </NavButton>
          <NavDropdown>
            <ul>
              <li>
                <NavButton href="/resources/1">{t('tetra')}</NavButton>
              </li>
              <li>
                <NavButton href="/resources/2">{t('stakingCalculator')}</NavButton>
              </li>
              <li>
                <NavButton href="/resources/3">{t('faqSupport')}</NavButton>
              </li>
              <li>
                <NavButton href="/resources/3">{t('brandingKit')}</NavButton>
              </li>
            </ul>
          </NavDropdown>
        </li>
        <li className="group relative">
          <NavButton href="/developers">
            {t('developers')} <NavIcon />
          </NavButton>
          <NavDropdown>
            <ul>
              <li>
                <NavButton href="/developers/1">{t('documentation')}</NavButton>
              </li>
              <li>
                <NavButton href="/developers/2">{t('apiReference')}</NavButton>
              </li>
              <li>
                <NavButton href="/developers/3">{t('github')}</NavButton>
              </li>
            </ul>
          </NavDropdown>
        </li>
        <li>
          <NavButton href="/blog">{t('blog')}</NavButton>
        </li>
        <li>
          {/* "Media" matches the legacy navbar and footer label for /news. */}
          <NavButton href="/news">{t('media')}</NavButton>
        </li>
      </ul>
    </div>
  )
}
