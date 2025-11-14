import React, { useRef, useEffect, useMemo, useState } from "react";

const VideoCarousel = ({ videos }) => {
  const scrollRef = useRef(null);
  const videoContainerRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [activeVideo, setActiveVideo] = useState(null);
  const [visibleIndexes, setVisibleIndexes] = useState({});

  const infiniteVideos = useMemo(() => {
    if (!Array.isArray(videos)) return [];
    // For small/medium lists, duplicate once so the train is long enough to see scrolling.
    if (videos.length <= 10) {
      return [...videos, ...videos];
    }
    // For larger lists, no duplication to avoid too many DOM nodes.
    return videos;
  }, [videos]);

  useEffect(() => {
    const container = scrollRef.current;
    let frameId;
    const speed = 0.5;

    const scroll = () => {
      if (!container) return;

      if (!isHovered) {
        container.scrollLeft += speed;

        if (
          container.scrollLeft >=
          container.scrollWidth - container.clientWidth
        ) {
          container.scrollLeft = 0;
        }
      }

      frameId = requestAnimationFrame(scroll);
    };

    frameId = requestAnimationFrame(scroll);

    return () => cancelAnimationFrame(frameId);
  }, [isHovered]);

  useEffect(() => {
    const container = videoContainerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        setVisibleIndexes((prev) => {
          const next = { ...prev };
          entries.forEach((entry) => {
            const index = Number(entry.target.dataset.index);
            if (Number.isNaN(index)) return;
            next[index] = entry.isIntersecting;
          });
          return next;
        });
      },
      {
        root: scrollRef.current,
        threshold: 0.25,
      }
    );

    const videosInDom = container.querySelectorAll("video[data-index]");
    videosInDom.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [infiniteVideos]);

  const handleVideoKeyDown = (event, vid) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setActiveVideo(vid);
    }
  };

  return (
    <>
      <div className="video-carousel-wrapper">
        <div className="carousel-shadow carousel-shadow-left" aria-hidden="true" />
        <div className="carousel-shadow carousel-shadow-right" aria-hidden="true" />

        <div
          className="video-carousel"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          role="listbox"
          aria-label="Video carousel"
        >
          <div
            ref={(node) => {
              scrollRef.current = node;
              videoContainerRef.current = node;
            }}
            className="video-carousel"
            aria-hidden="false"
          >
            {infiniteVideos.map((vid, i) => (
              <video
                key={i}
                src={vid}
                data-index={i}
                preload={visibleIndexes[i] ? "metadata" : "none"}
                autoPlay={!!visibleIndexes[i]}
                loop
                muted
                className="rounded object-cover video-container"
                onClick={() => setActiveVideo(vid)}
                tabIndex={0}
                role="option"
                aria-label={`Video ${i + 1}`}
                onKeyDown={(e) => handleVideoKeyDown(e, vid)}
              />
            ))}
          </div>
        </div>
      </div>

      {activeVideo && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Expanded video view"
          onClick={() => setActiveVideo(null)}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              src={activeVideo}
              autoPlay
              loop
              controls
              className="modal-video"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default VideoCarousel;
