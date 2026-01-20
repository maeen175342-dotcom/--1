
export interface Message {
  id?: string;
  sender: string;
  text: string;
  timestamp: number;
  fileUrl?: string;
  fileType?: string;
}

export interface UserSession {
  name: string;
  isAuthenticated: boolean;
}
