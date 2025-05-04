import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  setDoc
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyDFOy8m9o68jIx0Y5vzig9xbABi22ii4I0',
  authDomain: 'seton-80f66.firebaseapp.com',
  databaseURL: 'https://seton-80f66-default-rtdb.firebaseio.com',
  projectId: 'seton-80f66',
  storageBucket: 'seton-80f66.firebasestorage.app',
  messagingSenderId: '766734967278',
  appId: '1:766734967278:web:993104fddf173775de2eff',
  measurementId: 'G-HLSM61YR08'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// User roles
export const ROLES = {
  ADMIN: 'admin',
  CASHIER: 'cashier',
  COURIER: 'courier'
};

// Auth functions
export const login = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Get user role from Firestore
    const userDoc = await getDocs(query(collection(db, 'users'), where('email', '==', email)));
    if (!userDoc.empty) {
      const userData = userDoc.docs[0].data();
      return { ...user, role: userData.role };
    }

    throw new Error('User role not found');
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

export const createUser = async (email: string, password: string, role: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email,
      role,
      createdAt: new Date().toISOString()
    });

    return user;
  } catch (error) {
    throw error;
  }
};

// Firestore collections
export const productsCollection = collection(db, 'products');
export const ordersCollection = collection(db, 'orders');
export const usersCollection = collection(db, 'users');
export const deliveriesCollection = collection(db, 'deliveries');
export const loyaltyProgramCollection = collection(db, 'loyaltyProgram');
export const giftCardsCollection = collection(db, 'giftCards');
export const customerPointsCollection = collection(db, 'customerPoints');

// Firestore functions
export const getProducts = (callback: (products: any[]) => void) => {
  return onSnapshot(productsCollection, snapshot => {
    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(products);
  });
};

export const getOrders = (callback: (orders: any[]) => void) => {
  return onSnapshot(ordersCollection, snapshot => {
    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(orders);
  });
};

export const getUsers = (callback: (users: any[]) => void) => {
  return onSnapshot(usersCollection, snapshot => {
    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(users);
  });
};

export const getDeliveries = (callback: (deliveries: any[]) => void) => {
  return onSnapshot(deliveriesCollection, snapshot => {
    const deliveries = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(deliveries);
  });
};

export const addProduct = async (product: any) => {
  try {
    const docRef = await addDoc(productsCollection, product);
    return docRef.id;
  } catch (error) {
    throw error;
  }
};

export const updateProduct = async (id: string, data: any) => {
  try {
    await updateDoc(doc(db, 'products', id), data);
  } catch (error) {
    throw error;
  }
};

export const deleteProduct = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'products', id));
  } catch (error) {
    throw error;
  }
};

export const addOrder = async (order: any) => {
  try {
    const docRef = await addDoc(ordersCollection, order);
    return docRef.id;
  } catch (error) {
    throw error;
  }
};

export const updateOrder = async (id: string, data: any) => {
  try {
    await updateDoc(doc(db, 'orders', id), data);
  } catch (error) {
    throw error;
  }
};

export const deleteOrder = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'orders', id));
  } catch (error) {
    throw error;
  }
};

export const addDelivery = async (delivery: any) => {
  try {
    const docRef = await addDoc(deliveriesCollection, delivery);
    return docRef.id;
  } catch (error) {
    throw error;
  }
};

export const updateDelivery = async (id: string, data: any) => {
  try {
    await updateDoc(doc(db, 'deliveries', id), data);
  } catch (error) {
    throw error;
  }
};

export const deleteDelivery = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'deliveries', id));
  } catch (error) {
    throw error;
  }
};

// Loyalty Program functions
export const getLoyaltyProgram = (callback: (program: any) => void) => {
  return onSnapshot(loyaltyProgramCollection, snapshot => {
    const program = snapshot.docs[0]?.data();
    callback(program);
  });
};

export const updateLoyaltyProgram = async (data: {
  pointsPerDollar: number;
  rewards: {
    points: number;
    reward: string;
  }[];
}) => {
  try {
    const programDoc = await getDocs(loyaltyProgramCollection);
    if (programDoc.empty) {
      await addDoc(loyaltyProgramCollection, data);
    } else {
      await updateDoc(doc(db, 'loyaltyProgram', programDoc.docs[0].id), data);
    }
  } catch (error) {
    throw error;
  }
};

export const addCustomerPoints = async (customerId: string, points: number) => {
  try {
    const pointsDoc = await getDocs(query(customerPointsCollection, where('customerId', '==', customerId)));
    if (pointsDoc.empty) {
      await addDoc(customerPointsCollection, {
        customerId,
        points,
        lastUpdated: new Date().toISOString()
      });
    } else {
      const currentPoints = pointsDoc.docs[0].data().points;
      await updateDoc(doc(db, 'customerPoints', pointsDoc.docs[0].id), {
        points: currentPoints + points,
        lastUpdated: new Date().toISOString()
      });
    }
  } catch (error) {
    throw error;
  }
};

export const redeemPoints = async (customerId: string, points: number) => {
  try {
    const pointsDoc = await getDocs(query(customerPointsCollection, where('customerId', '==', customerId)));
    if (!pointsDoc.empty) {
      const currentPoints = pointsDoc.docs[0].data().points;
      if (currentPoints >= points) {
        await updateDoc(doc(db, 'customerPoints', pointsDoc.docs[0].id), {
          points: currentPoints - points,
          lastUpdated: new Date().toISOString()
        });
        return true;
      }
    }
    return false;
  } catch (error) {
    throw error;
  }
};

// Gift Cards functions
export const createGiftCard = async (data: { amount: number; code: string; isActive: boolean }) => {
  try {
    await addDoc(giftCardsCollection, {
      ...data,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    throw error;
  }
};

export const getGiftCards = (callback: (giftCards: any[]) => void) => {
  return onSnapshot(giftCardsCollection, snapshot => {
    const giftCards = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(giftCards);
  });
};

export const updateGiftCard = async (id: string, data: any) => {
  try {
    await updateDoc(doc(db, 'giftCards', id), data);
  } catch (error) {
    throw error;
  }
};

export const deleteGiftCard = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'giftCards', id));
  } catch (error) {
    throw error;
  }
};

// Image upload function
export const uploadProductImage = async (file: File): Promise<string> => {
  try {
    // Create a unique filename
    const timestamp = Date.now();
    const filename = `products/${timestamp}_${file.name}`;

    // Create a reference to the file location
    const storageRef = ref(storage, filename);

    // Upload the file
    await uploadBytes(storageRef, file);

    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export const deleteProductImage = async (imageUrl: string) => {
  try {
    if (!imageUrl) return;

    // Create a reference to the file to delete
    const imageRef = ref(storage, imageUrl);

    // Delete the file
    await deleteObject(imageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};
