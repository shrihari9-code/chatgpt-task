import { useState, useEffect, useRef } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import Speech from "speak-tts";

const App = () => {
  const [value, setValue] = useState("");
  const [message, setMessage] = useState(null);
  const [previousChats, setPreviousChats] = useState([]);
  const [currentTitle, setCurrentTitle] = useState(null);
  const { transcript, resetTranscript } = useSpeechRecognition();
  const tts = new Speech();
  const [typingIndex, setTypingIndex] = useState(0);
  const typingDelay = 50; // Delay in milliseconds for the typing effect

  const inputRef = useRef(null);

  const createnewChat = () => {
    setMessage(null);
    setValue("");
    setCurrentTitle(null);
    resetTranscript();
  };

  const handleClick = (uniqueTitle) => {
    setCurrentTitle(uniqueTitle);
    setMessage(null);
    setValue("");
    resetTranscript();
  };

  const getmessages = async () => {
    const inputMessage = value || transcript;
    if (!inputMessage.trim()) return;

    try {
      const response = await fetch(`http://localhost:8000/completions`, {
        method: "POST",
        body: JSON.stringify({
          message: inputMessage,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      setMessage(data.choices[0].message);
      tts.speak({
        text: data.choices[0].message.content,
        listeners: {
          onend: () => {
            // Simulate typing effect after speech synthesis
            startTyping(data.choices[0].message.content);
          },
        },
      });
    } catch (err) {
      console.log("error", err);
    }
  };

  const startTyping = (content) => {
    const typingInterval = setInterval(() => {
      if (typingIndex <= content.length) {
        setValue(content.slice(0, typingIndex));
        setTypingIndex((prevIndex) => prevIndex + 1);
      } else {
        clearInterval(typingInterval);
      }
    }, typingDelay);
  };

  useEffect(() => {
    console.log(currentTitle, value, message);
    if (!currentTitle && value && message) {
      setCurrentTitle(value);
    }
    if (currentTitle && (value || message) && message) {
      setPreviousChats((prevChats) => [
        ...prevChats,
        {
          title: currentTitle,
          role: "user",
          content: value,
        },
        {
          title: currentTitle,
          role: message.role,
          content: message.content,
        },
      ]);
    }
  }, [message, currentTitle]);

  console.log("previuschat", previousChats);

  const currentchat = previousChats.filter(
    (previousChats) => previousChats.title === currentTitle
  );
  const uniqueTitle = Array.from(
    new Set(previousChats.map((previousChats) => previousChats.title))
  );
  console.log("uniquretitle", uniqueTitle);

  const startListening = () => {
    SpeechRecognition.startListening({ continuous: true });
    inputRef.current.focus();
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
    inputRef.current.blur();
  };

  return (
    <div className="app">
      <section className="side-bar">
        <button onClick={createnewChat}>+ New Chat</button>
        <button onClick={startListening}>Start Listening</button>
        <button onClick={stopListening}>Stop Listening</button>
        <ul className="history">
          {uniqueTitle?.map((uniqueTitle, index) => (
            <li key={index} onClick={() => handleClick(uniqueTitle)}>
              {uniqueTitle}
            </li>
          ))}
        </ul>
        <nav>
          <p>Task GPT</p>
        </nav>
      </section>
      <section className="main">
        <ul className="feed">
          {currentchat?.map((chatMessage, index) => (
            <li key={index}>
              <p className="role">{chatMessage.role}</p>
              <p>{chatMessage.content}</p>
            </li>
          ))}
        </ul>
        <div className="bottom-section">
          <div className="input-container">
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
            <div id="submit" onClick={getmessages}>
              ++
            </div>
          </div>
          <p className="info"></p>
        </div>
      </section>
    </div>
  );
};

export default App;
