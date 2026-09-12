export interface Chat {
  id: string;
  jid: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  phoneNumber: string;
  dbChatId: string; 
  unreadCount?: number; 
  profilePicUrl?: string; 
  chatStatus?: string;
}

export interface Message {
  msgId: string;
  chatId: string;
  fromMe: boolean;
  text?: string;
  timestamp: number;
  type: string;
  status?: 'sent' | 'delivered' | 'read' | 'error' | 'pending';
  media?: {
    url: string;
    mimetype?: string;
    caption?: string;
    fileName?: string;
  };
}