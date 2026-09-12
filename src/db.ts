import Dexie, { Table } from 'dexie';
import { Message, Chat } from './types';

export class MySubClassedDexie extends Dexie {
  messages!: Table<Message>; 
  chats!: Table<Chat>;

  constructor() {
    super('sistemacrm');
    
    this.version(3).stores({
      messages: 'msgId, chatId',
      chats: '&jid, unreadCount, chatStatus' 
    });

    this.version(2).stores({
        messages: 'msgId, chatId',
        chats: '&jid, unreadCount'
    });
  }
}

export const db = new MySubClassedDexie();