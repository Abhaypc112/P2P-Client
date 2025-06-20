import React, { useEffect, useState } from 'react'
import Button from '../components/button/Button';
import axios from 'axios';

const HomePage = ({onSelectRoom}) => {
    const [rooms, setRooms] = useState([]);
    const [newRoomName, setNewRoomName] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchRooms = async() => {
        setLoading(true);
        try{
            const res = await axios.get(' http://localhost:5000/api/rooms');
            setRooms(res.data);
            console.log(res.data);
        }catch (error) {
            console.error('Failed to fetch rooms', error);
        }finally{
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchRooms();
    }, []);

    const handleJoin = (room) => {
        onSelectRoom(room)
    }

    const handleCreate = () => {
        if(newRoomName.trim()){
            onSelectRoom(newRoomName.trim());
        }
    }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r  p-4">
        <div className='w-[30rem] h-[25rem] shadow-lg rounded-lg flex flex-col justify-center border items-center gap-3'>
            <div className='w-[90%] h-[50%] flex flex-col gap-3 overflow-auto py-3 scroll-bar-none '>
                {
                   loading?(
                        <p className="text-center text-gray-500">Loading rooms...</p>
                        ) : rooms.length === 0 ? (
                            <p className="text-center text-gray-500">No active rooms found.</p>
                   ):(
                     rooms?.map((room, index)=>{
                        return(
                            <div key={index} className='flex w-full gap-2'>
                                <input value={room} className="w-[80%] h-11 border rounded-lg p-3 outline-none" disabled/>
                                <Button onClick={()=>handleJoin(room)} className='h-11'>Join</Button>
                            </div>
                        )
                    })
                   )
                }
            </div>
        <div className='flex flex-col gap-5 w-full justify-center items-center'>
            <input onChange={(e) => setNewRoomName(e.target.value)} value={newRoomName} placeholder="Create new room" className="w-[90%] h-12 border rounded-lg p-3 outline-none"/>
            <Button onClick={handleCreate} className="w-[90%] py-3.2">Create / Join Room </Button>
        </div>
        </div>
    </div>
  )
}

export default HomePage