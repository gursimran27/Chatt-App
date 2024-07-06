import { createSlice } from "@reduxjs/toolkit";
import { faker } from "@faker-js/faker";
import { useSelector } from "react-redux";
// import { AWS_S3_REGION, S3_BUCKET_NAME } from "../../config";

const user_id = window.localStorage.getItem("user_id");

const initialState = {
  direct_chat: {
    conversations: [],
    current_conversation: null,
    current_messages: [],
    page: 2,
    hasMore: true,
  },
  group_chat: {},
  reply_msg: {
    reply: false,
    replyToMsg: null,
  },
};

const slice = createSlice({
  name: "conversation",
  initialState,
  reducers: {
    fetchDirectConversations(state, action) {
      console.log("hola", action.payload.conversations);
      const pinnedChats = action.payload.pinnedChats;

      const list = action.payload.conversations.map((el) => {
        const user = el.participants.find(
          (elm) => elm._id.toString() !== user_id
        );

        const isPinned = pinnedChats.includes(el._id.toString());

        return {
          id: el._id, //conversationid
          user_id: user?._id, //userid
          name: `${user?.firstName} ${user?.lastName}`,
          online: user?.status === "Online",
          //   img: `https://${S3_BUCKET_NAME}.s3.${AWS_S3_REGION}.amazonaws.com/${user?.avatar}`,
          img:
            user?.avatar ||
            `https://api.dicebear.com/5.x/initials/svg?seed=${user?.firstName} ${user?.lastName}`,
          //   msg: el.messages.slice(-1)[0].text,
          msg: el.messages[el.messages.length - 1].text,
          time: "9:36",
          unread: el?.unreadCount[user_id.toString()] || 0,
          pinned: isPinned,
          about: user?.about || "No Discription",
          email: user?.email,
        };
      });

      state.direct_chat.conversations = list;
    },

    updateDirectConversation(state, action) {
      const this_conversation = action.payload.conversation;
      state.direct_chat.conversations = state.direct_chat.conversations.map(
        (el) => {
          if (el?.id !== this_conversation._id) {
            return el;
          } else {
            const user = this_conversation.participants.find(
              (elm) => elm._id.toString() !== user_id
            );
            return {
              id: this_conversation._id,
              user_id: user?._id, //onetoonemsssage's _id
              name: `${user?.firstName} ${user?.lastName}`,
              online: user?.status === "Online",
              img:
                user?.avatar ||
                `https://api.dicebear.com/5.x/initials/svg?seed=${user?.firstName} ${user?.lastName}`,
              about: user?.about || "No Discription",
              msg: this_conversation.messages[
                this_conversation.messages.length - 1
              ].text,
              time: "9:36",
              unread: el?.unreadCount[user_id.toString()] || 0,
              pinned: false,
              email: user?.email,
            };
          }
        }
      );
    },

    updateDirectConversationForPinnedChat(state, action) {
      const this_conversation_id = action.payload.this_conversation_id;
      state.direct_chat.conversations = state.direct_chat.conversations.map(
        (el) => {
          if (el?.id !== this_conversation_id) {
            return el;
          } else {
            return {
              ...el,
              pinned: action.payload.pinned,
            };
          }
        }
      );
    },

    addDirectConversation(state, action) {
      // PUSH THE NEW RECORD TO CONVERSATIONS
      const this_conversation = action.payload.conversation;
      const user = this_conversation.participants.find(
        (elm) => elm._id.toString() !== user_id
      );
      state.direct_chat.conversations = state.direct_chat.conversations.filter(
        (el) => el?.id !== this_conversation._id
      );
      state.direct_chat.conversations.push({
        id: this_conversation._id,
        user_id: user?._id,
        name: `${user?.firstName} ${user?.lastName}`,
        online: user?.status === "Online",
        img:
          user?.avatar ||
          `https://api.dicebear.com/5.x/initials/svg?seed=${user?.firstName} ${user?.lastName}`,
        about: user?.about || "No Discription",
        msg: user?.text,
        time: "9:36",
        unread: this_conversation?.unreadCount[user_id.toString()] || 0,
        pinned: false,
        email: user?.email,
      });
    },

    setCurrentConversation(state, action) {
      state.direct_chat.current_conversation = action.payload;
    },
    fetchCurrentMessages(state, action) {
      const messages = action.payload.messages;

      messages.reverse();

      const formatted_messages = messages.map((el) => {
        const reaction = el?.reaction;
        let myReaction = null;
        let otherReaction = null;

        Object.keys(reaction).forEach((key) => {
          if (key === user_id.toString()) {
            myReaction = reaction[key];
          } else {
            otherReaction = reaction[key];
          }
        });

        return {
          id: el._id,
          type: "msg",
          subtype: el.type,
          message: el.text,
          incoming: el.to === user_id,
          outgoing: el.from === user_id,
          status: el?.status,
          src: el?.file,
          replyToMsg: el?.replyToMsg,
          star: el?.star[user_id.toString()] || false,
          myReaction: myReaction,
          otherReaction: otherReaction,
        };
      });
      state.direct_chat.current_messages = formatted_messages;
      console.log("file", messages.file);
    },
    fetchCurrentPrvPageMessages(state, action) {
      const messages = action.payload.messages;

      messages.reverse();
      console.log("sd",messages)

      const formatted_messages = messages.map((el) => {
        const reaction = el?.reaction;
        let myReaction = null;
        let otherReaction = null;

        Object.keys(reaction).forEach((key) => {
          if (key === user_id.toString()) {
            myReaction = reaction[key];
          } else {
            otherReaction = reaction[key];
          }
        });

        return {
          id: el._id,
          type: "msg",
          subtype: el.type,
          message: el.text,
          incoming: el.to === user_id,
          outgoing: el.from === user_id,
          status: el?.status,
          src: el?.file,
          replyToMsg: el?.replyToMsg,
          star: el?.star[user_id.toString()] || false,
          myReaction: myReaction,
          otherReaction: otherReaction,
        };
      });
      state.direct_chat.current_messages = [
        ...formatted_messages,
        ...state.direct_chat.current_messages,
      ];
      console.log("file", messages.file);
    },
    addDirectMessage(state, action) {
      state.direct_chat.current_messages.push(action.payload.message);
      console.log(
        "inside addDirect messages",
        state.direct_chat.current_messages
      );
    },
    updateMessagesForStar(state, action) {
      state.direct_chat.current_messages =
        state.direct_chat.current_messages.map((el) => {
          if (el?.id != action.payload.messageId) {
            return el;
          } else {
            return {
              ...el,
              star: action.payload.star,
            };
          }
        });
    },
    updateMessagesForReaction(state, action) {
      const reaction = action.payload.reaction;
      let myReaction = null;
      let otherReaction = null;

      Object.keys(reaction).forEach((key) => {
        if (key === user_id.toString()) {
          myReaction = reaction[key];
        } else {
          otherReaction = reaction[key];
        }
      });
      console.log(myReaction, otherReaction);
      state.direct_chat.current_messages =
        state.direct_chat.current_messages.map((el) => {
          if (el?.id != action.payload.messageId) {
            return el;
          } else {
            return {
              ...el,
              myReaction: myReaction,
              otherReaction: otherReaction,
            };
          }
        });
    },
    updateCurrent_conversationOnlineStatus(state, action) {
      state.direct_chat.current_conversation = {
        ...state.direct_chat.current_conversation,
        online: action.payload.status,
      };
      console.log(
        "current_conversation setting status to  ",
        action.payload.status
      );
    },
    updateConversationOnlineStatus(state, action) {
      state.direct_chat.conversations = state.direct_chat.conversations.map(
        (conversation) =>
          conversation.user_id === action.payload.user_id
            ? { ...conversation, online: action.payload.status }
            : conversation
      );
      console.log("conversations setting status to ", action.payload.status);
    },
    updateConversationUnread(state, action) {
      state.direct_chat.conversations = state.direct_chat.conversations.map(
        (conversation) =>
          conversation.id === action.payload.conversationId
            ? { ...conversation, unread: 0 }
            : conversation
      );
      console.log("conversations setting status to 0");
    },
    updateConversationForNewMessage(state, action) {
      const this_conversation = action.payload.conversation;
      state.direct_chat.conversations = state.direct_chat.conversations.map(
        (el) => {
          if (el?.id !== this_conversation._id) {
            return el;
          } else {
            return {
              ...el,
              msg: this_conversation?.messages?.text,
              unread: this_conversation?.unread,
            };
          }
        }
      );
    },
    clearCurrentMessagesAndCurrentConversation(state, action) {
      console.log("bye......");
      state.direct_chat.current_messages = [];
      state.direct_chat.current_conversation = null;
    },
    updateMessageStatus(state, action) {
      console.log("marking to ", action.payload.status);
      state.direct_chat.current_messages =
        state.direct_chat.current_messages.map((el) => {
          const status = action.payload.status;
          console.log("status", status);
          if (status == "Delivered") {
            if (el.status == "Sent") {
              return {
                ...el,
                status: "Delivered",
              };
            } else {
              return el;
            }
          } else {
            if (el.status == "Sent" || el.status == "Delivered") {
              return {
                ...el,
                status: "Seen",
              };
            } else {
              return el;
            }
          }
        });
    },
    updateReply_msg(state, action) {
      console.log("reply msg");
      state.reply_msg.reply = action.payload.reply;
      state.reply_msg.replyToMsg = action.payload.replyToMsg;
    },
    updatePage(state, action) {
      state.direct_chat.page = action.payload.page;
    },
    updateHasMore(state, action) {
      state.direct_chat.hasMore = action.payload.hasMore;
    },
  },
});

