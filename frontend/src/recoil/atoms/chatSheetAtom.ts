import { atom } from 'recoil';


interface chatUser{
  image_url:string,
  audio:string,
  name:string
  description:string
}
export const chatSheetAtom = atom({
  key: 'chatSheetAtom',
  default: false,
});

export const chatUserAtom = atom<chatUser>({
  key: 'chatUserAtom',
  default:{image_url:"",audio:"",name:"",description:""}
})