"use client";
import React, { useEffect, useState } from "react";

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editFields, setEditFields] = useState({});
  const [editImage, setEditImage] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);
  const [actionMsg, setActionMsg] = useState("");

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/posts");
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    setActionMsg("");
    try {
      const res = await fetch(`http://localhost:5000/api/posts/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setActionMsg("Post deleted successfully.");
        fetchPosts();
      } else {
        setActionMsg(data.message || "Delete failed.");
      }
    } catch {
      setActionMsg("Delete failed.");
    }
  };

  const handleEdit = (post) => {
    setEditingId(post._id);
    setEditFields({ title: post.title, content: post.content, type: post.type });
    setEditImagePreview(post.imageUrl || null);
    setEditImage(null);
  };

  const handleEditField = (e) => {
    setEditFields({ ...editFields, [e.target.name]: e.target.value });
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    setEditImage(file);
    if (file) {
      setEditImagePreview(URL.createObjectURL(file));
    } else {
      setEditImagePreview(null);
    }
  };

  const handleUpdate = async (id) => {
    setActionMsg("");
    try {
      const formData = new FormData();
      formData.append("title", editFields.title);
      formData.append("content", editFields.content);
      formData.append("type", editFields.type);
      if (editImage) formData.append("image", editImage);
      const res = await fetch(`http://localhost:5000/api/posts/${id}`, {
        method: "PUT",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setActionMsg("Post updated successfully.");
        setEditingId(null);
        fetchPosts();
      } else {
        setActionMsg(data.message || "Update failed.");
      }
    } catch {
      setActionMsg("Update failed.");
    }
  };

  if (loading) return <div className="text-center py-8">Loading posts...</div>;
  if (!posts.length) return <div className="text-center py-8">No posts found.</div>;

  return (
    <div className="mt-12 space-y-8">
      {actionMsg && <div className="text-center text-emerald-700 font-semibold mb-4">{actionMsg}</div>}
      {posts.map((post) => (
        <div
          key={post._id}
          className="bg-white rounded-xl shadow border border-gray-100 p-6 flex flex-col md:flex-row gap-6"
        >
          {editingId === post._id ? (
            <>
              {editImagePreview && (
                <img src={editImagePreview} alt="Preview" className="w-full md:w-48 h-48 object-cover rounded-lg border mb-4" />
              )}
              <div className="flex-1 space-y-2">
                <input
                  name="title"
                  value={editFields.title}
                  onChange={handleEditField}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2"
                />
                <select
                  name="type"
                  value={editFields.type}
                  onChange={handleEditField}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2"
                >
                  <option value="blog">Blog</option>
                  <option value="news">News</option>
                  <option value="initiative">Initiative</option>
                </select>
                <textarea
                  name="content"
                  value={editFields.content}
                  onChange={handleEditField}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleEditImageChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2"
                />
                <div className="flex gap-3 mt-2">
                  <button
                    onClick={() => handleUpdate(post._id)}
                    className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full md:w-48 h-48 object-cover rounded-lg border mb-4"
                />
              )}
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-emerald-700 mb-2">{post.title}</h3>
                <div className="text-sm text-gray-500 mb-1 capitalize">{post.type}</div>
                <div className="text-gray-700 mb-2 whitespace-pre-line">{post.content}</div>
                <div className="text-xs text-gray-400 mb-3">{new Date(post.createdAt).toLocaleString()}</div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleEdit(post)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(post._id)}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default PostList;
