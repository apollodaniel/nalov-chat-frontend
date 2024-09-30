import { Message, PositionOffset } from "../utils/types";

interface IProps {
  msg: Message;
  chat_id: string;
  onFocusExit: () => void;
  onEdit: (msg: Message) => void;
  onDelete: (msg: Message) => void;
  onShowInfo: (msg: Message) => void;
  position_offset?: PositionOffset;
}

interface ContextMenuItemProps {
  name: string;
  event_callback: () => void;
  className?: string;
}

function ContextMenuItem({
  name,
  event_callback,
  className,
}: ContextMenuItemProps) {
  return (
    <li
      className={`list-group-item list-group-item-action ${className || ""}`}
      style={{
        cursor: "pointer",
      }}
      onClick={() => event_callback()}
    >
      {name}
    </li>
  );
}

function MessageContextMenu({
  msg,
  chat_id,
  onFocusExit,
  onDelete,
  onShowInfo,
  onEdit,
  position_offset,
}: IProps) {
  return (
    <ul
      className="card  w-100 position-absolute rounded-3 list-group" // ${chat_id === msg.sender_id ? "align-self-start mx-3" : "align-self-end mx-3"}`}
      onBlur={() => onFocusExit()}
      onMouseDown={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
      style={{
        maxWidth: "250px",
        zIndex: "10",
        top: `${position_offset?.offset_top || 0}px`,
        left: `${position_offset?.offset_left || 0}px`,
      }}
    >
      {msg.sender_id != chat_id && (
        <div>
          <ContextMenuItem
            name="Edit"
            event_callback={() => onEdit(msg)}
            className="rounded-top-3"
          />
          <ContextMenuItem name="Delete" event_callback={() => onDelete(msg)} />
        </div>
      )}
      <ContextMenuItem
        name="Show message information"
        event_callback={() => onShowInfo(msg)}
      />
    </ul>
  );
}

export default MessageContextMenu;
