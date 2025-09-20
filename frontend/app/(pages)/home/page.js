"use client";

import { useState, useEffect } from "react";
import { Heart, MessageCircle, Share, MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import ChatbotPopup from "@/components/ChatbotPopup";
import Post3DScene from "@/components/Post3DScene";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  doc,
  updateDoc,
  arrayRemove,
} from "firebase/firestore";
import { getStorage, ref, deleteObject } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC8ejbYGF1vVC7ErSJ3G5YFGB0DmF1Mt3M",
  authDomain: "brh2025-4b271.firebaseapp.com",
  projectId: "brh2025-4b271",
  storageBucket: "brh2025-4b271.firebasestorage.app",
  messagingSenderId: "858895632224",
  appId: "1:858895632224:web:3c09a5d9b77c9da0438005",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Function to format timestamp
function formatTimestamp(timestamp) {
  const now = new Date();
  const postTime = new Date(timestamp);
  const diffInHours = Math.floor((now - postTime) / (1000 * 60 * 60));

  if (diffInHours < 1) return "Just now";
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return postTime.toLocaleDateString();
}

// Function to fetch posts from Firebase
async function fetchPosts() {
  try {
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);
    const allPosts = [];

    snapshot.forEach((doc) => {
      const userData = doc.data();
      if (userData.posts && Array.isArray(userData.posts)) {
        userData.posts.forEach((post, index) => {
          allPosts.push({
            id: `${doc.id}_${index}`,
            userId: doc.id,
            postIndex: index,
            user: {
              username:
                userData.displayName || userData.email?.split("@")[0] || "User",
              avatar: userData.avatar || "https://via.placeholder.com/150/4a7c59/ffffff?text=User",
              displayName: userData.displayName || "User",
            },
            image: post.url,
            caption: post.description || "",
            category: post.category || "",
            location: post.location || "AR Location",
            tag: post.tags?.[0] || "general",
            likes: Math.floor(Math.random() * 200) + 10, // Random likes for now
            isLiked: false,
            timestamp: formatTimestamp(post.timestamp),
            originalTimestamp: post.timestamp,
            filename: post.filename,
            originalPost: post, // Store the original post data for deletion
          });
        });
      }
    });

    // Sort by timestamp (newest first) - use the original timestamp from Firebase
    return allPosts.sort((a, b) => {
      // Get the original timestamp from the post data
      const timestampA = a.originalTimestamp || a.timestamp;
      const timestampB = b.originalTimestamp || b.timestamp;
      return new Date(timestampB) - new Date(timestampA);
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}

// Function to delete image from Firebase Storage
async function deleteImageFromStorage(filename) {
  try {
    if (!filename) {
      console.warn("No filename provided for deletion");
      return;
    }
    
    const imageRef = ref(storage, `uploads/${filename}`);
    await deleteObject(imageRef);
    console.log("Image deleted from storage:", filename);
  } catch (error) {
    console.error("Error deleting image from storage:", error);
    // Don't throw error here as the image might already be deleted
  }
}

// Function to delete post from Firebase
async function deletePost(post) {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Delete the image from storage first
    if (post.filename) {
      await deleteImageFromStorage(post.filename);
    }

    // Remove the post from Firestore
    const userDocRef = doc(db, "users", post.userId);
    await updateDoc(userDocRef, {
      posts: arrayRemove(post.originalPost)
    });

    console.log("Post deleted successfully");
    return true;
  } catch (error) {
    console.error("Error deleting post:", error);
    throw error;
  }
}

// Mock data for posts (fallback - only used if no Firebase data)
const mockPosts = [
  {
    id: 1,
    user: {
      username: "demo_user",
      avatar: "https://via.placeholder.com/150/4a7c59/ffffff?text=User",
      displayName: "Demo User",
    },
    image: "https://via.placeholder.com/400/4a7c59/ffffff?text=No+Posts+Yet",
    caption: "No posts yet. Upload your first AR photo to get started!",
    tag: "welcome",
    likes: 0,
    isLiked: false,
    timestamp: "Just now",
    location: "AR Location",
  },
];

export default function HomePage() {
  const [posts, setPosts] = useState(mockPosts);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [allPosts, setAllPosts] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [deletingPost, setDeletingPost] = useState(null);

  const categories = [
    { value: "", label: "All Categories" },
    { value: "dining", label: "Dining Halls and Eateries" },
    { value: "study_spots", label: "Study Spots" },
    { value: "secret_study_spots", label: "Secret Study Spots" },
    { value: "best_matcha", label: "Best Matcha" },
    { value: "cool_places", label: "Cool Spots" },
    { value: "other", label: "Other" },
  ];

  useEffect(() => {
    async function loadPosts() {
      setLoading(true);
      try {
        const firebasePosts = await fetchPosts();
        if (firebasePosts.length > 0) {
          setAllPosts(firebasePosts);
          setPosts(firebasePosts);
        } else {
          // Keep mock posts if no Firebase data
          setAllPosts(mockPosts);
          setPosts(mockPosts);
        }
      } catch (error) {
        console.error("Failed to load posts:", error);
        // Fallback to mock posts
        setAllPosts(mockPosts);
        setPosts(mockPosts);
      } finally {
        setLoading(false);
      }
    }

    loadPosts();

    // Refresh posts when page becomes visible (e.g., returning from camera)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadPosts();
      }
    };

    // Also refresh when window gains focus
    const handleFocus = () => {
      loadPosts();
    };

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Filter posts based on selected category
  useEffect(() => {
    if (selectedCategory === "") {
      setPosts(allPosts);
    } else {
      const filteredPosts = allPosts.filter(post => post.category === selectedCategory);
      setPosts(filteredPosts);
    }
  }, [selectedCategory, allPosts]);

  const handleLike = (postId) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
  };

  const handleDeletePost = async (post) => {
    if (!confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return;
    }

    setDeletingPost(post.id);
    setOpenDropdown(null);

    try {
      await deletePost(post);
      
      // Remove the post from local state
      setPosts(posts.filter(p => p.id !== post.id));
      setAllPosts(allPosts.filter(p => p.id !== post.id));
      
      alert("Post deleted successfully!");
    } catch (error) {
      console.error("Failed to delete post:", error);
      alert(`Failed to delete post: ${error.message}`);
    } finally {
      setDeletingPost(null);
    }
  };

  const toggleDropdown = (postId) => {
    setOpenDropdown(openDropdown === postId ? null : postId);
  };

  return (
    <div className="min-h-screen bg-[#f0fdf4] relative">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#f0fdf4]/20 via-[#f0fdf4]/15 to-[#f0fdf4]/25"></div>

      {/* Feed */}
      <main className="relative z-10 pb-20 px-4 min-h-screen flex flex-col items-center">
        <div className="w-full max-w-lg">
          {/* Feed Header */}
          <div className="flex items-center justify-between mb-6 pt-6">
            <h1 className="text-2xl font-bold text-[#2d4a2d] tracking-wide">Feed</h1>
            <div className="relative w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 bg-white/80 backdrop-blur-sm border border-[#2d4a2d]/30 rounded-lg 
                           text-[#2d4a2d] font-medium focus:outline-none focus:ring-2 focus:ring-green-400 
                           cursor-pointer appearance-none pr-8 text-sm truncate"
              >
                {categories.map((category) => (
                  <option
                    key={category.value}
                    value={category.value}
                    className="truncate"
                  >
                    {category.label}
                  </option>
                ))}
              </select>
              {/* Custom dropdown arrow */}
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-[#2d4a2d]"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="m6 8 4 4 4-4"
                  />
                </svg>
              </div>
            </div>
          </div>
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-gray-600">Loading posts...</div>
            </div>
          ) : (
            posts.map((post) => (
              <article
                key={post.id}
                className="mb-6 bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg w-full"
              >
                {/* Post Header */}
                <div className="flex items-center justify-between p-4 pb-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10 ring-2 ring-green-400/50">
                      <AvatarImage
                        src={post.user.avatar || "https://via.placeholder.com/150/4a7c59/ffffff?text=User"}
                        alt={post.user.username}
                      />
                      <AvatarFallback className="bg-green-500 text-white font-medium">
                        {post.user.displayName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">
                        {post.user.username}
                      </p>
                      <p className="text-gray-600 text-xs">
                        {post.location || "AR Location"} • {post.timestamp}
                      </p>
                    </div>
                  </div>
                  <div className="relative dropdown-container">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 hover:text-gray-800"
                      onClick={() => toggleDropdown(post.id)}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                    
                    {openDropdown === post.id && (
                      <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                        <button
                          onClick={() => handleDeletePost(post)}
                          disabled={deletingPost === post.id}
                          className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="h-4 w-4" />
                          {deletingPost === post.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Post 3D Scene */}
                <div className="relative group rounded-lg overflow-hidden">
                  <Post3DScene 
                    imageUrl={post.image || "https://via.placeholder.com/400/4a7c59/ffffff?text=No+Image"}
                    className="rounded-lg"
                  />
                  {/* Holographic overlay effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 via-transparent to-green-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>

                {/* Post Actions */}
                <div className="flex items-center justify-between p-4 pt-3">
                  <div className="flex items-center space-x-6">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(post.id)}
                      className={`p-2 h-auto ${
                        post.isLiked ? "text-red-500" : "text-gray-600"
                      } hover:text-red-500 transition-colors`}
                    >
                      <Heart
                        className={`h-8 w-8 ${
                          post.isLiked ? "fill-current" : ""
                        }`}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-2 h-auto text-gray-600 hover:text-gray-800"
                    >
                      <MessageCircle className="h-8 w-8" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-2 h-auto text-gray-600 hover:text-gray-800"
                    >
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
                    <span className="font-semibold">{post.user.username}</span>{" "}
                    {post.caption}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {post.category && (
                      <Badge
                        variant="secondary"
                        className="bg-[#2d4a2d]/20 text-[#2d4a2d] border border-[#2d4a2d]/30 hover:bg-[#2d4a2d]/30 text-xs font-medium"
                      >
                        {categories.find(cat => cat.value === post.category)?.label || post.category}
                      </Badge>
                    )}
                    {post.tag && (
                      <Badge
                        variant="secondary"
                        className="bg-green-500/30 text-green-700 border border-green-400/50 hover:bg-green-500/40 text-xs font-medium"
                      >
                        #{post.tag}
                      </Badge>
                    )}
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </main>

      {/* Floating Chatbot Button */}
      <ChatbotPopup />
      {/* <Button
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/25 border-0 z-50"
        size="lg"
      >
        <MessageCircle className="h-6 w-6" />
      </Button> */}
    </div>
  );
}
