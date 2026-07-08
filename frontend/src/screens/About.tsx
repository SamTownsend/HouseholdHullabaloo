import { SubMenu } from '../components/SubMenu'

interface Props {
  onDone: () => void
}

export function About({ onDone }: Props) {
  return (
    <SubMenu onDone={onDone}>
      <p>The thing that you have to understand is that some of the answers are outlandish.</p>
      <p>Created by Sam Townsend</p>
      <a href="https://github.com/SamTownsend/HouseholdHullabaloo" target="_blank">
        GitHub Source
      </a>
    </SubMenu>
  )
}
