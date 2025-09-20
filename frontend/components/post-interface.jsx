"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Send, Hash, MapPin, Users, Coffee, Book, Camera, Gamepad2, ArrowLeft, Sparkles } from "lucide-react"

interface PostInterfaceProps {
  imageUrl: string
  onPost: (caption: string, tags: string[]) => Promise<void>
  onBack: () => void
}

const tagOptions = [
  { value: "studyspot", label: "Study Spot", icon: Book },
  { value: "cafe", label: "Café", icon: Coffee },
  { value: "friends", label: "Friends", icon: Users },
  { value: "travel", label: "Travel", icon: MapPin },
  { value: "photography", label: "Photography", icon: Camera },
  { value: "gaming", label: "Gaming", icon: Gamepad2 },
]

export default function PostInterface({ imageUrl, onPost, onBack }: PostInterfaceProps) {
  const [caption, setCaption] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isPosting, setIsPosting] = useState(false)

  const handleTagSelect = (tagValue: string) => {
    if (!selectedTags.includes(tagValue)) {
      setSelectedTags([...selectedTags, tagValue])
    }
  }

  const removeTag = (tagValue: string) => {
    setSelectedTags(selectedTags.filter((tag) => tag !== tagValue))
  }

  const handlePost = async () => {
    if (!caption.trim()) return

    setIsPosting(true)
    try {
      await onPost(caption, selectedTags)
    } catch (error) {
      console.error("Failed to post:", error)
    } finally {
      setIsPosting(false)
    }
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-900 relative overflow-hidden">
      {/* Floating particles background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-400/10 border border-cyan-400/20 backdrop-blur-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex items-center gap-2 text-cyan-400">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium tracking-wide">AR POST</span>
        </div>
        <div className="w-16" />
      </div>

      <div className="relative z-10 px-4 pb-4 h-[calc(100vh-80px)]">
        <div className="max-w-6xl mx-auto h-full grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Image Preview */}
          <div className="flex items-center justify-center">
            <div className="relative w-full max-w-sm">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-2xl blur opacity-20" />
              <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-cyan-400/20 overflow-hidden">
                <img
                  src={imageUrl || "/placeholder.svg"}
                  alt="AR Enhanced Photo"
                  className="w-full aspect-square object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400/5 via-transparent to-purple-400/5 pointer-events-none" />
                <div className="absolute inset-0 bg-[linear-gradient(transparent_98%,rgba(6,182,212,0.03)_100%)] bg-[length:100%_4px] pointer-events-none animate-pulse" />
              </div>
              <p className="text-center text-cyan-400/60 text-xs mt-3 tracking-wide">AR ENHANCED • READY TO SHARE</p>
            </div>
          </div>

          {/* Right: Form Controls */}
          <div className="flex flex-col justify-center space-y-6">
            {/* Caption */}
            <div className="space-y-3">
              <Label className="text-cyan-400 text-sm font-medium tracking-wide flex items-center gap-2">
                <Hash className="w-4 h-4" />
                CAPTION
              </Label>
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-xl blur opacity-50" />
                <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-xl border border-cyan-400/20 p-4">
                  <Textarea
                    placeholder="Describe your AR experience..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="min-h-[100px] bg-transparent border-0 text-white placeholder:text-slate-400 resize-none focus:ring-0 text-sm leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-3">
              <Label className="text-purple-400 text-sm font-medium tracking-wide flex items-center gap-2">
                <Hash className="w-4 h-4" />
                TAGS
              </Label>
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-400/20 to-pink-500/20 rounded-xl blur opacity-50" />
                <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-xl border border-purple-400/20 p-4 space-y-3">
                  <Select onValueChange={handleTagSelect}>
                    <SelectTrigger className="bg-transparent border-purple-400/30 text-white focus:border-purple-400 h-10">
                      <SelectValue placeholder="Choose tags..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900/95 backdrop-blur-xl border-purple-400/20">
                      {tagOptions.map((tag) => {
                        const Icon = tag.icon
                        return (
                          <SelectItem key={tag.value} value={tag.value} className="text-white hover:bg-purple-400/10">
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4 text-purple-400" />
                              {tag.label}
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>

                  {/* Selected Tags */}
                  {selectedTags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedTags.map((tagValue) => {
                        const tag = tagOptions.find((t) => t.value === tagValue)
                        const Icon = tag?.icon || Hash
                        return (
                          <Badge
                            key={tagValue}
                            variant="secondary"
                            className="bg-gradient-to-r from-purple-400/20 to-pink-500/20 text-purple-300 border-purple-400/30 cursor-pointer hover:from-purple-400/30 hover:to-pink-500/30 transition-all duration-200 px-2 py-1"
                            onClick={() => removeTag(tagValue)}
                          >
                            <Icon className="w-3 h-3 mr-1" />
                            {tag?.label}
                          </Badge>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Post Button */}
            <Button
              onClick={handlePost}
              disabled={!caption.trim() || isPosting}
              className="w-full h-12 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-white font-semibold tracking-wide rounded-xl border-0 shadow-lg shadow-cyan-400/25 hover:shadow-cyan-400/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPosting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Publishing...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  <span>Share to Feed</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
