import { Fragment, useState } from 'react'
import './App.css'
import './styling/Player.css'
import { Routes, Route } from "react-router-dom";
import Home from './components/Home.jsx'
import Lobby from './components/Lobby.jsx'
import Starter from './components/Starter.jsx'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/starter" element={<Starter />} />
        <Route path="/create-room" element={<Lobby createRoom={true}/>} />
        <Route path="/join-room" element={<Lobby createRoom={false}/>} />
        <Route path = "/join"> </Route>
      </Routes>
      
  </>
  )
}

export default App
