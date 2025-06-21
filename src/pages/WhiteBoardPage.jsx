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
  const [brushRange,setBrushRange] = useState(3);
  const [brushColor, setBrushColor] = useState("#00000");
  const rgb = ['#ff0000', '#00ff00', '#0000ff', '#ffff00'];

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

  const startDrawing = (e) => {
    isDrawing.current = true;
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;
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

  const drow = (e) => {
    if (!isDrawing.current) return;
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;
    ctx.strokeStyle = brushColor;
    ctx.lineTo(x, y);
    ctx.stroke();
    socket.emit("draw", { x, y, roomId, isStart : false, color : brushColor, size : brushRange });
    console.log("Drow",x,y)
  }

  const handleClear = () => {
    socket.emit("clear",(roomId))
  }

  return (
   <div className="relative font-">
    {
      !showModal?(
        <div className="rounded-full shadow-lg p-3 border h-10 w-10 absolute m-5 cursor-pointer" onClick={()=>setShowModal(true)}><RiMenu3Line/></div>
      ):(
      <div className=" bg-white w-[15.5rem] h-[15rem] absolute shadow-lg rounded-lg flex flex-col justify-between m-5 p-3">
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
