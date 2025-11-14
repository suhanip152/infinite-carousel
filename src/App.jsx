import './App.css'
import VideoCarousel from "./components/VideoCarousel";
import { carouselVideos } from "./data/videos";

function App() {
  return (
    <div className="p-8">
      <VideoCarousel videos={carouselVideos} />
    </div>
  );
}

export default App;
