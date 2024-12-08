import { selector } from 'recoil';
import { chatSheetAtom } from '../atoms/chatSheetAtom';

export const chatSheetToggle = selector({
  key: 'chatSheetToggle',
  get: ({ get }) => {
    const openChatSheet = get(chatSheetAtom);
    return openChatSheet;
  },
});