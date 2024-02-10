import MarkdownScreen from './MarkdownScreen';
import WebsiteScreen from './WebsiteScreen';

function App() {
  


  return (
    <div className="flex flex-row bg-zinc-600 text-white w-full h-screen justify-between">
      <MarkdownScreen />
      <WebsiteScreen />
    </div>
  );
}

export default App;
