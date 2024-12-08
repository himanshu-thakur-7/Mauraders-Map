

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";


import {chatSheetAtom} from "../recoil/atoms/chatSheetAtom";
import {chatSheetToggle} from "../recoil/selectors/chatSheetSelector";
import { useRecoilState, useRecoilValue } from 'recoil';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function ChatScreen() {
//   const [open, setOpen] = useState(true)
  const [toggleChatSheet,setToggleChatSheet] = useRecoilState(chatSheetAtom);
  const toggleChatSheetValue = useRecoilValue(chatSheetToggle);

//   const openSheet = () => {
//     setOpen(true)
//   }

  return (
    <div>
      <Sheet open={toggleChatSheetValue} onOpenChange={setToggleChatSheet}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Chat</SheetTitle>
            <SheetDescription>
            <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" defaultValue="Pedro Duarte" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <Input id="username" defaultValue="@peduarte" className="col-span-3" />
            </div>
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <Button type="submit">Save changes</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
