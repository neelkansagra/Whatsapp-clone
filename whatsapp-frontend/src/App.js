import React, { useEffect, useState } from "react"
import './App.css';
import Chat from "./Chat";
import Sidebar from "./Sidebar.js"
import Pusher from 'pusher-js'
import axios from './axios.js'

function App() {
  const [messages, setMessages] = useState([])
  useEffect(() =>{
      axios.get('/message/sync').then(response => {
        console.log(response.data)
      })
  }, [])

  useEffect(() =>{
    const pusher = new Pusher('<Pusher ID>', {
      cluster: '<Pusher cluster>'
    });

    const channel = pusher.subscribe('message');
    channel.bind('inserted', function(data) {
      setMessages([...messages,data])
    });

    return () => {
      channel.unbind_all()
      channel.unsubscribe()
    }
  },[messages])

  console.log(messages)
  return (
    <div className="app">
      <div className="app__body">
    
      <Sidebar />
      <Chat  messages = {messages}/>
    </div>
    </div>
  );
}

export default App;
