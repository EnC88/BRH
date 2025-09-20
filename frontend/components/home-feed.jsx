"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, MapPin, Plus, MessageCircle, User } from "lucide-react"
import Image from "next/image"

interface Post {
  id: string
  user: {
    name: string
    avatar: string
  }
  image: string
  caption: string
  tag?: string
  likes: number
  isLiked: boolean
}

const mockPosts: Post[] = [
  {
    id: "1",
    user: {
      name: "Alex Chen",
      avatar: "/futuristic-avatar.png",
    },
    image: "/futuristic-cityscape-ar-scene.jpg",
    caption:
      "Just discovered this incredible AR cityscape overlay! The holographic buildings blend perfectly with reality ✨",
    tag: "cityscape",
    likes: 42,
    isLiked: false,
  },
  {
    id: "2",
    user: {
      name: "Maya Rodriguez",
      avatar: "/tech-girl-avatar.jpg",
    },
    image: "/ar-study-space-holographic-books.jpg",
    caption: "My new favorite study spot with AR book projections. So much more immersive than regular studying!",
    tag: "studyspot",
    likes: 28,
    isLiked: true,
  },
  {
    id: "3",
    user: {
      name: "Jordan Kim",
      avatar: "/explorer-avatar.png",
    },
    image: "/ar-nature-scene-glowing-forest.jpg",
    caption: "Nature meets technology in this magical AR forest experience. The glowing particles are mesmerizing!",
    tag: "nature",
    likes: 67,
    isLiked: false,
  },
]

export default function HomeFeed() {
  const [posts, setPosts] = useState<Post[]>(mockPosts)
  const [showChatbot, setShowChatbot] = useState(false)

  const toggleLike = (postId: string) => {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Modern header with user profile and create button */}
      <div className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            ARSocial
          </h1>

          <div className="flex items-center gap-3">
            {/* Modern Create Button */}
            <Button
              size="sm"
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white border-0 rounded-full px-4 py-2 shadow-lg shadow-cyan-500/25"
            >
              <Plus className="w-4 h-4 mr-1" />
              Create
            </Button>

            {/* User Profile */}
            <Button variant="ghost" size="sm" className="p-2 hover:bg-slate-800/50 rounded-full">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-blue-400 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-cyan-400/20 to-blue-400/20 blur-sm" />
              </div>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 pb-20">
        {posts.map((post) => (
          <Card
            key={post.id}
            className="mb-6 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl"
          >
            <CardContent className="p-0">
              {/* User Header */}
              <div className="flex items-center gap-3 p-4 border-b border-slate-700/30">
                <div className="relative">
                  <Image
                    src={post.user.avatar || "/placeholder.svg"}
                    alt={post.user.name}
                    width={40}
                    height={40}
                    className="rounded-full border-2 border-cyan-400/30"
                  />
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-cyan-400/20 to-blue-400/20 blur-sm" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{post.user.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <MapPin className="w-3 h-3" />
                    AR Location
                  </div>
                </div>
              </div>

              {/* AR Scene Image */}
              <div className="relative aspect-square">
                <Image src={post.image || "/placeholder.svg"} alt="AR Scene" fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent" />

                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5" />
                <div className="absolute top-3 right-3">
                  <Badge className="bg-slate-900/80 text-cyan-400 border-cyan-400/30 text-xs backdrop-blur-sm">
                    AR ENHANCED
                  </Badge>
                </div>
              </div>

              {/* Actions & Info */}
              <div className="p-4 space-y-3">
                {/* Like Button */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleLike(post.id)}
                    className={`flex items-center gap-2 hover:bg-slate-700/50 rounded-full px-3 py-2 ${
                      post.isLiked ? "text-cyan-400" : "text-slate-300"
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${post.isLiked ? "fill-current" : ""}`} />
                    <span className="font-medium">{post.likes}</span>
                  </Button>

                  {post.tag && (
                    <Badge variant="outline" className="border-cyan-400/30 text-cyan-400 bg-slate-800/50 rounded-full">
                      #{post.tag}
                    </Badge>
                  )}
                </div>

                {/* Caption */}
                <p className="text-slate-200 text-sm leading-relaxed">{post.caption}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button
        onClick={() => setShowChatbot(!showChatbot)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 shadow-2xl shadow-cyan-500/25 border-0 z-50"
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </Button>

      {showChatbot && (
        <div className="fixed bottom-24 right-6 w-80 h-96 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl z-50 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">AI Assistant</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowChatbot(false)}
              className="text-slate-400 hover:text-white p-1"
            >
              ×
            </Button>
          </div>
          <div className="text-slate-400 text-sm">Chatbot backend integration coming soon...</div>
        </div>
      )}
    </div>
  )
}
