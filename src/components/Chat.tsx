import { useEffect, useRef, useState } from "react";
import supabase from "../supabaseClient";
import { userStore } from "../store/store";
import Message from "./Message";
import { IMessage } from "../types/message";
import styled from "styled-components";
import { useAutoAnimate } from "@formkit/auto-animate/react";

const ChatBox = styled.div``;
const TextBox = styled.div``;

interface ChatProps {
  className: string;
}

const Chat: React.FC<ChatProps> = ({ className }) => {
  const [animationParent] = useAutoAnimate();
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<IMessage[]>([]);

  const { currentUser } = userStore();

  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    const { error } = await supabase
      .from("messages")
      .insert([{ text: newMessage, user: currentUser?.user.id }])
      .select();

    if (error) {
      throw new Error(error.message);
    }
    setNewMessage("");
  };

  const fetchMessages = async () => {
    let { data, error } = await supabase
      .from("messages")
      .select(`*, users (*)`)
      .order("created_at")
      .limit(50);

    if (error) {
      throw new Error(error.message);
    }
    if (data) {
      setMessages(data as IMessage[]);
    }
  };

  useEffect(() => {
    fetchMessages();
    const messagesChannel = supabase
      .channel("messagesChannel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        async (payload) => {
          const { eventType } = payload;
          if (eventType === "INSERT") {
            const newMessage: IMessage = payload.new as IMessage;
            // Need to get user details first before pusing the new message
            const { data, error } = await supabase
              .from("users")
              .select("*")
              .eq("id", newMessage.user)
              .limit(1)
              .single();
            if (!data || error) {
              throw new Error(error.message);
            } else {
              newMessage.users = data;
            }
            setMessages((prev) => [...prev, newMessage]);
          }
          if (eventType === "DELETE") {
            console.log("### DELETE", payload);
            setMessages((prev) =>
              prev.filter((message) => message.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      const unSub = async () => {
        await messagesChannel.unsubscribe();
      };
      unSub();
    };
  }, []);

  return (
    <div className={className}>
      <ChatBox
        ref={animationParent}
        className="messages px-4 rounded-xl border overflow-scroll no-scrollbar"
      >
        {messages.map((message) => (
          <Message message={message} key={message.id} />
        ))}
        <div ref={messagesEndRef} />
      </ChatBox>
      <TextBox>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="mt-4 flex"
        >
          <input
            disabled={!currentUser}
            placeholder={
              currentUser
                ? `Message as ${currentUser.user.user_metadata.display_name}`
                : "Login to send messages"
            }
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="textarea textarea-bordered flex-grow mr-2"
          />

          <button
            type="submit"
            className="btn btn-primary text-2xl"
            disabled={!currentUser}
          >
            💬
          </button>
        </form>
      </TextBox>
    </div>
  );
};

export default Chat;
