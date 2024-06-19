import styles from "./Message.module.css";
import { MessageProps } from "../types/messageTypes";

const Message: React.FC<MessageProps> = ({ msg, type }) => {
  return (
    <div className={`${styles.message} ${styles[type]}`}>
      <p>{msg}</p>
    </div>
  );
};

export default Message;
