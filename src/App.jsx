import { useEffect, useState } from 'react';
import MarkdownScreen from './MarkdownScreen';
import WebsiteScreen from './WebsiteScreen';
import { parse } from 'parse5';

function App() {
  const [code, setCode] = useState("");
  const [jsx, setJsx] = useState([]);


const html = `<div>
  <p>Hello, <span>world!</span></p>
</div>`;


  useEffect(() => {
    const document = parse(html);

    // The `document` now contains the AST of the parsed HTML
    console.log(document);



  }, [code]);

  return (
    <div className="flex flex-row bg-zinc-600 text-white w-full h-screen justify-between">
      <MarkdownScreen setCode={setCode} />
      <WebsiteScreen jsx={jsx} />
    </div>
  );
}

export default App;
