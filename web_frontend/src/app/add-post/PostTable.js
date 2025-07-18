"use client";
import React, { useEffect, useState } from "react";

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleString();
};

const PostTable = () => {
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

  return (
    <div className="mt-10">
      {actionMsg && <div className="mb-4 text-center text-emerald-700 font-semibold">{actionMsg}</div>}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
          <thead>
            <tr className="bg-emerald-100 text-emerald-800">
              <th className="py-3 px-4 border-b">Image</th>
              <th className="py-3 px-4 border-b">Title</th>
              <th className="py-3 px-4 border-b">Type</th>
              <th className="py-3 px-4 border-b">Content</th>
              <th className="py-3 px-4 border-b">Created</th>
              <th className="py-3 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-6">Loading...</td></tr>
            ) : posts.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-6">No posts found.</td></tr>
            ) : posts.map((post) => (
              <tr key={post._id} className="border-b hover:bg-emerald-50">
                <td className="py-2 px-4 text-center">
                  {editingId === post._id ? (
                    <>
                      {editImagePreview && <img src={editImagePreview} alt="Preview" className="h-16 w-16 object-cover mx-auto rounded" />}
                      <input type="file" accept="image/*" onChange={handleEditImageChange} className="mt-2 w-full" />
                    </>
                  ) : (
                    post.imageUrl ? <img src={post.imageUrl} alt={post.title} className="h-16 w-16 object-cover mx-auto rounded" /> : <span className="text-gray-400">No Image</span>
                  )}
                </td>
                <td className="py-2 px-4">
                  {editingId === post._id ? (
                    <input name="title" value={editFields.title} onChange={handleEditField} className="w-full px-2 py-1 border rounded" />
                  ) : (
                    <span className="font-semibold">{post.title}</span>
                  )}
                </td>
                <td className="py-2 px-4 capitalize">
                  {editingId === post._id ? (
                    <select name="type" value={editFields.type} onChange={handleEditField} className="w-full px-2 py-1 border rounded">
                      <option value="blog">Blog</option>
                      <option value="news">News</option>
                      <option value="initiative">Initiative</option>
                    </select>
                  ) : (
                    post.type
                  )}
                </td>
                <td className="py-2 px-4">
                  {editingId === post._id ? (
                    <textarea name="content" value={editFields.content} onChange={handleEditField} rows={2} className="w-full px-2 py-1 border rounded" />
                  ) : (
                    <span className="block max-w-xs truncate" title={post.content}>{post.content}</span>
                  )}
                </td>
                <td className="py-2 px-4 text-xs text-gray-500">{formatDate(post.createdAt)}</td>
                <td className="py-2 px-4">
                  {editingId === post._id ? (
                    <>
                      <button onClick={() => handleUpdate(post._id)} className="px-3 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 mr-2">Save</button>
                      <button onClick={() => setEditingId(null)} className="px-3 py-1 bg-gray-300 text-gray-800 rounded hover:bg-gray-400">Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEdit(post)} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2">Edit</button>
                      <button onClick={() => handleDelete(post._id)} className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PostTable;
