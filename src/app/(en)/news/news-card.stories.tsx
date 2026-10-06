import type { Asset } from 'contentful'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect } from 'storybook/test'
import { MediaCard } from './news-card'

const meta = {
  title: 'Marketing/MediaCard',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function publisherLogo(url: string): Asset<undefined> {
  return {
    sys: { id: url, type: 'Asset' },
    fields: { file: { url: url.replace('https:', '') } },
  } as unknown as Asset<undefined>
}

const PUBLISHERS = [
  {
    name: 'CryptoNews',
    logo: 'https://images.ctfassets.net/ivp9qsr6kthp/img-4d0d4ef78729c242716409c5ccc06055f7045192/714de9b21bc9f97038037b348cdeac4a/CRyptoNews2.png',
  },
  {
    name: 'CryptoNews (white)',
    logo: 'https://images.ctfassets.net/ivp9qsr6kthp/img-956c4735653f599776dad7b3845c85c6240736ba/fdb07aea7c2b3d30e47e08c3739b5ddc/cryptonews.svg',
  },
  {
    name: 'ZyCrypto',
    logo: 'https://images.ctfassets.net/ivp9qsr6kthp/img-028654c0df5649bf1b08bfdb3c2d0a1f38dd9ec0/7d087083fe1ec804d5bed51b40504a3d/zycrypto.png',
  },
]

export const PublisherBackings: Story = {
  render: () => (
    <div className="grid gap-4">
      {PUBLISHERS.map((publisher) => (
        <MediaCard
          key={publisher.logo}
          mention={{
            headline: publisher.name,
            date: '2026-10-06T00:00:00Z',
            url: 'https://example.com/article',
            publisherLogo: publisherLogo(publisher.logo),
          }}
        />
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const html = document.documentElement
    const wasDark = html.classList.contains('dark')
    try {
      for (const dark of [false, true]) {
        html.classList.toggle('dark', dark)
        const logos = [...canvasElement.querySelectorAll('img')]
        await expect(logos).toHaveLength(3)
        await expect(logos.map((logo) => getComputedStyle(logo.parentElement!).backgroundColor)).toEqual([
          'rgb(255, 255, 255)',
          'rgb(18, 18, 20)',
          'rgb(18, 18, 20)',
        ])
      }
    } finally {
      html.classList.toggle('dark', wasDark)
    }
  },
}
