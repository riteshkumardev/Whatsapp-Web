// ===============================
// SOCKET SERVER
// ===============================

let onlineUsers = [];

/**
 * Socket handler
 * @param {Server} io - socket.io instance
 */
export default function socketHandler(io) {

  // ===============================
  // SOCKET CONNECTION
  // ===============================
  io.on("connection", (socket) => {
    console.log("🟢 New socket connected:", socket.id);

    /* =========================
       USER JOIN
    ========================== */
    socket.on("join", (userId) => {
      try {
        if (!userId) return;

        // join personal room
        socket.join(userId);

        // remove old socket of same user (page refresh / multi-tab)
        onlineUsers = onlineUsers.filter(
          (u) => u.userId !== userId
        );

        // add fresh socket
        onlineUsers.push({
          userId,
          socketId: socket.id,
        });

        // send updated online users list
        io.emit("get-online-users", onlineUsers);

        // send socket id only to this user
        socket.emit("setup socket", socket.id);

        console.log("✅ User joined:", userId);
      } catch (error) {
        console.error("JOIN ERROR:", error);
      }
    });

    /* =========================
       DISCONNECT
    ========================== */
    socket.on("disconnect", () => {
      try {
        onlineUsers = onlineUsers.filter(
          (u) => u.socketId !== socket.id
        );

        io.emit("get-online-users", onlineUsers);

        console.log("🔴 Socket disconnected:", socket.id);
      } catch (error) {
        console.error("DISCONNECT ERROR:", error);
      }
    });

    /* =========================
       JOIN CONVERSATION
    ========================== */
    socket.on("join conversation", (conversationId) => {
      if (!conversationId) return;

      socket.join(conversationId);
      console.log("📥 Joined conversation:", conversationId);
    });

    /* =========================
       SEND MESSAGE
    ========================== */
    socket.on("send message", (message) => {
      try {
        const conversation = message?.conversation;
        if (!conversation?.users) return;

        conversation.users.forEach((user) => {
          if (user._id === message.sender?._id) return;

          socket.to(user._id).emit("receive message", message);
        });
      } catch (error) {
        console.error("SEND MESSAGE ERROR:", error);
      }
    });

    /* =========================
       TYPING EVENTS
    ========================== */
    socket.on("typing", (conversationId) => {
      if (!conversationId) return;

      socket.to(conversationId).emit("typing");
    });

    socket.on("stop typing", (conversationId) => {
      if (!conversationId) return;

      socket.to(conversationId).emit("stop typing");
    });

    /* =========================
       CALL USER
    ========================== */
    socket.on("call user", (data) => {
      try {
        if (!data?.userToCall) return;

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
      } catch (error) {
        console.error("CALL USER ERROR:", error);
      }
    });

    /* =========================
       ANSWER CALL
    ========================== */
    socket.on("answer call", (data) => {
      if (!data?.to || !data?.signal) return;

      io.to(data.to).emit("call accepted", data.signal);
    });

    /* =========================
       END CALL
    ========================== */
    socket.on("end call", (socketId) => {
      if (!socketId) return;

      io.to(socketId).emit("end call");
    });
  });
}
