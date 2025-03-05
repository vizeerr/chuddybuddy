import { initializeApp } from "firebase/app"
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore"
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth"
import type { User, Expense } from "@/lib/types"

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBQpv-U7zjVgPTbfK7RMHg05eWkICPg4aA",
  authDomain: "monkhood-55245.firebaseapp.com",
  projectId: "monkhood-55245",
  storageBucket: "monkhood-55245.appspot.com",
  messagingSenderId: "567445925428",
  appId: "1:567445925428:web:afde7efc78f65b381ca461"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

// Auth functions
export const loginUser = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password)
}

export const registerUser = (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password)
}

export const logoutUser = () => {
  return signOut(auth)
}

export const getCurrentUser = () => {
  return auth.currentUser
}

export const onAuthChange = (callback: (user: any) => void) => {
  return onAuthStateChanged(auth, callback)
}

// Firestore functions for Users
export const getUsersCollection = () => collection(db, "users")

export const getUserDoc = (id: string) => doc(db, "users", id)

export const fetchUsers = async (): Promise<User[]> => {
  const querySnapshot = await getDocs(getUsersCollection())
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as User)
}

export const fetchUserById = async (id: string): Promise<User | null> => {
  const docSnap = await getDoc(getUserDoc(id))
  return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as User) : null
}

export const createUser = async (user: Omit<User, "id">): Promise<User> => {
  const newUserRef = doc(getUsersCollection())
  const newUser = { ...user, id: newUserRef.id }
  await setDoc(newUserRef, newUser)
  return newUser
}

export const updateUserInFirebase = async (user: User): Promise<User> => {
  await setDoc(getUserDoc(user.id), user, { merge: true })
  return user
}

export const deleteUserFromFirebase = async (id: string): Promise<void> => {
  await deleteDoc(getUserDoc(id))
}

export const subscribeToUsers = (callback: (users: User[]) => void) => {
  return onSnapshot(getUsersCollection(), (snapshot) => {
    const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as User)
    callback(users)
  })
}

// Firestore functions for Expenses
export const getExpensesCollection = () => collection(db, "expenses")

export const getExpenseDoc = (id: string) => doc(db, "expenses", id)

export const fetchExpenses = async (): Promise<Expense[]> => {
  const querySnapshot = await getDocs(getExpensesCollection())
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Expense)
}

export const fetchExpenseById = async (id: string): Promise<Expense | null> => {
  const docSnap = await getDoc(getExpenseDoc(id))
  return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as Expense) : null
}

export const createExpense = async (expense: Omit<Expense, "id" | "createdAt">): Promise<Expense> => {
  const newExpenseRef = doc(getExpensesCollection())
  const newExpense = {
    ...expense,
    id: newExpenseRef.id,
    createdAt: serverTimestamp(),
  }
  await setDoc(newExpenseRef, newExpense)
  return { ...newExpense, createdAt: new Date().toISOString() } as Expense
}

export const updateExpenseInFirebase = async (expense: Expense): Promise<Expense> => {
  const { id, ...expenseData } = expense
  await setDoc(getExpenseDoc(id), expenseData, { merge: true })
  return expense
}

export const deleteExpenseFromFirebase = async (id: string): Promise<void> => {
  await deleteDoc(getExpenseDoc(id))
}

export const subscribeToExpenses = (callback: (expenses: Expense[]) => void) => {
  return onSnapshot(getExpensesCollection(), (snapshot) => {
    const expenses = snapshot.docs.map((doc) => {
      const data = doc.data()
      // Convert Firestore Timestamp to string
      const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt

      return {
        id: doc.id,
        ...data,
        createdAt,
      } as Expense
    })
    callback(expenses)
  })
}

// Sync functions
export const syncLocalToFirebase = async () => {
  if (typeof window === "undefined") return

  // Sync users
  const localUsers = JSON.parse(localStorage.getItem("users") || "[]")
  for (const user of localUsers) {
    await updateUserInFirebase(user)
  }

  // Sync expenses
  const localExpenses = JSON.parse(localStorage.getItem("expenses") || "[]")
  for (const expense of localExpenses) {
    await updateExpenseInFirebase(expense)
  }
}

export const syncFirebaseToLocal = async () => {
  if (typeof window === "undefined") return

  // Sync users
  const users = await fetchUsers()
  localStorage.setItem("users", JSON.stringify(users))

  // Sync expenses
  const expenses = await fetchExpenses()
  localStorage.setItem("expenses", JSON.stringify(expenses))

  return { users, expenses }
}

