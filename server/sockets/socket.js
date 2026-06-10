const socketIO = (io) => {
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("joinRoom", (classroomId) => {
      socket.join(classroomId);
      console.log(`Socket ${socket.id} joined room ${classroomId}`);
    });

    socket.on("leaveRoom", (classroomId) => {
      socket.leave(classroomId);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
};

module.exports = socketIO;
