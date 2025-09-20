"use client"

import { useState } from "react"
import { Heart, MessageCircle, Share, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

// Mock data for posts
const mockPosts = [
  {
    id: 1,
    user: {
      username: "alex_explorer",
      avatar: "/futuristic-avatar.png",
      displayName: "Alex Chen",
    },
    image: "/futuristic-cityscape-ar-scene.jpg",
    caption: "Found this incredible AR portal in downtown! The holographic effects are mind-blowing 🌆",
    tag: "cityscape",
    likes: 127,
    isLiked: false,
    timestamp: "2h ago",
    location: "Neo Tokyo District",
  },
  {
    id: 2,
    user: {
      username: "maya_tech",
      avatar: "/tech-girl-avatar.jpg",
      displayName: "Maya Rodriguez",
    },
    image: "/ar-study-space-holographic-books.jpg",
    caption: "My new study spot has AR books floating everywhere! Perfect for deep focus sessions.",
    tag: "studyspot",
    likes: 89,
    isLiked: true,
    timestamp: "4h ago",
    location: "Quantum Library",
  },
  {
    id: 3,
    user: {
      username: "zara_wanderer",
      avatar: "/explorer-avatar.png",
      displayName: "Zara Kim",
    },
    image: "/ar-nature-scene-glowing-forest.jpg",
    caption: "Nature meets technology in this stunning AR forest. The bioluminescent effects are incredible!",
    tag: "nature",
    likes: 203,
    isLiked: false,
    timestamp: "6h ago",
    location: "Digital Wilderness",
  },
]

export default function HomePage() {
  const [posts, setPosts] = useState(mockPosts)

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
    <div className="min-h-screen bg-[#2d4a2d] relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#2d4a2d]/20 via-[#4a7c59]/15 to-[#6b9b7a]/25"></div>
      <div className="scan-line"></div>

      {/* Header */}
      <header className="relative z-10 p-4 border-b border-white/10 backdrop-blur-md bg-black/20">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <h1 className="font-space font-bold text-2xl text-white tracking-wide">glimpse</h1>
          <Button variant="ghost" size="sm" className="text-white/80 hover:text-white">
            <MessageCircle className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Feed */}
      <main className="relative z-10 max-w-md mx-auto pb-20">
        {posts.map((post) => (
          <article key={post.id} className="mb-6">
            {/* Post Header */}
            <div className="flex items-center justify-between p-4 pb-3">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10 ring-2 ring-[#4a7c59]/50">
                  <AvatarImage src={post.user.avatar || "/placeholder.svg"} alt={post.user.username} />
                  <AvatarFallback className="bg-[#4a7c59] text-white font-medium">
                    {post.user.displayName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-space font-semibold text-white text-sm">{post.user.username}</p>
                  <p className="text-white/60 text-xs">
                    {post.location} • {post.timestamp}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>

            {/* Post Image */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-10 pointer-events-none"></div>
              <img
                src={post.image || "/placeholder.svg"}
                alt="AR Scene"
                className="w-full aspect-square object-cover"
              />
              {/* Holographic overlay effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#4a7c59]/20 via-transparent to-[#6b9b7a]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            {/* Post Actions */}
            <div className="flex items-center justify-between p-4 pt-3">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike(post.id)}
                  className={`p-0 h-auto ${post.isLiked ? "text-red-400" : "text-white/80"} hover:text-red-400 transition-colors`}
                >
                  <Heart className={`h-6 w-6 ${post.isLiked ? "fill-current" : ""}`} />
                </Button>
                <Button variant="ghost" size="sm" className="p-0 h-auto text-white/80 hover:text-white">
                  <MessageCircle className="h-6 w-6" />
                </Button>
                <Button variant="ghost" size="sm" className="p-0 h-auto text-white/80 hover:text-white">
                  <Share className="h-6 w-6" />
                </Button>
              </div>
            </div>

            {/* Post Content */}
            <div className="px-4 pb-4">
              <p className="text-white/90 text-sm mb-2">
                <span className="font-semibold">{post.likes}</span> likes
              </p>
              <p className="text-white/90 text-sm leading-relaxed mb-2">
                <span className="font-space font-semibold">{post.user.username}</span> {post.caption}
              </p>
              {post.tag && (
                <Badge
                  variant="secondary"
                  className="bg-[#4a7c59]/30 text-[#6b9b7a] border border-[#4a7c59]/50 hover:bg-[#4a7c59]/40 text-xs font-medium"
                >
                  #{post.tag}
                </Badge>
              )}
            </div>
          </article>
        ))}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 bg-black/40 backdrop-blur-md border-t border-white/10">
        <div className="max-w-md mx-auto flex items-center justify-around py-3">
          <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
            <div className="w-6 h-6 rounded-full bg-white/20"></div>
          </Button>
          <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
            <div className="w-6 h-6 rounded-sm bg-white/20"></div>
          </Button>
          <Button variant="ghost" size="sm" className="text-[#4a7c59] hover:text-[#6b9b7a]">
            <div className="w-8 h-8 rounded-full bg-[#4a7c59] flex items-center justify-center">
              <div className="w-6 h-6 rounded-full border-2 border-white"></div>
            </div>
          </Button>
          <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
            <Heart className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
            <div className="w-6 h-6 rounded-full bg-white/20"></div>
          </Button>
        </div>
      </nav>
    </div>
  )
}
