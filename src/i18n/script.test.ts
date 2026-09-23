import { describe, expect, it } from 'vitest'
import { textLang } from './script'

/**
 * `textLang` decides, per string, whether a value needs marking as English
 * inside a non-English document. Getting it wrong is silent: nothing throws,
 * the page looks identical, and a screen reader reads Korean with English
 * pronunciation rules — or the reverse.
 */

describe('textLang', () => {
  it('marks Latin text inside a non-Latin document', () => {
    expect(textLang('GitHub', 'ko')).toBe('en')
    expect(textLang('Documentation', 'ja')).toBe('en')
  })

  it('leaves text in the document’s own script unmarked', () => {
    expect(textLang('블로그', 'ko')).toBeUndefined()
    expect(textLang('日本語', 'ja')).toBeUndefined()
  })

  it('never marks anything in an English document', () => {
    // There is nothing to distinguish Latin from in a Latin document, so the
    // attribute would be noise on every element on the site.
    expect(textLang('GitHub', 'en')).toBeUndefined()
    expect(textLang('블로그', 'en')).toBeUndefined()
  })

  it('treats an empty or blank string as having no language', () => {
    /*
      The regression this file was added for.

      An empty string contains no Hangul, so the script test concluded "Latin"
      and returned 'en'. That was invisible while callers derived one value
      from one known-present catalog string. It stops being invisible when
      derivation moves per string (#103): every optional or absent string
      starts carrying `lang="en"`.

      The case that surfaced it: a decorative hero image with `alt=""`, where
      the empty alt is deliberate and correct, and `lang="en"` on it claims a
      language for something with no text at all.
    */
    expect(textLang('', 'ko')).toBeUndefined()
    expect(textLang('', 'ja')).toBeUndefined()
    expect(textLang('   ', 'ko')).toBeUndefined()
    expect(textLang('\n\t', 'ja')).toBeUndefined()
  })

  it('still marks a string that is only punctuation or digits', () => {
    // Not blank, and genuinely rendered. "$2.5B+" sits next to Korean prose on
    // the stats row, and it is read aloud — so it is a real string with a real
    // language, unlike an empty one.
    expect(textLang('$2.5B+', 'ko')).toBe('en')
    expect(textLang('2023', 'ja')).toBe('en')
  })

  it('counts a mixed string as the document language', () => {
    // Documented limit rather than a bug: per string, not per run. The Korean
    // "Orbs 홈" is Korean, and the "Orbs" inside it is left unmarked.
    expect(textLang('Orbs 홈', 'ko')).toBeUndefined()
  })
})
