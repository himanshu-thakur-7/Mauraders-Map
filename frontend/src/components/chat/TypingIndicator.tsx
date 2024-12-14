import { chatUserAtom } from "@/recoil/atoms/chatSheetAtom";
import { useRecoilValue } from "recoil";

interface TypingIndicatorProps {
  sender: 'user' | 'ai';
}

export function TypingIndicator({ sender }: TypingIndicatorProps) {
  const isAI = sender === 'ai';
  const user = useRecoilValue(chatUserAtom);
  
  return (
    <div className={`flex items-start gap-2 mt-4 ${isAI ? '' : 'justify-end'}`}>
      {isAI && (
        <img
          src={user.image_url}
          alt={user.name[0]}
          className="w-8 h-8 rounded-full"
        />
      )}
      
      <div className={`flex flex-col ${isAI ? '' : 'items-end'}`}>
        <div className={`rounded-lg p-2 ${
          isAI ? 'bg-gray-100' : 'bg-blue-500'
        }`}>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  isAI ? 'bg-gray-400' : 'bg-white'
                } animate-bounce`}
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '0.8s'
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {!isAI && (
        <img
          src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=64&h=64&fit=crop"
          alt="User Avatar"
          className="w-8 h-8 rounded-full"
        />
      )}
    </div>
  );
}