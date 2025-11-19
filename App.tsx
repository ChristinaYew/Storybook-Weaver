import React, { useState } from 'react';
import { AppState, StoryData } from './types';
import { parseStoryFromText } from './services/geminiService';
import LoadingBook from './components/LoadingBook';
import BookPage from './components/BookPage';
import { BookOpen, Sparkles, ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';

const DEFAULT_TEXT = `Dreams for Afar 
Growing up in Malaysia, I watched people talk about summer camps and summer breaks - experiences that I couldn't have because Malaysia is summer year-round. I've always dreamed of visiting and living in the United States. People have always seen me as open-minded and extroverted, and I've always loved art and jazz culture, which makes me feel like Western culture resonates with me more than being in Asia.
It's been extremely difficult for me to find like-minded people to hang around with and talk about deeper things. Conversations here rarely go beyond money, gossip and spilling tea about someone. This constant social disconnect has been exhausting for me.
This year, having the chance to join the Summer WAT (Work & Travel Programme) has not only broadened my views and perspective but also awakened the inner me - who I want to be - and shown me that it's actually normal to be that kind of person.
That said, I still have no clue what I really want to pursue career-wise. I'm still figuring out, and it's always about thinking rather than taking action, which drains me often. But one thing I'm certain about is wanting to be surrounded by nature, galleries, and music - just to appreciate and enjoy the little moments in life.
The Journey Begins
I spent my whole summer in Provincetown, Massachusetts, about two hours away from Boston. The entire journey from Malaysia took a total of 34 hours, including a night's stay in Boston and a bus ride to Provincetown. 
It was my first time flying with Qatar Airlines, and I was genuinely impressed. The seats were spacious, the food was delicious, and they provided everything you might need: hotel slippers, blankets, earplugs, eye masks and even an adjustable neck seat!
I vividly remember when I first reached Boston, the weather sucked. It had been raining all day. My first meal in Boston was Chinese noodle soup because all the shops were closing early, and there was no food available. The food wasn't particularly good and cost me $20!
The next day, still raining, but I felt alive and reborn. Being able to come so far and start a new life in a country I've always wanted to be in for ages, it literally felt so good. I was travelling alone, but I wasn't scared of it. I felt more excited and thrilled. I lived in a youth hostel and casually chatted with one of the professors from neuroscience and genetics background who was going to give talks at MIT. I was wide-eyed and amazed, as I had never encountered anything like this in Malaysia. Experiences like this made me realise that diversity in the U.S. allows you to meet people from different backgrounds, exposing you to ideas and fields you might never encounter at home.
Arriving In Provincetown
When I finally reached Provincetown, it was still raining, with intense wind. I had to take a cab to my workplace. Honestly, nothing much happened at first, but then my Thai friend came over and we quickly became close.  After completing the documentation process, I took a ride back to my accommodation.
I was frustrated carrying two large pieces of luggage in the rain, but luckily, an American guy named Adam offered to help me bring my stuff to my room. When I entered my room, I was initially disappointed. Things were scattered on the floor, dishes were dirty, and the space was generally messy. I was staying with a Jamaican girl, and over time, we quarrelled a few times. She snored loudly, played her iPad at full volume while falling asleep, didn't clean her dishes, and wouldn't open the door while cooking - behaviours I just couldn't tolerate. I emailed my manager to request a room change.
Luckily, a couple was leaving, and I got to live on my own the whole summer. It was amazing. You just walked out and got straight access to the beach. They had tables and chairs outside. Whenever I had time, I would sit outside, enjoy the sun and my breakfast, or just be at the beach enjoying the view. In the evening, I enjoyed the sunset. At night, I enjoyed the moonlight and listened to the waves, enjoying the breeze. 
Discovering Provincetown 
Provincetown itself is remarkable, known for its inclusive and dynamic culture, especially for the LGBT+ community. Rainbow colours are everywhere, creating a vibrant and free-spirited atmosphere. Initially, I had wanted to stay in Martha's Vineyard for serenity and proximity to the sea, but Provincetown exceeded my expectations. I felt honoured to belong there. The town sits at the tip of Cape Cod, surrounded by beaches, dunes, and lively streets. There are themed parties on Fridays, Saturdays, Mondays (Latin night), and Tuesdays (Bulgarian night), where people can drink freely and enjoy themselves. The town's energy is balanced with relaxation - I could walk an hour and still feel energised.
Wildlife adds to the charm; rabbits and foxes would appear unexpectedly, and the variety of flowers kept me snapping photos constantly. My favourite route from my place to town passes a scenic curve with a beach and sea view. Art galleries are everywhere, locals are friendly, and live bands play frequently. Provincetown has a special energy; I left a part of myself there and still think about it constantly. Summers are busy and vibrant, while fall brings quiet serenity. People freely express themselves through fashion and lifestyle, and nobody judges. This inclusivity made me truly happy.`;

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.INPUT);
  const [inputText, setInputText] = useState(DEFAULT_TEXT);
  const [storyData, setStoryData] = useState<StoryData | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const handleGenerate = async () => {
    if (!inputText.trim()) return;
    
    setAppState(AppState.PROCESSING);
    try {
      const data = await parseStoryFromText(inputText);
      setStoryData(data);
      setAppState(AppState.READING);
      setCurrentPage(0);
    } catch (error) {
      console.error("Failed to generate story", error);
      setAppState(AppState.ERROR);
    }
  };

  const handleReset = () => {
    setAppState(AppState.INPUT);
    setStoryData(null);
    setCurrentPage(0);
  };

  const nextPage = () => {
    if (storyData && currentPage < storyData.chapters.length - 1) {
      setCurrentPage(p => p + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(p => p - 1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 lg:p-8 bg-stone-900 bg-opacity-95 relative overflow-hidden">
        {/* Background texture overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('https://www.transparenttextures.com/patterns/paper.png')]"></div>

      {appState === AppState.INPUT && (
        <div className="w-full max-w-3xl bg-[#fdfbf7] rounded-lg shadow-2xl overflow-hidden z-10 border border-stone-300">
            <div className="bg-amber-900 p-6 flex items-center justify-center space-x-3 text-amber-50 border-b-4 border-amber-950">
                <BookOpen className="w-8 h-8" />
                <h1 className="text-3xl font-serif font-bold">Storybook Weaver</h1>
            </div>
            
            <div className="p-8">
                <div className="mb-6 text-center">
                    <h2 className="text-xl font-serif text-amber-900 mb-2">Turn your memories into a storybook</h2>
                    <p className="text-stone-600">Paste your journal entry, memory, or narrative below. We'll illustrate and narrate it for you.</p>
                </div>

                <textarea 
                    className="w-full h-64 p-4 border border-stone-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-serif bg-stone-50 text-lg custom-scrollbar resize-none shadow-inner"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Once upon a time..."
                />

                <button 
                    onClick={handleGenerate}
                    disabled={!inputText.trim()}
                    className="w-full mt-6 py-4 bg-amber-700 hover:bg-amber-800 text-white font-serif text-xl font-bold rounded-md shadow-lg transform transition hover:-translate-y-1 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Sparkles className="w-5 h-5" />
                    <span>Weave My Story</span>
                </button>
            </div>
        </div>
      )}

      {appState === AppState.PROCESSING && (
         <div className="w-full max-w-4xl aspect-[3/2] bg-[#fdfbf7] rounded-r-2xl rounded-l-sm shadow-2xl z-10 border-r-8 border-b-8 border-stone-800 overflow-hidden">
            <LoadingBook />
         </div>
      )}

      {appState === AppState.READING && storyData && (
        <div className="w-full max-w-6xl z-10 flex flex-col items-center">
             {/* Header/Toolbar */}
            <div className="w-full flex items-center justify-between mb-4 text-amber-50">
                 <h1 className="text-2xl font-serif italic opacity-80">{storyData.title}</h1>
                 <button onClick={handleReset} className="flex items-center space-x-1 hover:text-amber-200 transition">
                     <RotateCcw className="w-4 h-4" />
                     <span>Create New</span>
                 </button>
            </div>

            {/* The Book Container */}
            <div className="relative w-full aspect-[1/1.4] lg:aspect-[2/1] bg-[#fdfbf7] rounded-r-lg rounded-l-sm shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-r-[12px] border-b-[12px] border-stone-800 overflow-hidden flex">
                {/* Page Transition Wrapper */}
                <BookPage 
                    chapter={storyData.chapters[currentPage]} 
                    pageNumber={currentPage + 1} 
                    isActive={true}
                />
                
                {/* Book spine visual for desktop */}
                <div className="absolute left-1/2 top-0 bottom-0 w-12 -ml-6 bg-gradient-to-r from-stone-300 via-stone-100 to-stone-300 opacity-30 hidden lg:block pointer-events-none shadow-inner z-20"></div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between w-full max-w-sm mt-8">
                <button 
                    onClick={prevPage} 
                    disabled={currentPage === 0}
                    className="p-3 rounded-full bg-amber-800 text-amber-100 hover:bg-amber-700 disabled:opacity-30 disabled:cursor-not-allowed transition shadow-lg"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                
                <span className="font-serif text-amber-100 text-lg">
                    {currentPage + 1} / {storyData.chapters.length}
                </span>

                <button 
                    onClick={nextPage} 
                    disabled={currentPage === storyData.chapters.length - 1}
                    className="p-3 rounded-full bg-amber-800 text-amber-100 hover:bg-amber-700 disabled:opacity-30 disabled:cursor-not-allowed transition shadow-lg"
                >
                    <ArrowRight className="w-6 h-6" />
                </button>
            </div>
        </div>
      )}

      {appState === AppState.ERROR && (
           <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-2xl text-center">
               <h3 className="text-2xl text-red-800 font-bold mb-4">Oh no!</h3>
               <p className="text-stone-600 mb-6">Something went wrong while weaving your story. The magic ink might be dry.</p>
               <button onClick={handleReset} className="px-6 py-2 bg-stone-800 text-white rounded hover:bg-stone-700">Try Again</button>
           </div>
      )}
    </div>
  );
}

export default App;