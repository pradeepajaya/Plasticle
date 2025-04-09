import { useState } from 'react'
import './App.css'
import Sidebar from './assets/layout/Sidebar/Sidebar'
import Content from './assets/layout/Content/Content'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="app">
        <Sidebar />
        <Content />
      </div>
    </>
  )
}

export default App
