'use client'

interface Props {
  photos: string[]
  height?: number
}

export default function PhotoCarousel({ photos, height = 220 }: Props) {
  return (
    <div
      className="flex gap-2.5 overflow-x-auto py-1"
      style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
    >
      {photos.map((url, i) => (
        <div
          key={i}
          className="shrink-0 rounded-md border-2 border-dark overflow-hidden bg-base-deep"
          style={{ width: 280, height }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      ))}
    </div>
  )
}
