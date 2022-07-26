import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateBooks } from "../redux/orderBookReducer";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
  } from '@tanstack/react-table'
  
function OrderBook() {
  const [isPaused, setPause] = useState(false);
  const book = useSelector((state) => state.orderBook.BOOK)
  const dispatch = useDispatch();
  const ws = useRef(null);
 

  useEffect(() => {
    ws.current = new WebSocket("wss://api-pub.bitfinex.com/ws/2");
    ws.current.onopen = () => {
      ws.current.send(JSON.stringify({ event: "conf", flags: 65536 + 131072 }));
      ws.current.send(
        JSON.stringify({
          event: "subscribe",
          channel: "book",
          pair: "BTCUSD",
          prec: "P0",
          len: 100,
        })
      );
    };
    ws.current.onclose = () => console.log("ws closed");

    const wsCurrent = ws.current;

    return () => {
      wsCurrent.close();
    };
  }, []);

  useEffect(() => {
    if (!ws.current) return;

    ws.current.onmessage = (e) => {
      dispatch(updateBooks(e.data));
    
    };
  }, [isPaused]);
  return <div>React table</div>;
}

export default OrderBook;
