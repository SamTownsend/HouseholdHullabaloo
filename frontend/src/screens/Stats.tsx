import { SubMenu } from '../components/SubMenu'

interface Props {
  onDone: () => void
}

export function Stats({ onDone }: Props) {
  return (
    <SubMenu onDone={onDone}>
      <p>More fiction is written in Excel than in Word.</p>
    </SubMenu>
  )
}
