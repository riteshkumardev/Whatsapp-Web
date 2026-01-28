let onlineUsers = [];

export default function (socket, io) {

  // user joins
  socket.on("join", (userId) => {
    if (!userId) return;

    socket.join(userId);

    // remove old socket of same user (important)
    onlineUsers = onlineUsers.filter(
      (u) => u.userId !== userId
    );

    // add fresh socket
    onlineUsers.push({
      userId,
      socketId: socket.id,
    });

    io.emit("get-online-users", onlineUsers);
    socket.emit("setup socket", socket.id); // only to this user
  });

  // disconnect
  socket.on("disconnect", () => {
    onlineUsers = onlineUsers.filter(
      (u) => u.socketId !== socket.id
    );
    io.emit("get-online-users", onlineUsers);
  });

  // join conversation room
  socket.on("join conversation", (conversationId) => {
    if (!conversationId) return;
    socket.join(conversationId);
  });

  // send message
  socket.on("send message", (message) => {
    const conversation = message?.conversation;
    if (!conversation?.users) return;

    conversation.users.forEach((user) => {
      if (user._id === message.sender._id) return;
      socket.to(user._id).emit("receive message", message);
    });
  });

  // typing
  socket.on("typing", (conversationId) => {
    socket.to(conversationId).emit("typing");
  });

  socket.on("stop typing", (conversationId) => {
    socket.to(conversationId).emit("stop typing");
  });

  // call user
  socket.on("call user", (data) => {
    const userSocket = onlineUsers.find(
      (u) => u.userId === data.userToCall
    );

    if (!userSocket) {
      socket.emit("user offline");
      return;
    }

    io.to(userSocket.socketId).emit("call user", {
      signal: data.signal,
      from: data.from,
      name: data.name,
      picture: data.picture,
    });
  });

  // answer call
  socket.on("answer call", (data) => {
    if (!data?.to) return;
    io.to(data.to).emit("call accepted", data.signal);
  });

  // end call
  socket.on("end call", (socketId) => {
    if (!socketId) return;
    io.to(socketId).emit("end call");
  });
}
