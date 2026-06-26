import { SubMenu } from '../components/SubMenu'

interface Props {
  onDone: () => void
}

export function About({ onDone }: Props) {
  return (
    <SubMenu onDone={onDone}>
      <p>ABOUT</p>
    </SubMenu>
  )
}
