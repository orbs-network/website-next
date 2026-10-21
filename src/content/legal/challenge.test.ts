import { describe, expect, it } from 'vitest'
import { LEGAL_DOCUMENTS } from './index'
import { isArchived, localesFor, placeholderRobots } from '@/i18n/availability'

describe('May 2026 Challenge archive', () => {
  it('preserves all three legacy routes and marks each as an archive', () => {
    expect(localesFor('/challenge')).toEqual(['en', 'ja', 'ko'])
    expect(isArchived('/challenge')).toBe(true)
    for (const locale of ['en', 'ja', 'ko'] as const) {
      expect(placeholderRobots('/challenge', locale)).toEqual({ index: false, follow: true })
    }
  })

  it.each(['en', 'ja', 'ko'] as const)('retains the %s prize/rule record with a clear closure notice', (locale) => {
    const body = LEGAL_DOCUMENTS['/challenge'].body[locale]
    expect(body).toContain(
      { en: 'Entries are closed.', ja: '参加受付は終了しました。', ko: '참가 접수는 종료되었습니다.' }[locale]
    )
    expect(body).toContain('USDC')
    expect(body).toContain('599')
    expect(body).toContain('30')
    expect(body).toContain({ en: '18+', ja: '18歳', ko: '18세' }[locale])
    expect(body).not.toContain('](https://clawhub.ai')
    expect(body).toContain(
      {
        en: 'sole arbiter of eligibility and disqualification',
        ja: '参加資格および失格の唯一の判断者',
        ko: '참가 자격·실격을 단독 판단',
      }[locale]
    )
  })
})
