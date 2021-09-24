import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css'
import Lobby from './components/Lobby';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { useState } from 'react';
import Chat from './components/Chat';

const App = () => {
  const [connection, setConnection] = useState();
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);

  const joinRoom = async (user, room) => {
    try {
      const connection = new HubConnectionBuilder().withUrl("https://localhost:44391/chat").configureLogging(LogLevel.Information).build();

      connection.on("UsersInRoom", (users) => {
        setUsers(users);
      });

      connection.on("ReceivedMessage", (user, message) => {
        setMessages(messages => [...messages, { user, message }]);
      });

      connection.onclose(e => {
        setConnection();
        setMessages([]);
        setUsers([]);
      });

      await connection.start();
      await connection.invoke("JoinRoom", { user, room });
      setConnection(connection);
    } catch (error) {
      console.log(error);
    }
  };

  const closeConnection = async () => {
    try {
      await connection.stop();
      window.location.reload();
      
    } catch (e) {
      console.log(e);      
    }
  }

  const sendMessage = async (message) => {
    try {
      await connection.invoke("SendMessage", message);
    } catch (e) {
      console.log(e);
      
    }
  }

  return <div className="app">
    <h2>My Chatt</h2>
    <hr className='line' />
    {!connection
      ? <Lobby joinRoom={joinRoom}></Lobby>
      : <Chat messages={messages} sendMessage={sendMessage} closeConnection={closeConnection} users={users}></Chat>
    }
  </div>
}

export default App;
