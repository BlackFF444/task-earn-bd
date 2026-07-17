import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

export const storageService = {
  uploadProofImage: async (file, userId, taskId) => {
    const fileName = `proofs/${userId}/${taskId}_${Date.now()}.${file.name.split('.').pop()}`;
    const storageRef = ref(storage, fileName);
    const snapshot = await uploadBytes(storageRef, file);
    return getDownloadURL(snapshot.ref);
  },
};
