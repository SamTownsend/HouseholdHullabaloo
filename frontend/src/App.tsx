import { useEffect, useState } from 'react'

function App() {
  const [message, setMessage] = useState<string>('')

  useEffect(() => {
    fetch('/api/hello')
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => console.error('Failed to fetch:', err))
  }, [])

  return (
    <div>
      <h1>{message}</h1>
    </div>
  )
}

export default App
