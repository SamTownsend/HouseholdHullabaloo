import { SubMenu } from '../components/SubMenu'

interface Props {
  onDone: () => void
}

export function Stats({ onDone }: Props) {
  return (
    <SubMenu onDone={onDone}>
      <p>STATS</p>
    </SubMenu>
  )
}
