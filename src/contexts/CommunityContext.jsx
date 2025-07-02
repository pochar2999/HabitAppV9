import React, { createContext, useContext, useState, useEffect } from 'react'
import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  arrayUnion, 
  arrayRemove,
  onSnapshot,
  deleteDoc
} from 'firebase/firestore'
import { useAuth } from './AuthContext'
import { db } from '../firebase/config'

const CommunityContext = createContext()

export function useCommunity() {
  return useContext(CommunityContext)
}

export function CommunityProvider({ children }) {
  const { currentUser, getUserData, updateUserData } = useAuth()
  const [userServers, setUserServers] = useState([])
  const [loading, setLoading] = useState(true)

  // Load user's servers when user changes
  useEffect(() => {
    if (currentUser && currentUser.emailVerified) {
      loadUserServers()
    } else {
      setUserServers([])
      setLoading(false)
    }
  }, [currentUser])

  async function loadUserServers() {
    try {
      setLoading(true)
      const userData = await getUserData(currentUser.uid)
      const joinedServers = userData?.joinedServers || []
      
      if (joinedServers.length === 0) {
        setUserServers([])
        return
      }

      // Fetch server details
      const serverPromises = joinedServers.map(async (serverId) => {
        const serverDoc = await getDoc(doc(db, 'servers', serverId))
        if (serverDoc.exists()) {
          return { id: serverDoc.id, ...serverDoc.data() }
        }
        return null
      })

      const servers = (await Promise.all(serverPromises)).filter(Boolean)
      setUserServers(servers)
    } catch (error) {
      console.error('Error loading user servers:', error)
      setUserServers([])
    } finally {
      setLoading(false)
    }
  }

  function generateJoinCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  async function createServer(name, isPublic) {
    try {
      const joinCode = generateJoinCode()
      
      // Create server document
      const serverData = {
        name,
        isPublic,
        joinCode,
        ownerId: currentUser.uid,
        ownerName: currentUser.displayName || currentUser.email,
        members: [currentUser.uid],
        memberDetails: {
          [currentUser.uid]: {
            name: currentUser.displayName || currentUser.email,
            email: currentUser.email,
            joinedAt: new Date()
          }
        },
        createdAt: new Date(),
        memberCount: 1
      }

      const serverRef = await addDoc(collection(db, 'servers'), serverData)
      
      // Add server to user's joinedServers
      const userData = await getUserData(currentUser.uid)
      const currentServers = userData?.joinedServers || []
      
      await updateUserData(currentUser.uid, {
        joinedServers: [...currentServers, serverRef.id]
      })

      // Reload user servers
      await loadUserServers()
      
      return { id: serverRef.id, joinCode }
    } catch (error) {
      console.error('Error creating server:', error)
      throw error
    }
  }

  async function joinServer(joinCode) {
    try {
      // Find server by join code
      const serversQuery = query(
        collection(db, 'servers'),
        where('joinCode', '==', joinCode.toUpperCase())
      )
      
      const querySnapshot = await getDocs(serversQuery)
      
      if (querySnapshot.empty) {
        throw new Error('Server not found with that join code')
      }

      const serverDoc = querySnapshot.docs[0]
      const serverData = serverDoc.data()
      const serverId = serverDoc.id

      // Check if user is already a member
      if (serverData.members.includes(currentUser.uid)) {
        throw new Error('You are already a member of this server')
      }

      if (serverData.isPublic) {
        // Auto-join public server
        await updateDoc(doc(db, 'servers', serverId), {
          members: arrayUnion(currentUser.uid),
          [`memberDetails.${currentUser.uid}`]: {
            name: currentUser.displayName || currentUser.email,
            email: currentUser.email,
            joinedAt: new Date()
          },
          memberCount: serverData.memberCount + 1
        })

        // Add server to user's joinedServers
        const userData = await getUserData(currentUser.uid)
        const currentServers = userData?.joinedServers || []
        
        await updateUserData(currentUser.uid, {
          joinedServers: [...currentServers, serverId]
        })

        await loadUserServers()
        return { success: true, serverName: serverData.name }
      } else {
        // Send join request for private server
        await addDoc(collection(db, 'servers', serverId, 'pendingRequests'), {
          userId: currentUser.uid,
          userName: currentUser.displayName || currentUser.email,
          userEmail: currentUser.email,
          requestedAt: new Date(),
          status: 'pending'
        })

        return { success: true, pending: true, serverName: serverData.name }
      }
    } catch (error) {
      console.error('Error joining server:', error)
      throw error
    }
  }

  async function leaveServer(serverId) {
    try {
      const serverRef = doc(db, 'servers', serverId)
      const serverDoc = await getDoc(serverRef)
      
      if (!serverDoc.exists()) {
        throw new Error('Server not found')
      }

      const serverData = serverDoc.data()

      // Remove user from server
      await updateDoc(serverRef, {
        members: arrayRemove(currentUser.uid),
        [`memberDetails.${currentUser.uid}`]: null,
        memberCount: Math.max(0, serverData.memberCount - 1)
      })

      // Remove server from user's joinedServers
      const userData = await getUserData(currentUser.uid)
      const currentServers = userData?.joinedServers || []
      
      await updateUserData(currentUser.uid, {
        joinedServers: currentServers.filter(id => id !== serverId)
      })

      await loadUserServers()
    } catch (error) {
      console.error('Error leaving server:', error)
      throw error
    }
  }

  async function getServerDetails(serverId) {
    try {
      const serverDoc = await getDoc(doc(db, 'servers', serverId))
      if (!serverDoc.exists()) {
        throw new Error('Server not found')
      }

      const serverData = serverDoc.data()
      
      // Check if user is a member
      if (!serverData.members.includes(currentUser.uid)) {
        throw new Error('You are not a member of this server')
      }

      return { id: serverDoc.id, ...serverData }
    } catch (error) {
      console.error('Error getting server details:', error)
      throw error
    }
  }

  async function sendMotivation(targetUserId, serverId) {
    try {
      // Add motivation message to server's motivations subcollection
      await addDoc(collection(db, 'servers', serverId, 'motivations'), {
        fromUserId: currentUser.uid,
        fromUserName: currentUser.displayName || currentUser.email,
        toUserId: targetUserId,
        message: 'You got this! Keep going! 💪',
        sentAt: new Date()
      })

      return true
    } catch (error) {
      console.error('Error sending motivation:', error)
      throw error
    }
  }

  async function getPendingRequests(serverId) {
    try {
      const requestsSnapshot = await getDocs(
        collection(db, 'servers', serverId, 'pendingRequests')
      )
      
      return requestsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('Error getting pending requests:', error)
      throw error
    }
  }

  async function handleJoinRequest(serverId, requestId, approve) {
    try {
      const requestRef = doc(db, 'servers', serverId, 'pendingRequests', requestId)
      const requestDoc = await getDoc(requestRef)
      
      if (!requestDoc.exists()) {
        throw new Error('Request not found')
      }

      const requestData = requestDoc.data()

      if (approve) {
        // Add user to server
        const serverRef = doc(db, 'servers', serverId)
        const serverDoc = await getDoc(serverRef)
        const serverData = serverDoc.data()

        await updateDoc(serverRef, {
          members: arrayUnion(requestData.userId),
          [`memberDetails.${requestData.userId}`]: {
            name: requestData.userName,
            email: requestData.userEmail,
            joinedAt: new Date()
          },
          memberCount: serverData.memberCount + 1
        })

        // Add server to user's joinedServers
        const userData = await getUserData(requestData.userId)
        const currentServers = userData?.joinedServers || []
        
        await updateUserData(requestData.userId, {
          joinedServers: [...currentServers, serverId]
        })
      }

      // Remove the request
      await deleteDoc(requestRef)
      
      return true
    } catch (error) {
      console.error('Error handling join request:', error)
      throw error
    }
  }

  const value = {
    userServers,
    loading,
    createServer,
    joinServer,
    leaveServer,
    getServerDetails,
    sendMotivation,
    getPendingRequests,
    handleJoinRequest,
    loadUserServers
  }

  return (
    <CommunityContext.Provider value={value}>
      {children}
    </CommunityContext.Provider>
  )
}