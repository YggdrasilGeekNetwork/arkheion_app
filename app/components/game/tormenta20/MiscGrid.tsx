import { Masonry } from 'masonic'

export type MiscCardDef = { key: string; element: React.ReactNode }

type Props = {
  cards: MiscCardDef[]
  minColWidth?: number
  gap?: number
  className?: string
}

const CardRenderer = ({ data }: { data: MiscCardDef; width: number; index: number }) => (
  <div>{data.element}</div>
)

export default function MiscGrid({ cards, minColWidth = 130, gap = 6, className }: Props) {
  return (
    <div className={className}>
      <Masonry
        items={cards}
        columnWidth={minColWidth}
        columnGutter={gap}
        rowGutter={gap}
        itemKey={item => item.key}
        render={CardRenderer}
        overscanBy={Infinity}
      />
    </div>
  )
}
