const joinRoom = (socket, roomId) => {
  if (!roomId) return;
  socket.join(roomId);
};

const leaveRoom = (socket, roomId) => {
  if (!roomId) return;
  socket.leave(roomId);
};

export { joinRoom, leaveRoom };
