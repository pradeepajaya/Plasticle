import { useState } from 'react'
import './App.css'
import Sidebar from './assets/layout/Sidebar/Sidebar'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="app">
        <Sidebar/>
        </div>
    </>
  )
}

export default App
