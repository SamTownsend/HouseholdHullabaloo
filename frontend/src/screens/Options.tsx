import { SubMenu } from '../components/SubMenu'

interface Props {
  onDone: () => void
}

export function Options({ onDone }: Props) {
  return (
    <SubMenu onDone={onDone}>
      <p>OPTIONS</p>
    </SubMenu>
  )
}
