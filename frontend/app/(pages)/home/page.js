"use client";

import { useState, useEffect } from "react";
import {
  Heart,
  MessageCircle,
  Share,
  MoreHorizontal,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import ChatbotPopup from "@/components/ChatbotPopup";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";

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

// Function to format timestamp
function formatTimestamp(timestamp) {
  if (!timestamp) return "some time ago";
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
        userData.posts.forEach((postData, index) => {
          allPosts.push({
            id: `${doc.id}_${index}`,
            userId: doc.id,
            postIndex: index,
            user: {
              username:
                userData.displayName || userData.email?.split("@")[0] || "User",
              avatar:
                userData.photoUrl || userData.avatar || "/placeholder.svg",
              displayName: userData.displayName || "User",
            },
            image: postData.url,
            caption: postData.description || "",
            tag: postData.tags?.[0] || "general",
            likes: Math.floor(Math.random() * 200) + 10,
            isLiked: false,
            timestamp: postData.timestamp, // Keep raw timestamp for sorting
            comments: postData.comments || [],
          });
        });
      }
    });

    // Sort by the raw timestamp descending
    return allPosts.sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}

// Mock data for posts (fallback)
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
    timestamp: new Date().toISOString(),
    location: "AR Location",
    comments: [],
  },
];

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedComments, setExpandedComments] = useState({});
  const [newComments, setNewComments] = useState({});
  const [submittingComment, setSubmittingComment] = useState({});

  useEffect(() => {
    async function loadPosts() {
      setLoading(true);
      try {
        const firebasePosts = await fetchPosts();
        setPosts(firebasePosts.length > 0 ? firebasePosts : mockPosts);
      } catch (error) {
        console.error("Failed to load posts:", error);
        setPosts(mockPosts);
      } finally {
        setLoading(false);
      }
    }
    loadPosts();
  }, []);

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

  // Toggles the visibility of the comment section
  const toggleComments = (postId) => {
    setExpandedComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleCommentChange = (postId, value) => {
    setNewComments((prev) => ({ ...prev, [postId]: value }));
  };

  const submitComment = async (postId) => {
    const commentText = newComments[postId];
    if (!commentText?.trim() || submittingComment[postId]) return;

    const user = auth.currentUser;
    if (!user) {
      alert("Please sign in to comment");
      return;
    }

    setSubmittingComment((prev) => ({ ...prev, [postId]: true }));

    try {
      const post = posts.find((p) => p.id === postId);
      if (!post) return;

      const newComment = {
        id: Date.now().toString(),
        userId: user.uid,
        username: user.displayName || user.email?.split("@")[0] || "User",
        avatar: user.photoURL || "/placeholder.svg",
        text: commentText.trim(),
        timestamp: new Date().toISOString(),
      };

      const userRef = doc(db, "users", post.userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const currentPosts = userDoc.data().posts || [];
        const updatedPosts = [...currentPosts];

        if (updatedPosts[post.postIndex]) {
          updatedPosts[post.postIndex] = {
            ...updatedPosts[post.postIndex],
            comments: [
              ...(updatedPosts[post.postIndex].comments || []),
              newComment,
            ],
          };
          await updateDoc(userRef, { posts: updatedPosts });
        }
      }

      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p
        )
      );
      setNewComments((prev) => ({ ...prev, [postId]: "" }));
    } catch (error) {
      console.error("Error submitting comment:", error);
      alert("Failed to submit comment. Please try again.");
    } finally {
      setSubmittingComment((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const handleCommentKeyPress = (e, postId) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitComment(postId);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0fdf4] relative">
      <div className="absolute inset-0 bg-gradient-to-br from-[#f0fdf4]/20 via-[#f0fdf4]/15 to-[#f0fdf4]/25"></div>
      <header className="relative z-10 p-4 border-b border-gray-300/20 backdrop-blur-md bg-white/20">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-bold text-2xl text-gray-800 tracking-wide text-center">
            glimpse
          </h1>
        </div>
      </header>
      <main className="relative z-10 pb-20 px-4 min-h-screen flex flex-col items-center">
        <div className="w-full max-w-lg">
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
                <div className="flex items-center justify-between p-4 pb-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10 ring-2 ring-green-400/50">
                      <AvatarImage
                        src={post.user.avatar || "/placeholder.svg"}
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
                        {post.location} • {formatTimestamp(post.timestamp)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
                <div className="relative group">
                  <img
                    src={post.image || "/placeholder.svg"}
                    alt="AR Scene"
                    className="w-full aspect-square object-cover"
                    onError={(e) => {
                      e.target.src = "/placeholder.svg";
                    }}
                  />
                </div>
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
                      onClick={() => toggleComments(post.id)}
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
                <div className="px-4 pb-4">
                  <p className="text-gray-700 text-sm mb-2">
                    <span className="font-semibold">{post.likes}</span> likes
                  </p>
                  <p className="text-gray-700 text-sm leading-relaxed mb-2">
                    <span className="font-semibold">{post.user.username}</span>{" "}
                    {post.caption}
                  </p>
                  {post.tag && (
                    <Badge
                      variant="secondary"
                      className="bg-green-500/30 text-green-700 border border-green-400/50 hover:bg-green-500/40 text-xs font-medium"
                    >
                      #{post.tag}
                    </Badge>
                  )}

                  {/* Comments section */}

                  {/* A text prompt that shows when comments are collapsed */}
                  {!expandedComments[post.id] && post.comments.length > 0 && (
                    <p
                      className="text-sm text-gray-500 mt-2 cursor-pointer"
                      onClick={() => toggleComments(post.id)}
                    >
                      View all {post.comments.length} comments
                    </p>
                  )}

                  {/* This entire section only appears when comments are expanded */}
                  {expandedComments[post.id] && (
                    <div className="border-t border-gray-200 pt-3 mt-3">
                      {/* Scrollable container for the list of comments */}
                      <div className="max-h-48 overflow-y-auto pr-2 space-y-3 mb-3">
                        {post.comments.map((comment) => (
                          <div
                            key={comment.id}
                            className="flex items-start space-x-2"
                          >
                            <Avatar className="h-6 w-6">
                              <AvatarImage
                                src={comment.avatar}
                                alt={comment.username}
                              />
                              <AvatarFallback className="bg-gray-400 text-white text-xs">
                                {comment.username[0]?.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="text-sm">
                                <span className="font-semibold text-gray-800">
                                  {comment.username}
                                </span>{" "}
                                <span className="text-gray-700">
                                  {comment.text}
                                </span>
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatTimestamp(comment.timestamp)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add comment input field */}
                      <div className="flex items-center space-x-2 pt-2 border-t border-gray-100">
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={
                              auth.currentUser?.photoURL || "/placeholder.svg"
                            }
                            alt="You"
                          />
                          <AvatarFallback className="bg-green-500 text-white text-xs">
                            {auth.currentUser?.displayName?.[0]?.toUpperCase() ||
                              "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 flex items-center space-x-2">
                          <input
                            type="text"
                            placeholder="Add a comment..."
                            value={newComments[post.id] || ""}
                            onChange={(e) =>
                              handleCommentChange(post.id, e.target.value)
                            }
                            onKeyPress={(e) =>
                              handleCommentKeyPress(e, post.id)
                            }
                            className="flex-1 bg-transparent text-sm placeholder-gray-500 focus:outline-none"
                            disabled={submittingComment[post.id]}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => submitComment(post.id)}
                            disabled={
                              !newComments[post.id]?.trim() ||
                              submittingComment[post.id]
                            }
                            className="p-1 h-auto text-green-600 hover:text-green-700 disabled:opacity-50"
                          >
                            {submittingComment[post.id] ? (
                              <div className="w-4 h-4 border-2 border-green-600/30 border-t-green-600 rounded-full animate-spin" />
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            ))
          )}
        </div>
      </main>
      <ChatbotPopup />
    </div>
  );
}
