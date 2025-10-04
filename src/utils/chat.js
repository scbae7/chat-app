export const goToDM = async ({
  navigate,
  currentUserUid,
  targetUserUid,
  rooms = [],
}) => {
  // 1. 기존 방 검색
  const existingRoom = rooms.find(
    (room) =>
      room.members.includes(currentUserUid) &&
      room.members.includes(targetUserUid),
  );
  console.log(currentUserUid);
  console.log(targetUserUid);
  console.log(`${existingRoom?.id}`);

  if (existingRoom) {
    navigate(`/dm/${existingRoom.id}`);
  } else {
    navigate(`/dm?uid=${targetUserUid}`);
  }
};