// Reducer
export default slice.reducer;

// ----------------------------------------------------------------------

export const FetchDirectConversations = ({ conversations, pinnedChats }) => {
  return async (dispatch, getState) => {
    dispatch(
      slice.actions.fetchDirectConversations({
        conversations: conversations,
        pinnedChats: pinnedChats,
      })
    );
  };
};
export const AddDirectConversation = ({ conversation }) => {
  return async (dispatch, getState) => {
    dispatch(slice.actions.addDirectConversation({ conversation }));
  };
};
export const UpdateDirectConversation = ({ conversation }) => {
  return async (dispatch, getState) => {
    dispatch(slice.actions.updateDirectConversation({ conversation }));
  };
};
export const UpdateDirectConversationForPinnedChat = ({
  this_conversation_id,
  pinned,
}) => {
  return async (dispatch, getState) => {
    dispatch(
      slice.actions.updateDirectConversationForPinnedChat({
        this_conversation_id: this_conversation_id,
        pinned: pinned,
      })
    );
  };
};

export const SetCurrentConversation = (current_conversation) => {
  return async (dispatch, getState) => {
    dispatch(slice.actions.setCurrentConversation(current_conversation));
  };
};

export const FetchCurrentMessages = ({ messages }) => {
  return async (dispatch, getState) => {
    dispatch(slice.actions.fetchCurrentMessages({ messages }));
  };
};
export const FetchCurrentPrvPageMessages = ({ messages }) => {
  return async (dispatch, getState) => {
    dispatch(slice.actions.fetchCurrentPrvPageMessages({ messages }));
  };
};

