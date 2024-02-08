import { useEffect, useState } from 'react';
import MarkdownScreen from './MarkdownScreen';
import WebsiteScreen from './WebsiteScreen';

function App() {
  const [code, setCode] = useState("");
  const [jsx, setJsx] = useState([]);

  const parseMarkdownToJsx = (markdown) => {
    const lines = markdown.split('\n');
    const jsx = lines.map((line, index) => {
      if (line.startsWith('# ')) {
        return <h1 key={index}>{line.substring(2)}</h1>;
      } else if (line.startsWith('## ')) {
        return <h2 key={index}>{line.substring(3)}</h2>;
      } else if (line.match(/^\[Button .*\]\(#.*\)$/)) { // Simple button regex
        const buttonText = line.match(/\[Button (.*?)\]/)[1];
        const buttonAction = line.match(/\(#(.*?)\)/)[1];
        return <button key={index} onClick={() => alert(`Action: ${buttonAction}`)}>{buttonText}</button>;
      } else if (line.match(/^\{Input .*?\}$/)) { // Simple input regex
        const placeholder = line.match(/\{Input (.*?)\}/)[1];
        return <input key={index} placeholder={placeholder} />;
      } else {
        return <p key={index}>{line}</p>;
      }
    });
    setJsx(jsx);
  };

  useEffect(() => {
    parseMarkdownToJsx(code);
  }, [code]);

  return (
    <div className="flex flex-row bg-zinc-600 text-white w-full h-screen justify-between">
      <MarkdownScreen setCode={setCode} />
      <WebsiteScreen jsx={jsx} />
    </div>
  );
}

export default App;
