import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { userStore } from "../store/store";
import { IMessage } from "../types/message";

dayjs.extend(relativeTime);

const Message = ({ message }: { message: IMessage }) => {
  const { currentUser } = userStore()
  return (
    <div
      className={`chat py-4 ${message.users.id === currentUser?.user?.id
        ? "chat-end"
        : "chat-start"
        }`}
    >
      <div className="chat-image avatar">
        <div className="w-16 rounded-full border-2 border-neutral">
          <img
            src={`https://api.dicebear.com/7.x/notionists/svg?seed=${message.users.id
              }a&scale=150${message.users.id === currentUser?.user?.id ? "&flip=true" : ""
              }`}
            alt="avatar"
            className="mt-1"
          />
        </div>
      </div>
      <div className="chat-header self-end pb-2 font-black">
        @{message.users.userName}
        <time className="text-xs opacity-70 font-normal">
          - {dayjs(message.created_at).fromNow()}
        </time>
      </div>
      <div
        className={`chat-bubble ${message.users.id === currentUser?.user?.id
          ? "chat-bubble-secondary"
          : ""
          }`}
      >
        {message.text}
      </div>
    </div>
  );
};

export default Message;
