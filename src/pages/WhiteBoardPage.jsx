import React, { useRef, useEffect, useState } from "react";
import io from 'socket.io-client';
import Button from "../components/button/Button";
import { IoClose } from "react-icons/io5";
import { RiMenu3Line } from "react-icons/ri";

  const API = process.env.NODE_ENV === "development"
        ? "http://localhost:5000"
        : "https://p2p-server-p4zm.onrender.com";

const socket = io(API);

const WhiteBordPage = ({roomName:roomId, onLeaveRoom}) => {
  const isDrawing = useRef(false);
  const canvasRef = useRef(null);
  const [ctx,setCtx] = useState(null);
  const [showModal, setShowModal] = useState(true);
  const [brushRange,setBrushRange] = useState(3);
  const [brushColor, setBrushColor] = useState("#00000");
  const rgb = ['#ff0000', '#00ff00', '#0000ff', '#ffff00'];
  const [usersList,setUsersList] = useState(0);
  const [dropDown, setDropDown] = useState(false);

    useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const context = canvas.getContext("2d");
    context.lineCap = "round";
    setCtx(context);

    socket.emit("join-room", roomId);
    context.beginPath();
    socket.on("load-drawing", (drawingData) => {
    socket.on("user-count", (users) => {
      console.log(users)
      setUsersList(users);
    });
      drawingData.forEach(({ x, y, isStart, color, size }, index) => {
        if (isStart) {
          context.beginPath()
          context.moveTo(x, y);
          context.strokeStyle = color;
          context.lineWidth = size;
        } else {
          context.lineTo(x, y);
          context.stroke();
        }
      });
  });

    socket.on("draw", ({ x, y, isStart, color, size }) => {
      if(isStart){
        context.beginPath();
        context.moveTo(x, y);
        context.lineWidth = size;
        context.strokeStyle = color;
      }else{
        context.lineTo(x, y);
        context.stroke();
      }
      console.log("Draw");
    });

    socket.on("clear", () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.beginPath(); 
    })
  }, [roomId]);

const getEventCoordinates = (e) => {
  const canvas = canvasRef.current;
  const rect = canvas.getBoundingClientRect();

  if (e.touches && e.touches.length > 0) {
    const touch = e.touches[0];
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    };
  } else if (e.changedTouches && e.changedTouches.length > 0) {
    const touch = e.changedTouches[0];
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    };
  } else {
    return {
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY,
    };
  }
};

  const startDrawing = (e) => {
    isDrawing.current = true;
    const{x, y} = getEventCoordinates(e);
    ctx.lineWidth = brushRange;
    ctx.strokeStyle = brushColor;
    ctx.beginPath();
    ctx.moveTo(x, y);
    socket.emit("draw", { x, y, roomId, isStart : true, color : brushColor, size : brushRange});
    console.log("StartDrawing",x,y)
  }

  const stopDrawing = (e) => {
    isDrawing.current = false;
    ctx.closePath()
    console.log("StopDrawing")
  }

  const draw = (e) => {
    if (!isDrawing.current) return;
    const{x, y} = getEventCoordinates(e);
    ctx.strokeStyle = brushColor;
    ctx.lineTo(x, y);
    ctx.stroke();
    socket.emit("draw", { x, y, roomId, isStart : false, color : brushColor, size : brushRange });
    console.log("Draw")
  }

  const handleClear = () => {
    socket.emit("clear",(roomId))
  }

  const handleLeaveRoom = () => {
      socket.emit("leave-room", roomId);
      onLeaveRoom()
  }

  return (
   <div className="relative font-">
    {
      !showModal?(
        <div className="rounded-full shadow-lg p-3 border h-10 w-10 absolute m-5 cursor-pointer" onClick={()=>setShowModal(true)}><RiMenu3Line/></div>
      ):(
      <div className=" bg-white w-[15.5rem] gap-5 absolute shadow-lg rounded-lg flex flex-col justify-between m-5 p-3">
        <span><b>Room ID :</b> {roomId}</span>
        <div className=" rounded-full shadow-lg p-3 border h-10 w-10 absolute bg-white right-5 cursor-pointer" onClick={()=>setShowModal(false)}><IoClose/> </div>
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-sm text-gray-600" htmlFor="color">Brush Color </label>
          <div className="flex items-center gap-2">
          <input onChange={(e)=>setBrushColor(e.target.value)} type="color" name="color" className="cursor-pointer h-[3rem] "/>
            {
              rgb?.map((color,index)=>{
                return(
                  <div key={index} onClick={()=>setBrushColor(color)} style={{backgroundColor:color}} className="h-7 w-7 rounded-full border cursor-pointer border-gray-200"></div>
                )
              })
            }
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="range" className="font-semibold text-sm text-gray-600">Brush Size : {brushRange}px</label>
          <input value={brushRange} onChange={(e)=> setBrushRange(e.target.value)} name="range" className="cursor-pointer border-none outline-none" type="range" min="1" max="30"/>
        </div>
        <div className="flex justify-between gap-2">
          <button className="bg-gray-200 hover:bg-gray-300 w-[8rem] text-nowrap font-semibold text-sm h-10 p-0 rounded-lg text-gray-800" onClick={handleClear} >Clear Board</button>
          <Button className="bg-red-600 hover:bg-red-700 w-[8rem] text-nowrap font-semibold text-sm h-10 p-0 rounded-lg" onClick={handleLeaveRoom}>Leave Room</Button>
        </div>
        <div className="">
              <div className="flex justify-between w-full text-sm font-semibold items-center">
                <span className="bg-gray-200 rounded-full p-2  flex items-center justify-center" >👤{usersList?.length || 1}</span>
                <span onClick={()=>setDropDown(!dropDown)} className="bg-indigo-600 text-white p-1 w-12 text-center rounded cursor-pointer">{dropDown?"Close":"View"}</span>
              </div>
              {
                dropDown && (
                  <div className="h-[10rem] overflow-auto py-2 flex flex-col gap-2">
                {
                  usersList && usersList.map((user,index) => {
                    return(
                      <div>
                        <ol className="">
                          <li className="text-sx">{index+1} -{user}</li>
                        </ol>
                      </div>
                    )
                  })
               }
              </div>
                )
              }
        </div>
    </div>
      )
    }
     <canvas
      ref={canvasRef}
      style={{ backgroundColor: 'white', width:"100%", touchAction: 'none'}}
      onMouseDown={startDrawing}
      onMouseUp={stopDrawing}
      onMouseMove={draw}
      onMouseLeave={stopDrawing}
      onTouchStart={startDrawing}
      onTouchEnd={stopDrawing}
      onTouchMove={draw}
    />
   </div>
  );
};

export default WhiteBordPage;
