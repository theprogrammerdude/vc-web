const socket = io("/");
const peer = new Peer(undefined, {
  host: "/",
  port: "5000",
});

const peers = {};

const videoGrid = document.getElementById("video-grid");
const video = document.createElement("video");
video.muted = true;

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    streamVideo(video, stream);

    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });

    peer.on("call", (call) => {
      call.answer(stream);
      const v = document.createElement("video");

      call.on("stream", (userStream) => {
        streamVideo(v, userStream);
      });
    });
  });

socket.on("user-disconnected", (userId) => {
  if (peers[userId]) peers[userId].close();
});

peer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
});

streamVideo = (v, s) => {
  v.srcObject = s;
  v.addEventListener("loadedmetadata", () => {
    v.play();
  });

  videoGrid.append(v);
};

connectToNewUser = (userId, stream) => {
  const call = peer.call(userId, stream);
  const v = document.createElement("video");

  peers[userId] = call;

  call.on("stream", (userStream) => {
    streamVideo(v, userStream);
  });

  call.on("close", () => {
    v.remove();
  });
};
