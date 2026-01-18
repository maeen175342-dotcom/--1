
export interface Message {
  id?: string;
  sender: string;
  text: string;
  timestamp: number;
}

export interface UserSession {
  name: string;
  isAuthenticated: boolean;
}
