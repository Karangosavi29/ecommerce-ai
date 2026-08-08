import { useEffect, useState } from "react";
import { Bot, X, Sparkles } from "lucide-react";
import AIProductAssistant from "@/components/ai/AIProductAssistant";

const AIAssistantLauncher = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [openChat, setOpenChat] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPopup(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Small welcome popup */}
      {showPopup && !openChat && (
        <div className="
          fixed bottom-24 right-6 z-50
          w-72 rounded-2xl
          border bg-white
          p-4 shadow-xl
          animate-in fade-in slide-in-from-bottom-5
        ">
          <button
            onClick={() => setShowPopup(false)}
            className="absolute right-3 top-3 text-gray-400"
          >
            <X size={16}/>
          </button>

          <div className="flex gap-3">

            <div className="
              flex h-10 w-10
              items-center justify-center
              rounded-full bg-primary
            ">
              <Sparkles className="text-white"/>
            </div>


            <div>
              <h3 className="font-semibold">
                Need help choosing?
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                I can help you find TVs,
                mobiles, laptops and appliances.
              </p>
            </div>

          </div>


          <button
            onClick={()=>{
              setOpenChat(true);
              setShowPopup(false);
            }}
            className="
              mt-4 w-full
              rounded-full
              bg-primary
              py-2
              text-sm
              font-medium
              text-white
            "
          >
            🤖 Start Chat
          </button>

        </div>
      )}


      {/* Floating AI Button */}
      {!openChat && (
        <button
          onClick={()=>setOpenChat(true)}
          className="
            fixed bottom-6 right-6 z-50
            flex h-16 w-16
            items-center justify-center
            rounded-full
            bg-primary
            text-white
            shadow-xl
            hover:scale-105
            transition
          "
        >
          <Sparkles size={28}/>
        </button>
      )}



      {/* Chat Window */}
      {openChat && (
        <div
          className="
          fixed bottom-6 right-6
          z-50
          "
        >
          <button
            onClick={()=>setOpenChat(false)}
            className="
              absolute
              -right-2
              -top-3
              rounded-full
              bg-white
              shadow
              h-8 w-8
              flex items-center justify-center
            "
          >
            <X size={18}/>
          </button>


          <AIProductAssistant/>

        </div>
      )}

    </>
  );
};


export default AIAssistantLauncher;