'use client'

interface Props {
  photos: string[]
  venueName: string
  spaceName: string
  className?: string
}

export default function PhotoMosaic({ photos, venueName, spaceName, className = '' }: Props) {
  const alt = `${venueName} – ${spaceName}`
  const count = photos.length

  if (count === 0) return null

  // Mobile: single hero with badge
  // Desktop: mosaic grid
  return (
    <div className={`rounded-2xl overflow-hidden ${className}`}>
      {/* Mobile: hero only */}
      <div className="block md:hidden relative h-[200px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photos[0]}
          alt={alt}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {count > 1 && (
          <span className="absolute bottom-3 right-3 bg-dark/70 text-white text-[10px] font-bold px-2 py-1 rounded-full">
            1/{count}
          </span>
        )}
      </div>

      {/* Desktop: mosaic grid */}
      <div className="hidden md:block h-[280px]">
        {count === 1 && <SinglePhoto src={photos[0]} alt={alt} />}
        {count === 2 && <TwoPhotos photos={photos} alt={alt} />}
        {count === 3 && <ThreePhotos photos={photos} alt={alt} />}
        {count >= 4 && <FourPlusPhotos photos={photos} alt={alt} />}
      </div>
    </div>
  )
}

function SinglePhoto({ src, alt }: { src: string; alt: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className="w-full h-full object-cover" loading="lazy" />
  )
}

function TwoPhotos({ photos, alt }: { photos: string[]; alt: string }) {
  return (
    <div className="grid h-full gap-1" style={{ gridTemplateColumns: '3fr 2fr' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photos[0]} alt={alt} className="w-full h-full object-cover" loading="lazy" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photos[1]} alt={`${alt} 2`} className="w-full h-full object-cover" loading="lazy" />
    </div>
  )
}

function ThreePhotos({ photos, alt }: { photos: string[]; alt: string }) {
  return (
    <div className="grid h-full gap-1 grid-cols-2 grid-rows-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photos[0]}
        alt={alt}
        className="w-full h-full object-cover row-span-2"
        loading="lazy"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photos[1]} alt={`${alt} 2`} className="w-full h-full object-cover" loading="lazy" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photos[2]} alt={`${alt} 3`} className="w-full h-full object-cover" loading="lazy" />
    </div>
  )
}

function FourPlusPhotos({ photos, alt }: { photos: string[]; alt: string }) {
  const extraCount = photos.length - 4

  return (
    <div className="grid h-full gap-1 grid-cols-2 grid-rows-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photos[0]}
        alt={alt}
        className="w-full h-full object-cover row-span-2"
        loading="lazy"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photos[1]} alt={`${alt} 2`} className="w-full h-full object-cover" loading="lazy" />
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photos[2]}
          alt={`${alt} 3`}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {extraCount > 0 && (
          <div className="absolute inset-0 bg-dark/50 flex items-center justify-center">
            <span className="text-white font-display font-bold text-lg">
              +{extraCount + 1}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
