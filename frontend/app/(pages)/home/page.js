"use client"

import { useState, useEffect } from "react"
import { Heart, MessageCircle, Share, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore, collection, getDocs, query, orderBy, limit } from 'firebase/firestore'

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC8ejbYGF1vVC7ErSJ3G5YFGB0DmF1Mt3M",
  authDomain: "brh2025-4b271.firebaseapp.com",
  projectId: "brh2025-4b271",
  storageBucket: "brh2025-4b271.firebasestorage.app",
  messagingSenderId: "858895632224",
  appId: "1:858895632224:web:3c09a5d9b77c9da0438005"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

// Function to format timestamp
function formatTimestamp(timestamp) {
  const now = new Date()
  const postTime = new Date(timestamp)
  const diffInHours = Math.floor((now - postTime) / (1000 * 60 * 60))
  
  if (diffInHours < 1) return 'Just now'
  if (diffInHours < 24) return `${diffInHours}h ago`
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}d ago`
  return postTime.toLocaleDateString()
}

// Function to fetch posts from Firebase
async function fetchPosts() {
  try {
    const usersRef = collection(db, 'users')
    const snapshot = await getDocs(usersRef)
    const allPosts = []
    
    snapshot.forEach((doc) => {
      const userData = doc.data()
      if (userData.photos && Array.isArray(userData.photos)) {
        userData.photos.forEach((photo, index) => {
          allPosts.push({
            id: `${doc.id}_${index}`,
            user: {
              username: userData.displayName || userData.email?.split('@')[0] || 'User',
              avatar: userData.avatar || "/placeholder.svg",
              displayName: userData.displayName || 'User',
            },
            image: photo.url,
            caption: photo.caption || '',
            tag: photo.tags?.[0] || 'general',
            likes: Math.floor(Math.random() * 200) + 10, // Random likes for now
            isLiked: false,
            timestamp: formatTimestamp(photo.timestamp),
            location: 'AR Location',
          })
        })
      }
    })
    
    // Sort by timestamp (newest first)
    return allPosts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  } catch (error) {
    console.error('Error fetching posts:', error)
    return []
  }
}

// Mock data for posts (fallback - only used if no Firebase data)
const mockPosts = [
  {
    id: 1,
    user: {
      username: "demo_user",
      avatar: "/placeholder.svg",
      displayName: "Demo User",
    },
    image: "/placeholder.svg",
    caption: "No posts yet. Upload your first AR photo to get started!",
    tag: "welcome",
    likes: 0,
    isLiked: false,
    timestamp: "Just now",
    location: "AR Location",
  },
]

export default function HomePage() {
  const [posts, setPosts] = useState(mockPosts)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadPosts() {
      setLoading(true)
      try {
        const firebasePosts = await fetchPosts()
        if (firebasePosts.length > 0) {
          setPosts(firebasePosts)
        } else {
          // Keep mock posts if no Firebase data
          setPosts(mockPosts)
        }
      } catch (error) {
        console.error('Failed to load posts:', error)
        // Fallback to mock posts
        setPosts(mockPosts)
      } finally {
        setLoading(false)
      }
    }
    
    loadPosts()
  }, [])

  const handleLike = (postId) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post,
      ),
    )
  }

  return (
    <div className="min-h-screen bg-[#f0fdf4] relative">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#f0fdf4]/20 via-[#f0fdf4]/15 to-[#f0fdf4]/25"></div>

      {/* Header */}
      <header className="relative z-10 p-4 border-b border-gray-300/20 backdrop-blur-md bg-white/20">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-bold text-2xl text-gray-800 tracking-wide text-center">glimpse</h1>
        </div>
      </header>

      {/* Feed */}
      <main className="relative z-10 pb-20 px-4 min-h-screen flex flex-col items-center">
        <div className="w-full max-w-lg">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-gray-600">Loading posts...</div>
            </div>
          ) : (
            posts.map((post) => (
            <article key={post.id} className="mb-6 bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg w-full">
            {/* Post Header */}
            <div className="flex items-center justify-between p-4 pb-3">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10 ring-2 ring-green-400/50">
                  <AvatarImage src={post.user.avatar || "/placeholder.svg"} alt={post.user.username} />
                  <AvatarFallback className="bg-green-500 text-white font-medium">
                    {post.user.displayName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{post.user.username}</p>
                  <p className="text-gray-600 text-xs">
                    {post.location} • {post.timestamp}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>

            {/* Post Image */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent z-10 pointer-events-none"></div>
              <img
                src={post.image || "/placeholder.svg"}
                alt="AR Scene"
                className="w-full aspect-square object-cover rounded-lg"
                onError={(e) => {
                  e.target.src = "/placeholder.svg";
                }}
              />
              {/* Holographic overlay effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 via-transparent to-green-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            {/* Post Actions */}
            <div className="flex items-center justify-between p-4 pt-3">
              <div className="flex items-center space-x-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike(post.id)}
                  className={`p-2 h-auto ${post.isLiked ? "text-red-500" : "text-gray-600"} hover:text-red-500 transition-colors`}
                >
                  <Heart className={`h-8 w-8 ${post.isLiked ? "fill-current" : ""}`} />
                </Button>
                <Button variant="ghost" size="sm" className="p-2 h-auto text-gray-600 hover:text-gray-800">
                  <MessageCircle className="h-8 w-8" />
                </Button>
                <Button variant="ghost" size="sm" className="p-2 h-auto text-gray-600 hover:text-gray-800">
                  <Share className="h-8 w-8" />
                </Button>
              </div>
            </div>

            {/* Post Content */}
            <div className="px-4 pb-4">
              <p className="text-gray-700 text-sm mb-2">
                <span className="font-semibold">{post.likes}</span> likes
              </p>
              <p className="text-gray-700 text-sm leading-relaxed mb-2">
                <span className="font-semibold">{post.user.username}</span> {post.caption}
              </p>
              {post.tag && (
                <Badge
                  variant="secondary"
                  className="bg-green-500/30 text-green-700 border border-green-400/50 hover:bg-green-500/40 text-xs font-medium"
                >
                  #{post.tag}
                </Badge>
              )}
            </div>
          </article>
            ))
          )}
        </div>
      </main>

      {/* Floating Chatbot Button */}
      <Button
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/25 border-0 z-50"
        size="lg"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    </div>
  )
}
