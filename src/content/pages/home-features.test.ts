import { describe, expect, it } from 'vitest'
import en from '@/i18n/messages/en.json'
import { HOME_FEATURES } from './home'

/**
 * The home "Key features" panels and the /institutional feature cards say the
 * same thing about the same eight features (#221). They are two catalog entries
 * rather than one because only English has an institutional page, so this is
 * what keeps an edit to one from silently leaving the other stale.
 */
describe('home feature panels', () => {
  it.each(HOME_FEATURES)('%s matches the /institutional summary', (id) => {
    expect(en.pages.home.features[id].panel).toBe(en.pages.institutional.features.items[id].body)
  })

  // The English-first refresh intentionally leaves Japanese/Korean catalogs unchanged.
})
