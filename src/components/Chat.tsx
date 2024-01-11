import { useEffect, useState } from "react";
import supabase from "../supabaseClient";
import { userStore } from "../store/store";

const Chat = () => {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);

  const { currentUser } = userStore();

  const sendMessage = async () => {
    const { error } = await supabase
      .from('messages')
      .insert([
        { text: newMessage, user: currentUser?.user.id },
      ])
      .select()

    if (error) {
      throw new Error(error.message)
    }
    setNewMessage('')
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
      setMessages(data);
      console.log(data)
    }
  };

  useEffect(() => {
    fetchMessages();
    const messagesChannel = supabase
      .channel("messagesChannel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        (payload) => {
          console.log("Change received!", payload);
          const { eventType } = payload;
          if (eventType === "INSERT") setMessages((prev) => [...prev, payload.new]);
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
    <>
      <div>
        The Chat Box!
        {messages.map((message) => (
          <p key={message.id}>{message.text} ~ by {message.users.userName}</p>
        ))}
      </div>
      <div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="mt-4 flex"
        >
          <input
            disabled={!currentUser}
            placeholder={currentUser
              ? `Message as ${currentUser.user.user_metadata.display_name}`
              : "Login to send messages"}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="textarea textarea-bordered flex-grow mr-2"
          />

          <button
            type="submit"
            className="btn btn-secondary text-2xl"
            disabled={!currentUser}>💬</button>
        </form>
      </div>
    </>
  );
};

export default Chat;
