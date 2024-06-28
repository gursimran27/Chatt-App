import {
  Box,
  Fab,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
} from "@mui/material";
import {
  Camera,
  File,
  Image,
  LinkSimple,
  PaperPlaneTilt,
  Smiley,
  Sticker,
  UploadSimple,
  User,
} from "phosphor-react";
import { useTheme, styled } from "@mui/material/styles";
import React, { useEffect, useRef, useState } from "react";
import useResponsive from "../../hooks/useResponsive";

import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { socket } from "../../socket";
import { useSelector } from "react-redux";

const StyledInput = styled(TextField)(({ theme }) => ({
  "& .MuiInputBase-input": {
    paddingTop: "12px !important",
    paddingBottom: "12px !important",
  },
}));

const Actions = [
  {
    color: "#4da5fe",
    icon: <Image size={24} />,
    y: 102,
    title: "Photo/Video",
  },
  {
    color: "#1b8cfe",
    icon: <Sticker size={24} />,
    y: 172,
    title: "Stickers",
  },
  {
    color: "#0172e4",
    icon: <Camera size={24} />,
    y: 242,
    title: "Image",
  },
  {
    color: "#0159b2",
    icon: <File size={24} />,
    y: 312,
    title: "Document",
  },
  {
    color: "#013f7f",
    icon: <User size={24} />,
    y: 382,
    title: "Contact",
  },
];

const ChatInput = ({
  openPicker,
  setOpenPicker,
  setValue,
  value,
  inputRef,
}) => {
  const [openActions, setOpenActions] = React.useState(false);
  const theme = useTheme();
  const { current_conversation } = useSelector(
    (state) => state.conversation.direct_chat
  );
  const user_id = window.localStorage.getItem("user_id");
  const { room_id } = useSelector((state) => state.app);

  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null); // to store the uploaded file-obj
  const [previewSource, setPreviewSource] = useState(null); // to store the dataURL representation of uploaded file obj

  const fileInputRef = useRef(null); //to access the hidden <input> field

  const handleClick = () => {
    fileInputRef.current.click(); //makes a click on hidden input field
    setOpenActions(!openActions);
  };

  //   fetch the file from input tag and set it in imageFile and call the previewFile func to convert file obj into a dataURL string format so that is can be used in img tag
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    // console.log(file)
    if (file) {
      setImageFile(file);
      previewFile(file);
    }
  };

  //  this function accepets the file obj and convert it into a dataURL string form(which can be used in HTML in img tag) and then store dataURL string in previewSource
  const previewFile = (file) => {
    const reader = new FileReader(); // initiate a reader constructor
    reader.readAsDataURL(file); //convert to dataURl string format
    reader.onloadend = () => {
      // after converting this is executed
      setPreviewSource(reader.result); //store the dataURL format of file-obj in  previewSource
    };
  };

  const handleFileUpload = () => {
    console.log(imageFile, previewFile);
    try {
      if (imageFile == null) return;
      console.log("uploading...");
      setLoading(true);
      // const formData = new FormData(); //used to gather form data from HTML forms.
      // if(imageFile){
      //   formData.append("file", imageFile); // make a key-value pair so to send it in form-data section of request
      // }
      // // formData.append('message', message);
      // formData.append('to', current_conversation?.user_id);
      // formData.append('from', user_id);
      // formData.append('conversation_id', room_id);
      // formData.append('type', "img");

      // for (let pair of formData.entries()) {
      //   console.log(pair[0] + ', ' + pair[1]);
      // }

      if (imageFile) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const buffer = event.target.result;
          socket.emit(
            "file_message",
            {
              data: buffer,
              name: imageFile.name,
              to: current_conversation?.user_id,
              from: user_id,
              conversation_id: room_id,
              type: "img",
            },
            (response) => {
              if (response.success) {
                console.log("File uploaded successfully:", response.url);
              } else {
                console.error("File upload failed:", response.error);
              }
            }
          );
        };
        reader.readAsArrayBuffer(imageFile);
      }

      setPreviewSource(null);
      setImageFile(null);
      setLoading(false);
    } catch (error) {
      console.log("ERROR MESSAGE - ", error.message);
    }
  };

  useEffect(() => {
    if (imageFile) {
      previewFile(imageFile);
    }
  }, [imageFile]);

  return (
    <Box sx={{ position: "relative" }}>
      <StyledInput
        inputRef={inputRef}
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
        }}
        // disabled= {openActions?true:false}

        fullWidth
        placeholder="Write a message..."
        variant="filled"
        InputProps={{
          disableUnderline: true,
          startAdornment: (
            <Stack sx={{ width: "max-content" }}>
              <Stack
                sx={{
                  position: "relative",
                  display: openActions ? "inline-block" : "none",
                }}
              >
                {Actions.map((el) => (
                  <Tooltip placement="right" title={el.title}>
                    <Fab
                      onClick={handleClick}
                      sx={{
                        position: "absolute",
                        top: -el.y,
                        backgroundColor: el.color,
                      }}
                      aria-label="add"
                    >
                      {el.icon}
                    </Fab>
                  </Tooltip>
                ))}
              </Stack>

              <InputAdornment>
                <IconButton
                  onClick={() => {
                    setOpenActions(!openActions);
                  }}
                >
                  <LinkSimple />
                </IconButton>
              </InputAdornment>
            </Stack>
          ),
          endAdornment: (
            <Stack sx={{ position: "relative" }}>
              <InputAdornment>
                <IconButton
                  onClick={() => {
                    setOpenPicker(!openPicker);
                  }}
                >
                  <Smiley />
                </IconButton>
              </InputAdornment>
            </Stack>
          ),
        }}
      />
      <input
        type="file"
        ref={fileInputRef} //!NOTE
        onChange={handleFileChange}
        style={{ display: "none" }} // Inline style to hide the element
        // accept="image/png, image/gif, image/jpeg"
      />
      <Box
        sx={{
          display: previewSource ? "block" : "none", // Conditionally set display
          color: "red", // Text color
          width: "550px", // Width of the box
          height: "430px", // Height of the box
          border: "1px solid black", // Border style
          position: "absolute",
          top: "-450px",
        }}
      >
        <img
          src={previewSource}
          // src="https://images.unsplash.com/photo-1502657877623-f66bf489d236?auto=format&fit=crop&w=800"
          style={{ objectFit: "cover" }}
          width={550}
          height={366}
        />

        <Stack
          direction={"row"}
          justifyContent={"space-between"}
          sx={{
            height: 45,
            width: 100,
            backgroundColor: theme.palette.primary.main,
            borderRadius: 1.5,
            marginTop: "10px",
            color: "#fff",
          }}
        >
          <IconButton onClick={handleFileUpload} sx={{ color: "#fff" }}>
            {!loading ? "Send" : "Sending..."}
            {!loading && <UploadSimple size={32} />}
          </IconButton>
        </Stack>
      </Box>
    </Box>
  );
};

