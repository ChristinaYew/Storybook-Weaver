
import React, { useState, useEffect, useRef } from 'react';
import { Chapter } from '../types';
import { generatePageImage, generatePageAudio } from '../services/geminiService';
import { decodeBase64, decodeAudioData } from '../services/audioUtils';
import { Volume2, Loader2, Image as ImageIcon, Pause } from 'lucide-react';

interface BookPageProps {
  chapter: Chapter;
  pageNumber: number;
  isActive: boolean;
}

const BookPage: React.FC<BookPageProps> = ({ chapter, pageNumber, isActive }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(-1);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const requestRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  const durationRef = useRef<number>(0);

  // Reset state when chapter changes
  useEffect(() => {
    stopAudio();
    setImageUrl(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter]);

  // Generate image only when the page becomes active to save bandwidth/quota
  useEffect(() => {
    let isMounted = true;
    if (isActive && !imageUrl && !loadingImage) {
      setLoadingImage(true);
      generatePageImage(chapter.visualPrompt)
        .then(url => {
          if (isMounted && url) setImageUrl(url);
        })
        .finally(() => {
          if (isMounted) setLoadingImage(false);
        });
    }
    return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, chapter.visualPrompt]); 

  const stopAudio = () => {
    if (audioSourceRef.current) {
        try { audioSourceRef.current.stop(); } catch(e) {}
        audioSourceRef.current = null;
    }
    if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
    }
    setAudioPlaying(false);
    setCurrentWordIndex(-1);
  };

  const playAudio = async () => {
    if (audioPlaying) {
        stopAudio();
        return;
    }

    setLoadingAudio(true);
    try {
        const base64Audio = await generatePageAudio(chapter.content);
        if (!base64Audio) throw new Error("No audio returned");

        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        
        if (audioContextRef.current.state === 'suspended') {
            await audioContextRef.current.resume();
        }

        const audioBuffer = await decodeAudioData(
            decodeBase64(base64Audio),
            audioContextRef.current,
            24000,
            1
        );

        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        
        source.onended = () => {
            setAudioPlaying(false);
            setCurrentWordIndex(-1);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };

        source.start();
        audioSourceRef.current = source;
        
        // Setup animation loop for word highlighting
        startTimeRef.current = audioContextRef.current.currentTime;
        durationRef.current = audioBuffer.duration;
        
        // Estimate word count for highlighting
        // Note: simple split by space is an approximation for sync
        const wordsCount = chapter.content.trim().split(/\s+/).length;
        
        const updateHighlight = () => {
            if (!audioContextRef.current) return;
            const elapsed = audioContextRef.current.currentTime - startTimeRef.current;
            
            if (elapsed < durationRef.current) {
                const progress = elapsed / durationRef.current;
                const index = Math.floor(progress * wordsCount);
                setCurrentWordIndex(index);
                requestRef.current = requestAnimationFrame(updateHighlight);
            } else {
                setCurrentWordIndex(-1);
            }
        };

        requestRef.current = requestAnimationFrame(updateHighlight);
        setAudioPlaying(true);

    } catch (err) {
        console.error("Playback failed", err);
    } finally {
        setLoadingAudio(false);
    }
  };

  useEffect(() => {
    return () => {
        stopAudio();
        if (audioContextRef.current) {
             audioContextRef.current.close();
        }
    };
  }, []);

  const words = chapter.content.split(/\s+/);

  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-[#fdfbf7] shadow-inner overflow-hidden">
      {/* Left Side - Visual */}
      <div className="lg:w-1/2 w-full h-1/2 lg:h-full p-4 lg:p-8 flex items-center justify-center bg-amber-50/50 border-b lg:border-b-0 lg:border-r border-stone-200 relative">
        <div className="absolute top-4 left-4 text-stone-400 font-serif text-sm italic z-10">
          Page {pageNumber}
        </div>
        
        <div className="relative w-full h-full max-h-[500px] bg-white p-2 lg:p-4 shadow-lg transform rotate-1 transition-transform duration-700 hover:rotate-0">
          {loadingImage ? (
             <div className="w-full h-full bg-stone-100 flex flex-col items-center justify-center text-stone-400 animate-pulse">
                <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                <span className="font-handwritten text-xl">Painting the scene...</span>
             </div>
          ) : imageUrl ? (
            <img src={imageUrl} alt="Story illustration" className="w-full h-full object-cover filter sepia-[0.1] contrast-[1.05]" />
          ) : (
            <div className="w-full h-full bg-stone-100 flex items-center justify-center text-stone-400">
                <span className="font-handwritten text-xl text-center px-4">{chapter.visualPrompt}</span>
            </div>
          )}
        </div>
      </div>

      {/* Right Side - Text */}
      {/* Changed justify-center to justify-start with auto margins for safe centering */}
      <div className="lg:w-1/2 w-full h-1/2 lg:h-full p-6 md:p-8 lg:p-12 flex flex-col overflow-y-auto custom-scrollbar">
        <div className="my-auto">
            <h3 className="text-lg md:text-xl lg:text-2xl font-serif font-bold text-amber-950 mb-4 leading-tight break-words">
                {chapter.title}
            </h3>
            
            <p className="text-base md:text-lg lg:text-xl font-serif text-stone-800 leading-relaxed mb-6">
                {words.map((word, index) => {
                    // Check if it's the first word of the chapter for Drop Cap styling
                    if (index === 0) {
                         return (
                             <span key={index} className={`inline-block transition-colors duration-200 rounded px-0.5 ${index === currentWordIndex ? 'bg-amber-200 text-amber-900' : ''}`}>
                                 <span className="text-3xl md:text-5xl font-bold text-amber-800 mr-1 float-left leading-[0.8]">{word.charAt(0)}</span>
                                 {word.slice(1)}{' '}
                             </span>
                         );
                    }
                    return (
                        <span 
                            key={index} 
                            className={`transition-colors duration-200 rounded px-0.5 ${index === currentWordIndex ? 'bg-amber-200 text-amber-900' : ''}`}
                        >
                            {word}{' '}
                        </span>
                    );
                })}
            </p>

            <div className="mt-4 flex justify-end">
                <button 
                    onClick={playAudio}
                    disabled={loadingAudio}
                    className="flex items-center space-x-2 px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-full transition-colors duration-300 font-semibold text-sm shadow-sm"
                >
                    {loadingAudio ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : audioPlaying ? (
                        <Pause className="w-4 h-4" />
                    ) : (
                        <Volume2 className="w-4 h-4" />
                    )}
                    <span>{audioPlaying ? "Pause Reading" : "Read to Me"}</span>
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default BookPage;
