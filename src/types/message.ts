export interface IMessage {
  created_at: string;
  id: string;
  text: string | null;
  user: string;
  users: {
    created_at: string;
    id: string;
    userName: string | null;
  };
}
