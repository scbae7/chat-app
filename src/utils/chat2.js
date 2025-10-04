// utils/chat.js
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

export const goToDM = async ({
  navigate,
  currentUserUid,
  targetUserUid,
  rooms = [],
}) => {
  let existingRoom = rooms.find(
    (room) =>
      Array.isArray(room.members) &&
      room.members.includes(currentUserUid) &&
      room.members.includes(targetUserUid),
  );

  if (!existingRoom) {
    const q = query(
      collection(db, 'privateRooms'),
      where('members', 'array-contains', currentUserUid),
    );
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (Array.isArray(data.members) && data.members.includes(targetUserUid)) {
        existingRoom = { id: doc.id, ...data };
      }
    });
  }

  if (existingRoom) {
    navigate(`/dm/${existingRoom.id}`);
    return existingRoom.id;
  }

  const newRoomRef = await addDoc(collection(db, 'privateRooms'), {
    members: [currentUserUid, targetUserUid],
    createdAt: serverTimestamp(),
    lastMessage: '',
    lastTimestamp: serverTimestamp(),
  });

  navigate(`/dm/${newRoomRef.id}`);
  return newRoomRef.id;
};
