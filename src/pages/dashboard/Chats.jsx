import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  ArchiveBox,
  CircleDashed,
  MagnifyingGlass,
  Users,
} from "phosphor-react";
import { SimpleBarStyle } from "../../components/Scrollbar";
import { useTheme } from "@mui/material/styles";
import useResponsive from "../../hooks/useResponsive";
import BottomNav from "../../layouts/dashboard/BottomNav";
import { ChatList } from "../../data";
import ChatElement from "../../components/ChatElement";
import {
  Search,
  SearchIconWrapper,
  StyledInputBase,
} from "../../components/Search";
import Friends from "../../sections/Dashboard/Friends";
import { socket } from "../../socket";
import { useDispatch, useSelector } from "react-redux";
import { FetchDirectConversations } from "../../redux/slices/conversation";
import Status from "./Status";
import Carousel from "./Carousel";
import Carousels from "./Carousel";

const user_id = window.localStorage.getItem("user_id");

const Chats = () => {
  const theme = useTheme();
  const isDesktop = useResponsive("up", "md");

  const { statuses } = useSelector((state) => state.app.user);

  const dispatch = useDispatch();

  const { conversations } = useSelector(
    (state) => state.conversation.direct_chat
  );
  // Sort conversations by unread count in descending order
  // const sortedConversations = [...conversations].sort((a, b) => b.unread - a.unread);

  useEffect(() => {
    socket.emit(
      "get_direct_conversations",
      { user_id },
      (data, pinnedChats) => {
        console.log(data); // this data is the list of conversations
        // dispatch action

        dispatch(
          FetchDirectConversations({
            conversations: data,
            pinnedChats: pinnedChats,
          })
        );
      }
    );
  }, []);

  const [openDialog, setOpenDialog] = useState(false);

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const [openModal, setOpenModal] = useState(false);

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const [openStatusModal, setOpenStatusModal] = useState(false);

  const handleopenStatusModal = () => {
    handleCloseModal();
    setOpenStatusModal(true);
  };

  const handleCloseStatusModal = () => {
    setOpenStatusModal(false);
  };

  return (
    <>
      <Box
        sx={{
          position: "relative",
          height: "100%",
          width: isDesktop ? 320 : "100vw",
          backgroundColor:
            theme.palette.mode === "light"
              ? "#F8FAFF"
              : theme.palette.background,

          boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)",
        }}
      >
        {/* {!isDesktop && (
          // Bottom Nav
          <BottomNav />
        )} */}

        <Stack p={3} spacing={2} sx={{ maxHeight: "100vh" }}>
          <Stack
            alignItems={"center"}
            justifyContent="space-between"
            direction="row"
          >
            <Typography variant="h5">Chats</Typography>

            <Stack direction={"row"} alignItems="center" spacing={1}>
              <IconButton
                onClick={() => {
                  handleOpenDialog();
                }}
                sx={{ width: "max-content" }}
              >
                <Users />
              </IconButton>
              <IconButton
                sx={{ width: "max-content", position: "relative" }}
                onClick={handleOpenModal}
              >
                <CircleDashed />
                {statuses.length > 0 && (
                  <Tooltip placement="left-end" title="My Status">
                    <div className=" text-sm absolute -top-1 bg-green-500 rounded-full text-black w-5 flex items-center justify-center -left-0 animate-bounce">
                      {statuses.length}
                    </div>
                  </Tooltip>
                )}
              </IconButton>
            </Stack>
          </Stack>
          <Stack sx={{ width: "100%" }}>
            <Search>
              <SearchIconWrapper>
                <MagnifyingGlass color="#709CE6" />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Search…"
                inputProps={{ "aria-label": "search" }}
              />
            </Search>
          </Stack>
          <Stack spacing={1}>
            <Stack direction={"row"} spacing={1.5} alignItems="center">
              <ArchiveBox size={24} />
              <Button variant="text">Archive</Button>
            </Stack>
            <Divider />
          </Stack>
          <Stack sx={{ flexGrow: 1, overflowY: "scroll", height: "100%" }}>
            <SimpleBarStyle timeout={500} clickOnTrack={false}>
              <Stack spacing={2.4}>
                <Typography variant="subtitle2" sx={{ color: "#676667" }}>
                  Pinned
                </Typography>
                {/* Chat List */}
                {conversations
                  .filter((el) => el.pinned)
                  .map((el, idx) => {
                    return <ChatElement {...el} />;
                  })}
                <Typography variant="subtitle2" sx={{ color: "#676667" }}>
                  All Chats
                </Typography>
                {/* Chat List */}
                {conversations
                  .filter((el) => !el.pinned)
                  .map((el, idx) => {
                    return <ChatElement {...el} />;
                  })}
              </Stack>
            </SimpleBarStyle>
          </Stack>
        </Stack>
      </Box>
      {openDialog && (
        <Friends open={openDialog} handleClose={handleCloseDialog} />
      )}
      {openModal && (
        <Status
          openModal={openModal}
          handleCloseModal={handleCloseModal}
          handleopenStatusModal={handleopenStatusModal}
        />
      )}
      {openStatusModal && (
        <Carousels
          openStatusModal={openStatusModal}
          handleCloseStatusModal={handleCloseStatusModal}
          owner={true}
          status={null}
        />
      )}
    </>
  );
};

export default Chats;
