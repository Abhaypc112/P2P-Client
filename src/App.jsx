import React, { useEffect, useState } from 'react'
import HomePage from './pages/HomePage'
import WhiteBordPage from './pages/WhiteBoardPage'

const ROOM_STORAGE_KEY = 'currentRoom';

const App = () => {
  const [room, setRoom] = useState("");

    useEffect(() => {
      const savedRoom = localStorage.getItem(ROOM_STORAGE_KEY);
      if (savedRoom) {
        setRoom(savedRoom);
      }
    }, []);

    const handleSelectRoom = (roomName) => {
      setRoom(roomName);
      localStorage.setItem(ROOM_STORAGE_KEY, roomName);
    };

  const handleLeaveRoom = () => {
    setRoom(null);
    localStorage.removeItem(ROOM_STORAGE_KEY);
  };

  return (
    <>
    {
      !room ? (
        <HomePage onSelectRoom={handleSelectRoom} />
      ):(
        <WhiteBordPage roomName={room} onLeaveRoom={handleLeaveRoom}/>
      )
    }
    </>
  )
}

export default App