export const AddDirectMessage = (message) => {
  return async (dispatch, getState) => {
    await dispatch(slice.actions.addDirectMessage({ message }));
  };
};

export const UpdateCurrent_conversationOnlineStatus = ({ status }) => {
  return async (dispatch, getState) => {
    dispatch(
      slice.actions.updateCurrent_conversationOnlineStatus({ status: status })
    );
  };
};

export const UpdateConversationOnlineStatus = ({ status, user_id }) => {
  return async (dispatch, getState) => {
    dispatch(
      slice.actions.updateConversationOnlineStatus({
        status: status,
        user_id: user_id,
      })
    );
  };
};
export const UpdateConversationUnread = ({ status, conversationId }) => {
  return async (dispatch, getState) => {
    dispatch(
      slice.actions.updateConversationUnread({
        conversationId: conversationId,
      })
    );
  };
};

export const UpdateConversationForNewMessage = ({ conversation }) => {
  return async (dispatch, getState) => {
    dispatch(
      slice.actions.updateConversationForNewMessage({
        conversation: conversation,
      })
    );
  };
};

export const ClearCurrentMessagesAndCurrentConversation = () => {
  return async (dispatch, getState) => {
    dispatch(slice.actions.clearCurrentMessagesAndCurrentConversation());
  };
};

export const UpdateMessageStatus = ({ status }) => {
  return async (dispatch, getState) => {
    dispatch(slice.actions.updateMessageStatus({ status: status }));
  };
};
export const UpdateReply_msg = ({ reply, replyToMsg }) => {
  return async (dispatch, getState) => {
    dispatch(
      slice.actions.updateReply_msg({ reply: reply, replyToMsg: replyToMsg })
    );
  };
};
export const UpdateMessagesForStar = ({ messageId, star }) => {
  return async (dispatch, getState) => {
    dispatch(
      slice.actions.updateMessagesForStar({ messageId: messageId, star: star })
    );
  };
};
export const UpdateMessagesForReaction = ({ messageId, reaction }) => {
  return async (dispatch, getState) => {
    dispatch(
      slice.actions.updateMessagesForReaction({
        messageId: messageId,
        reaction: reaction,
      })
    );
  };
};

export const UpdatePage = ({ page }) => {
  return async (dispatch, getState) => {
    dispatch(
      slice.actions.updatePage({
        page: page,
      })
    );
  };
};


export const UpdateHasMore = ({ hasMore }) => {
  return async (dispatch, getState) => {
    dispatch(
      slice.actions.updateHasMore({
        hasMore: hasMore,
      })
    );
  };
};
