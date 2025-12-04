import { db } from '../firebaseConfig';
import { 
  collection, addDoc, getDocs, query, where, doc, updateDoc, arrayUnion, arrayRemove, getDoc,deleteDoc
} from 'firebase/firestore';

// 1. ADD VIDEO
export async function addVideoToDB(title, videoUrl, tags, creatorId, creatorName) {
  try {
    await addDoc(collection(db, "videos"), {
      title,
      videoUrl,
      tags,
      creatorId,
      creatorName,
      likes: [], // Array of user IDs who liked it
      comments: [], // Array of comment objects
      createdAt: new Date().toISOString()
    });
    return true;
  } catch (e) {
    console.error("Error adding video: ", e);
    return false;
  }
}

// 2. GET VIDEOS (For Student Feed)
export async function getAllVideos() {
  const q = query(collection(db, "videos"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// 3. GET CREATOR VIDEOS (For Dashboard)
export async function getCreatorVideos(creatorId) {
  const q = query(collection(db, "videos"), where("creatorId", "==", creatorId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// 4. TOGGLE LIKE
export async function toggleLikeDB(videoId, userId, isLiked) {
  const videoRef = doc(db, "videos", videoId);
  if (isLiked) {
    // Unlike
    await updateDoc(videoRef, { likes: arrayRemove(userId) });
  } else {
    // Like
    await updateDoc(videoRef, { likes: arrayUnion(userId) });
  }
}

// 5. ADD COMMENT
export async function addCommentDB(videoId, userEmail, text) {
  const videoRef = doc(db, "videos", videoId);
  const newComment = {
    user: userEmail.split('@')[0], // Simple username from email
    text,
    time: new Date().toISOString()
  };
  await updateDoc(videoRef, { comments: arrayUnion(newComment) });
  return newComment;
}

export async function deleteVideoDB(videoId) {
  try {
    await deleteDoc(doc(db, "videos", videoId));
    return true;
  } catch (e) {
    console.error("Error deleting video: ", e);
    return false;
  }
}