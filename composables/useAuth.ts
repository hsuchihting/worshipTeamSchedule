import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import type { UserProfile } from '~/types'

export const useAuth = () => {
  const { $auth, $db } = useNuxtApp()
  const currentUser = useState<User | null>('auth-user', () => null)
  const userProfile = useState<UserProfile | null>('auth-profile', () => null)
  const loading = useState<boolean>('auth-loading', () => true)

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup($auth, provider)
    return result.user
  }

  const logout = async () => {
    await signOut($auth)
    currentUser.value = null
    userProfile.value = null
  }

  const fetchUserProfile = async (uid: string) => {
    const docRef = doc($db, 'users', uid)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      userProfile.value = docSnap.data() as UserProfile
    }
    return userProfile.value
  }

  const saveUserProfile = async (profile: UserProfile) => {
    const docRef = doc($db, 'users', profile.uid)
    await setDoc(docRef, profile)
    userProfile.value = profile
  }

  // 初始化 auth 狀態監聽
  if (import.meta.client) {
    onAuthStateChanged($auth, async (user) => {
      currentUser.value = user
      if (user) {
        await fetchUserProfile(user.uid)
      } else {
        userProfile.value = null
      }
      loading.value = false
    })
  }

  return {
    currentUser: readonly(currentUser),
    userProfile: readonly(userProfile),
    loading: readonly(loading),
    loginWithGoogle,
    logout,
    fetchUserProfile,
    saveUserProfile,
  }
}
