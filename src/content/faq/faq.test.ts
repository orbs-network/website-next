import { describe, expect, it } from 'vitest'
import { parseFaq } from '@/components/marketing/faq-document'
import { FAQ_DOCUMENTS } from '.'

describe('English FAQ handoff', () => {
  it('keeps all fourteen questions in handoff order, with nonempty answers', () => {
    const questions = parseFaq(FAQ_DOCUMENTS['/faq'].body.en!).flatMap((section) => section.questions)
    expect(questions.map(({ question }) => question)).toEqual([
      'What is Orbs?',
      'What does Layer 3 mean here?',
      'What are Orbs’ products?',
      'What does dSPOT include?',
      'How does TWAP work?',
      'What is dPERPS?',
      'How can I integrate Orbs?',
      'Does Orbs take custody of my assets?',
      'Which chains and venues are supported?',
      'What are Orbs Lambda and Orbs VM?',
      'What are Guardians and what is ORBS used for?',
      'When did Orbs launch?',
      'Where can I find audits and source code?',
      'Where do I start?',
    ])
    for (const { answer } of questions) expect(answer.length).toBeGreaterThan(0)
  })

  it('keeps technical market-order explanations conditional on liquidity and market conditions', () => {
    const questions = parseFaq(FAQ_DOCUMENTS['/dtwap-and-dlimit-faq'].body.en!).flatMap((section) => section.questions)
    for (const title of ['Should I use a dTWAP-market or dTWAP-limit order?', 'Should I use a stop-loss limit or stop-loss market?']) {
      const answer = questions.find(({ question }) => question === title)!.answer
      expect(answer).toContain('Execution depends on market conditions and available liquidity.')
      expect(answer).not.toContain('guarantees full execution')
      expect(answer).not.toContain('ensure that your order will be executed')
    }
  })
})
