import { useState } from 'react'
import { MainMenu } from './screens/MainMenu'
import { NormalRound } from './screens/NormalRound'
import { Screen } from './types'

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.MainMenu)

  if (currentScreen === Screen.MainMenu) {
    return <MainMenu onStartGame={() => setCurrentScreen(Screen.NormalRound)} />
  }

  if (currentScreen === Screen.NormalRound) {
    return <NormalRound />
  }
}

export default App
