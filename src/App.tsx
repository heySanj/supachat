import { useEffect, useState } from 'react'
import './App.css'
import supabase from './supabaseClient'
import Chat from './components/Chat'
import Login from './components/Login'

function App() {
  const [data, setData] = useState('Loading Data')

  const getData = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select()

    if (data) {
      setData(data[0].text)
    }

    if (error) {
      setData(error.message)
    }

  }

  useEffect(() => {
    getData()

  }, [])


  return (
    <>
      <h1 className="font-serif font-black text-7xl italic tracking-tight mb-4">{data}</h1>
      <Chat />
      <Login />
    </>
  )
}

export default App
