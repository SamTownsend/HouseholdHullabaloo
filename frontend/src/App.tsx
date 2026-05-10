import { useState } from 'react'
import { MainMenu } from './screens/MainMenu'
import { NormalRound } from './screens/NormalRound'
import { Screens } from './types'

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screens>(Screens.MainMenu)

  if (currentScreen === Screens.MainMenu) {
    return <MainMenu onStartGame={() => setCurrentScreen(Screens.NormalRound)} />
  }

  if (currentScreen === Screens.NormalRound) {
    return <NormalRound />
  }
}

export default App