function linkify(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(
    urlRegex,
    (url) => `<a href="${url}" target="_blank">${url}</a>`
  );
}

function containsUrl(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return urlRegex.test(text);
}

const Footer = () => {
  const theme = useTheme();

  const { current_conversation } = useSelector(
    (state) => state.conversation.direct_chat
  );

  const user_id = window.localStorage.getItem("user_id");

  const isMobile = useResponsive("between", "md", "xs", "sm");

  const { sideBar, room_id } = useSelector((state) => state.app);

  const [openPicker, setOpenPicker] = React.useState(false);

  const [value, setValue] = useState("");
  const inputRef = useRef(null);

  function handleEmojiClick(emoji) {
    const input = inputRef.current;

    if (input) {
      const selectionStart = input.selectionStart;
      const selectionEnd = input.selectionEnd;

      setValue(
        value.substring(0, selectionStart) +
          emoji +
          value.substring(selectionEnd)
      );

      // Move the cursor to the end of the inserted emoji
      input.selectionStart = input.selectionEnd = selectionStart + 1;
    }
  }

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === "Enter" && value !== "") {
        // Trigger button click event
        document.getElementById("sendButton").click();
      }
    };

    const inputElement = inputRef.current; //when the room_id is set to null then this component is unmount so the <chatElement/> is not rendered so the ref of it is also not there

    // Attach event listener to listen for 'Enter' key press
    if (inputElement) {
      inputElement.addEventListener("keydown", handleKeyPress);
    }

    return () => {
      // Clean up event listener on component unmount
      if (inputElement) {
        inputElement.removeEventListener("keydown", handleKeyPress);
      }
    };
  }, [value]);

  return (
    <Box
      sx={{
        position: "relative",
        backgroundColor: "transparent !important",
      }}
    >
      <Box
        p={isMobile ? 1 : 2}
        width={"100%"}
        sx={{
          backgroundColor:
            theme.palette.mode === "light"
              ? "#F8FAFF"
              : theme.palette.background,
          boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)",
        }}
      >
        <Stack direction="row" alignItems={"center"} spacing={isMobile ? 1 : 3}>
          <Stack sx={{ width: "100%" }}>
            <Box
              style={{
                zIndex: 10,
                position: "fixed",
                display: openPicker ? "inline" : "none",
                bottom: 81,
                right: isMobile ? 20 : sideBar.open ? 420 : 100,
              }}
            >
              <Picker
                theme={theme.palette.mode}
                data={data}
                onEmojiSelect={(emoji) => {
                  handleEmojiClick(emoji.native);
                }}
              />
            </Box>
            {/* Chat Input */}
            <ChatInput
              inputRef={inputRef}
              value={value}
              setValue={setValue}
              openPicker={openPicker}
              setOpenPicker={setOpenPicker}
            />
          </Stack>
          <Box
            sx={{
              height: 48,
              width: 48,
              backgroundColor:
                value == "" ? "#899" : theme.palette.primary.main,
              borderRadius: 1.5,
            }}
          >
            <Stack
              sx={{ height: "100%" }}
              alignItems={"center"}
              justifyContent="center"
            >
              <IconButton
                id="sendButton"
                disabled={value == ""}
                onClick={() => {
                  if (value == "") return;
                  console.log("clicked...");
                  socket.emit("text_message", {
                    message: linkify(value),
                    conversation_id: room_id,
                    from: user_id,
                    to: current_conversation?.user_id,
                    type: containsUrl(value) ? "Link" : "Text",
                  });
                  setValue("");
                }}
              >
                <PaperPlaneTilt color="#ffffff" />
              </IconButton>
            </Stack>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};

export default Footer;
