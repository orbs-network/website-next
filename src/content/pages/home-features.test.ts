import { describe, expect, it } from 'vitest'
import en from '@/i18n/messages/en.json'
import ja from '@/i18n/messages/ja.json'
import ko from '@/i18n/messages/ko.json'
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

  // ja and ko carry the English home copy as a placeholder until translated.
  // Once a real translation lands, delete that locale from this list.
  it.each([
    ['ja', ja],
    ['ko', ko],
  ] as const)('%s carries the same placeholder panels as English', (_, catalog) => {
    for (const id of HOME_FEATURES) {
      expect(catalog.pages.home.features[id].panel).toBe(en.pages.home.features[id].panel)
    }
  })
})
