

import { useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
} from "@/components/ui/sheet";

import { chatUserAtom } from "../recoil/atoms/chatSheetAtom";


import {chatSheetAtom} from "../recoil/atoms/chatSheetAtom";
import {chatSheetToggle} from "../recoil/selectors/chatSheetSelector";
import { useRecoilState, useRecoilValue } from 'recoil';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Chat from "./chat/Chat";

export default function ChatScreen() {
//   const [open, setOpen] = useState(true)
  const [toggleChatSheet,setToggleChatSheet] = useRecoilState(chatSheetAtom);
  const toggleChatSheetValue = useRecoilValue(chatSheetToggle);
  const [showChat,showChatToggle] = useState(false);
  const user = useRecoilValue(chatUserAtom);
//   const openSheet = () => {
//     setOpen(true)
//   }

  return (
    <div>
      <Sheet open={toggleChatSheetValue} onOpenChange={setToggleChatSheet}>
        <SheetContent>
        {
          showChat? <Chat></Chat>:<div>
          <SheetHeader>
            <SheetDescription>
            <Avatar className="h-72 w-72 ml-10">
                <AvatarImage src={user.image_url}/>
                <AvatarFallback>{user.name}</AvatarFallback>
            </Avatar>
            </SheetDescription>
          </SheetHeader>
        
          <div className="grid gap-4 py-4">
            <div className="items-center gap-4 text-center text-3xl">
              {user.name}
            </div>
            <div className="items-center gap-2">
             {user.description}
            </div>
          </div>
          <SheetFooter className="mt-10 grid grid-cols-1 ml-40">
            
            <button className="h-90 w-90 hover:cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6" onClick={() => {
                            showChatToggle(true);
                        }}>
            <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 0 0-1.032-.211 50.89 50.89 0 0 0-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 0 0 2.433 3.984L7.28 21.53A.75.75 0 0 1 6 21v-4.03a48.527 48.527 0 0 1-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979Z" />
            <path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 0 0 1.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0 0 15.75 7.5Z" />
            </svg>

            </button>

        
           
          </SheetFooter>
          </div>
          }
        </SheetContent>
      </Sheet>
    </div>
  )
}
