import React, { useRef, useEffect, useState } from "react";
import io from 'socket.io-client';
import Button from "../components/button/Button";
import { IoClose } from "react-icons/io5";
import { RiMenu3Line } from "react-icons/ri";

const socket = io('http://localhost:5000');

const WhiteBordPage = ({roomName:roomId, onLeaveRoom}) => {
  const isDrawing = useRef(false);
  const canvasRef = useRef(null);
  const [ctx,setCtx] = useState(null);
  const [showModal, setShowModal] = useState(true);
  const [brushColor, setBrushColor] = useState("#00000")

    useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const context = canvas.getContext("2d");
    context.lineCap = "round";
    context.strokeStyle = brushColor;
    context.lineWidth = 3;
    setCtx(context);

    socket.emit("join-room", roomId);

    socket.on("load-drawing", (drawingData) => {
  
    context.beginPath();
    drawingData.forEach(({ x, y , color}, index) => {
      context.strokeStyle = color;
      console.log(color)
      if (index === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
        context.stroke();
      }
    });
    context.stroke();
  });

    socket.on("draw", ({ x, y, color }) => {
      if(color) ctx.strokeStyle = color;
      context.lineTo(x, y);
      context.stroke();
      console.log("Draw");
    });

    socket.on("clear", () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.beginPath(); 
    })

  return () => {
    socket.off("load-drawing");
    socket.off("draw");
    socket.off("clear");
  };
  }, [roomId]);

  const startDrawing = (e) => {
    isDrawing.current = true;
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;
    ctx.beginPath();
    ctx.moveTo(x, y);
    socket.emit("draw", { x, y });
    console.log("StartDrawing")
  }

  const stopDrawing = (e) => {
    isDrawing.current = false;
    ctx.closePath()
    console.log("StopDrawing")
  }

  const drow = (e) => {
    if (!isDrawing.current) return;
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;
    ctx.lineTo(x, y);
    ctx.stroke();
    socket.emit("draw", { x, y, roomId, color : brushColor});
    console.log("Drow")
  }

  const handleClear = () => {
    socket.emit("clear",(roomId))
  }

  return (
   <div className="relative">
    {
      !showModal?(
        <div className="rounded-full shadow-lg p-3 border h-10 w-10 absolute m-5 cursor-pointer" onClick={()=>setShowModal(true)}><RiMenu3Line/></div>
      ):(
      <div className=" bg-white w-[15.5rem] h-[15rem] absolute shadow-lg rounded-lg flex flex-col justify-between m-5 p-3">
        <span><b>Room ID :</b> {roomId}</span>
        <div className=" rounded-full shadow-lg p-3 border h-10 w-10 absolute bg-white right-5 cursor-pointer" onClick={()=>setShowModal(false)}><IoClose/> </div>
        <div>
          <label htmlFor="color">Choose : </label>
          <input onChange={(e)=>setBrushColor(e.target.value)} type="color" name="color" className="cursor-pointer"/>
        </div>
        <div className="flex justify-between gap-2">
          <Button className="w-[7.5rem] bg-gray-300 text-black text-sm h-10 text-nowrap rounded-lg font-semibold hover:bg-gray-400" onClick={handleClear} >Clear Board</Button>
          <Button className="bg-red-600 hover:bg-red-700 w-[8rem] text-nowrap font-semibold text-sm h-10 p-0 rounded-lg" onClick={()=>onLeaveRoom()}>Leave Room</Button>
        </div>
    </div>
      )
    }
     <canvas
      ref={canvasRef}
      style={{ backgroundColor: 'white', width:"100%"}}
      onMouseDown={startDrawing}
      onMouseUp={stopDrawing}
      onMouseMove={drow}
      onMouseLeave={stopDrawing}
    />
   </div>
  );
};

export default WhiteBordPage;
