"use client";
import React, { useEffect, useState } from "react";

const BuyerPostTable = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState("");
  const [visibleCount, setVisibleCount] = useState(0);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/posts");
      const data = await res.json();
      setPosts(data);
      setVisibleCount(data.filter(p => p.isBuyerVisible).length);
    } catch (err) {
      setPosts([]);
      setVisibleCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleToggleBuyerVisible = async (id, isVisible) => {
    setActionMsg("");
    try {
      const res = await fetch(`http://localhost:5000/api/posts/${id}/buyer-visibility`, { method: "PUT" });
      const data = await res.json();
      if (res.ok) {
        setActionMsg("Post visibility updated.");
        fetchPosts();
      } else {
        setActionMsg(data.message || "Action failed.");
      }
    } catch {
      setActionMsg("Action failed.");
    }
  };

  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold mb-4 text-emerald-700 text-center">Update Post to Buyer Home page</h2>
      {actionMsg && <div className="mb-4 text-center text-emerald-700 font-semibold">{actionMsg}</div>}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
          <thead>
            <tr className="bg-emerald-100 text-emerald-800">
              <th className="py-3 px-4 border-b">Image</th>
              <th className="py-3 px-4 border-b">Title</th>
              <th className="py-3 px-4 border-b">Type</th>
              <th className="py-3 px-4 border-b">Content</th>
              <th className="py-3 px-4 border-b">Buyer Dashboard</th>
              <th className="py-3 px-4 border-b">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-6">Loading...</td></tr>
            ) : posts.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-6">No posts found.</td></tr>
            ) : posts.map((post) => {
              const canPost = !post.isBuyerVisible && visibleCount < 5;
              const canCancel = post.isBuyerVisible && visibleCount > 1;
              return (
                <tr key={post._id} className="border-b hover:bg-emerald-50">
                  <td className="py-2 px-4 text-center">
                    {post.image ? <img src={post.imageUrl || `/uploads/${post.image}`} alt={post.title} className="h-16 w-16 object-cover mx-auto rounded" /> : <span className="text-gray-400">No Image</span>}
                  </td>
                  <td className="py-2 px-4 font-semibold">{post.title}</td>
                  <td className="py-2 px-4 capitalize">{post.type}</td>
                  <td className="py-2 px-4 max-w-xs truncate" title={post.content}>{post.content}</td>
                  <td className="py-2 px-4 text-center">
                    {post.isBuyerVisible ? <span className="text-emerald-700 font-bold">Visible</span> : <span className="text-gray-400">Hidden</span>}
                  </td>
                  <td className="py-2 px-4 text-center">
                    {post.isBuyerVisible ? (
                      <button
                        className={`px-4 py-1 rounded font-semibold bg-red-500 text-white hover:bg-red-600 transition disabled:opacity-50`}
                        onClick={() => handleToggleBuyerVisible(post._id, true)}
                        disabled={!canCancel}
                        title={canCancel ? "Remove from Buyer Dashboard" : "At least one post must be visible"}
                      >
                        Cancel
                      </button>
                    ) : (
                      <button
                        className={`px-4 py-1 rounded font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition disabled:opacity-50`}
                        onClick={() => handleToggleBuyerVisible(post._id, false)}
                        disabled={!canPost}
                        title={canPost ? "Show in Buyer Dashboard" : "Only 2 posts allowed at a time"}
                      >
                        Post
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BuyerPostTable;
