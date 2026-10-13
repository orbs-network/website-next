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
  {
    name: 'iHODL',
    logo: 'https://images.ctfassets.net/ivp9qsr6kthp/img-d50f2c98554a68e8642da3e6260216196924fa79/b1c0a5800d0df14e7a1d62fdffe94841/ihodi.png',
  },
  {
    name: 'CryptoDaily (opaque)',
    logo: 'https://images.ctfassets.net/ivp9qsr6kthp/img-bd311fef9ea0cfc8901f6af316af7176eeaf2651/850f11eeb5f0bb58649cb7491cf0b03d/cryptodaily.png',
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
            thumbnail: publisherLogo(PUBLISHERS[0].logo),
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
        const logos = [...canvasElement.querySelectorAll('span > img')]
        await expect(logos).toHaveLength(5)
        await expect(logos.map((logo) => getComputedStyle(logo.parentElement!).backgroundColor)).toEqual([
          'rgb(255, 255, 255)',
          'rgb(255, 255, 255)',
          'rgb(255, 255, 255)',
          'rgb(255, 255, 255)',
          'rgb(255, 255, 255)',
        ])
        await expect(logos.map((logo) => getComputedStyle(logo).filter)).toEqual([
          'none',
          'brightness(0)',
          'brightness(0)',
          'brightness(0)',
          'none',
        ])
        const thumbnails = [...canvasElement.querySelectorAll('img.object-cover')]
        await expect(thumbnails).toHaveLength(5)
        await expect(thumbnails.every((image) => getComputedStyle(image).objectFit === 'cover')).toBe(true)
      }
    } finally {
      html.classList.toggle('dark', wasDark)
    }
  },
}
