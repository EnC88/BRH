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
import Post3DScene from "@/components/Post3DScene";
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

// Function to get precise location name from coordinates
async function getPreciseLocationName(latitude, longitude, fallbackLocation) {
  try {
    if (!latitude || !longitude) {
      return fallbackLocation;
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
    );
    
    if (!response.ok) {
      return fallbackLocation;
    }
    
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      const addressComponents = result.address_components || [];
      
      // Look for specific building names, points of interest, or establishments
      const buildingName = addressComponents.find(component => 
        component.types.includes('establishment') || 
        component.types.includes('point_of_interest') ||
        component.types.includes('premise')
      );
      
      if (buildingName) {
        return buildingName.long_name;
      }
      
      // Check for subpremise (specific building/room)
      const subpremise = addressComponents.find(component => 
        component.types.includes('subpremise')
      );
      
      if (subpremise) {
        return subpremise.long_name;
      }
      
      // Check for route (street name) as a fallback
      const route = addressComponents.find(component => 
        component.types.includes('route')
      );
      
      if (route) {
        return route.long_name;
      }
    }
    
    return fallbackLocation;
  } catch (error) {
    console.error("Error getting precise location name:", error);
    return fallbackLocation;
  }
}

// Function to fetch posts from Firebase
async function fetchPosts() {
  try {
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);
    const allPosts = [];

    // First, collect all posts with basic data
    for (const doc of snapshot.docs) {
      const userData = doc.data();
      if (userData.posts && Array.isArray(userData.posts)) {
        for (let index = 0; index < userData.posts.length; index++) {
          const postData = userData.posts[index];
          
          
          // Filter out #camera tags and get the first non-camera tag
          const filteredTags = postData.tags?.filter(tag => 
            tag && !tag.toLowerCase().includes('camera') && !tag.includes('#camera')
          ) || [];
          
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
            category: postData.category || "",
            location: postData.location || "AR Location", // Use original location for now
            latitude: postData.latitude,
            longitude: postData.longitude,
            tag: filteredTags[0] || "general",
            likes: Math.floor(Math.random() * 200) + 10,
            isLiked: false,
            timestamp: postData.timestamp, // Keep raw timestamp for sorting
            comments: postData.comments || [],
          });
        }
      }
    }
    

    // Sort by the raw timestamp descending FIRST
    const sortedPosts = allPosts.sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      
      // Handle invalid dates
      if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
      if (isNaN(dateA.getTime())) return 1;
      if (isNaN(dateB.getTime())) return -1;
      
      return dateB.getTime() - dateA.getTime(); // Descending order (newest first)
    });

    // Then process location names asynchronously (this won't affect sorting)
    const postsWithPreciseLocations = await Promise.all(
      sortedPosts.map(async (post) => {
        if (post.latitude && post.longitude) {
          try {
            const preciseLocation = await getPreciseLocationName(
              post.latitude, 
              post.longitude, 
              post.location
            );
            return { ...post, location: preciseLocation };
          } catch (error) {
            console.error("Error getting precise location:", error);
            return post; // Return original post if location lookup fails
          }
        }
        return post;
      })
    );

    console.log('Final posts being returned:', postsWithPreciseLocations.map(p => ({ id: p.id, timestamp: p.timestamp })));
    return postsWithPreciseLocations;
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
  const [selectedCategory, setSelectedCategory] = useState("");
  const [allPosts, setAllPosts] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [deletingPost, setDeletingPost] = useState(null);
  const [showMapCard, setShowMapCard] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [locationInfo, setLocationInfo] = useState("");
  const [isLoadingLocationInfo, setIsLoadingLocationInfo] = useState(false);
  const [expandedComments, setExpandedComments] = useState({});
  const [newComments, setNewComments] = useState({});
  const [submittingComment, setSubmittingComment] = useState({});

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

  const toggleDropdown = (postId) => {
    setOpenDropdown(openDropdown === postId ? null : postId);
  };

  const handleLocationClick = (location, postId, latitude, longitude) => {
    setSelectedLocation(location);
    setSelectedPostId(postId);
    setShowMapCard(true);
    setOpenDropdown(null); // Close any open dropdowns
    setLocationInfo(""); // Clear previous location info
    generateLocationInfo(location, latitude, longitude); // Generate new location info with coordinates
    
    // Trigger resize event for 3D scenes to recalculate dimensions
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
  };

  const closeMapCard = () => {
    setShowMapCard(false);
    setSelectedLocation("");
    setSelectedPostId(null);
    setLocationInfo("");
    
    // Trigger resize event for 3D scenes to recalculate dimensions
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
  };


  // Function to format Gemini output for better display
  const formatLocationInfo = (text) => {
    if (!text) return "Information not available.";
    
    // Split by lines and process each line
    const lines = text.split('\n').filter(line => line.trim());
    const formattedLines = lines.map(line => {
      // Remove markdown formatting
      let cleanLine = line
        .replace(/\*\*(.*?)\*\*/g, '$1') 
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/^\*\s*/, '• ')
        .replace(/^-\s*/, '• ')
        .trim();
      
      // If line starts with a colon, it's likely a category header
      if (cleanLine.includes(':')) {
        const [category, content] = cleanLine.split(':', 2);
        return {
          type: 'category',
          category: category.trim(),
          content: content.trim()
        };
      }
      
      return {
        type: 'bullet',
        content: cleanLine
      };
    });
    
    return formattedLines;
  };

  const generateLocationInfo = async (location, latitude, longitude) => {
    setIsLoadingLocationInfo(true);
    try {
      // First, try to get precise location using coordinates
      let preciseLocation = location;
      if (latitude && longitude) {
        preciseLocation = await getPreciseLocationName(latitude, longitude, location);
      }

      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      
      if (!apiKey) {
        throw new Error("Gemini API key not found");
      }

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

      const prompt = `Please provide a brief overview of ${preciseLocation} in bullet points. Include:
- What the area/building is known for
- Key attractions or landmarks
- Notable features or characteristics
- Any interesting facts

Keep it concise (3-5 bullet points) and informative.`;

      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 300,
        },
      };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const locationInfoText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Information not available.";
      
      // Format the response for better display
      const formattedInfo = formatLocationInfo(locationInfoText);
      setLocationInfo(formattedInfo);
    } catch (error) {
      console.error("Error generating location info:", error);
      setLocationInfo("Unable to load location information at this time.");
    } finally {
      setIsLoadingLocationInfo(false);
    }
  };

  const handleCommentKeyPress = (e, postId) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitComment(postId);
    }
  };

  // Filter posts based on selected category
  const filteredPosts = posts.filter(post => {
    if (!selectedCategory) return true; // Show all posts if no category selected
    return post.category === selectedCategory;
  });

  return (
    <div className="min-h-screen bg-[#f0fdf4] relative">
      <div className="absolute inset-0 bg-gradient-to-br from-[#f0fdf4]/20 via-[#f0fdf4]/15 to-[#f0fdf4]/25"></div>
      <main className="relative z-10 pb-20 px-4 min-h-screen flex flex-col items-center">
        <div className="w-full max-w-6xl">
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
          ) : filteredPosts.length === 0 ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-gray-600 text-center">
                <p className="text-lg font-medium mb-2">No posts found</p>
                <p className="text-sm">No posts match the selected category "{categories.find(cat => cat.value === selectedCategory)?.label || selectedCategory}"</p>
              </div>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <div key={post.id} className={`mb-6 ${showMapCard && selectedPostId === post.id ? 'flex gap-4 w-full' : 'w-full max-w-lg mx-auto'}`}>
                <article className={`bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg ${showMapCard && selectedPostId === post.id ? 'w-1/2' : 'w-full'}`}>
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
                        <button
                          onClick={() => handleLocationClick(post.location || "AR Location", post.id, post.latitude, post.longitude)}
                          className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                        >
                          {post.location || "AR Location"}
                        </button>
                        {" • "}
                        {formatTimestamp(post.timestamp)}
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
                {/* Post 3D Scene */}
                <div className="relative group rounded-lg overflow-hidden">
                  <Post3DScene 
                    imageUrl={post.image || "https://via.placeholder.com/400/4a7c59/ffffff?text=No+Image"}
                    className="rounded-lg"
                  />
                  {/* Holographic overlay effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 via-transparent to-green-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>    
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

                {/* Map Card - only show for the selected post */}
                {showMapCard && selectedPostId === post.id && (
                  <div className="w-1/2">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg h-full flex flex-col">
                      {/* Map Card Header */}
                      <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800">Location Map</h3>
                        <button
                          onClick={closeMapCard}
                          className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                        >
                          ×
                        </button>
                      </div>

                      {/* Map Content */}
                      <div className="flex-1 p-4">
                        <p className="text-sm text-gray-600 mb-4">
                          <span className="font-medium">Location:</span> {selectedLocation}
                        </p>
                        
                        {/* Embedded Google Map */}
                        <div className="w-full h-64 rounded-lg overflow-hidden border border-gray-200">
                          <iframe
                            src={(() => {
                              const post = filteredPosts.find(p => p.id === selectedPostId);
                              if (post && post.latitude && post.longitude) {
                                return `https://maps.google.com/maps?q=${post.latitude},${post.longitude}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
                              }
                              return `https://maps.google.com/maps?q=${encodeURIComponent(selectedLocation)}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
                            })()}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title={`Map of ${selectedLocation}`}
                          ></iframe>
                        </div>

                        {/* Location Information */}
                        <div className="mt-4">
                          <h4 className="text-sm font-semibold text-gray-800 mb-2">About {selectedLocation}</h4>
                          {isLoadingLocationInfo ? (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                              Loading location information...
                            </div>
                          ) : locationInfo ? (
                            <div className="text-sm text-gray-700">
                              {Array.isArray(locationInfo) ? (
                                <div className="space-y-2">
                                  {locationInfo.map((item, index) => (
                                    <div key={index}>
                                      {item.type === 'category' ? (
                                        <div>
                                          <span className="font-semibold text-gray-800">{item.category}:</span>
                                          <span className="ml-1">{item.content}</span>
                                        </div>
                                      ) : (
                                        <div className="flex items-start">
                                          <span className="text-green-600 mr-2">•</span>
                                          <span>{item.content}</span>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="whitespace-pre-line">{locationInfo}</div>
                              )}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500">
                              Click to load location information
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-4 flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const post = filteredPosts.find(p => p.id === selectedPostId);
                              if (post && post.latitude && post.longitude) {
                                window.open(`https://www.google.com/maps/search/?api=1&query=${post.latitude},${post.longitude}`, '_blank');
                              } else {
                                window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedLocation)}`, '_blank');
                              }
                            }}
                            className="flex-1"
                          >
                            Open in Maps
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(selectedLocation)}`, '_blank')}
                            className="flex-1"
                          >
                            Search Web
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>
      <ChatbotPopup />
    </div>
  );
}
