'use client';
import React, { useState } from 'react';

import PostTable from './PostTable';

function AddPost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState('blog');
  const [message, setMessage] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('type', type);
      if (image) {
        formData.append('image', image);
      }
      const response = await fetch('http://localhost:5000/api/posts/add', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('Post created successfully!');
        setTitle('');
        setContent('');
        setType('blog');
        setImage(null);
        setImagePreview(null);
      } else {
        setMessage(data.message || 'Error creating post.');
      }
    } catch (error) {
      setMessage('Error connecting to server.');
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-12 p-8 bg-white rounded-xl shadow-lg border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-emerald-700 text-center">Add Blog / News / Initiative</h2>
      <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
            placeholder="Enter title"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Image (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
          {imagePreview && (
            <img src={imagePreview} alt="Preview" className="mt-2 max-h-48 rounded-lg border border-gray-200 shadow" />
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            required
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
            placeholder="Write your content here..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select
            value={type}
            onChange={e => setType(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            <option value="blog">Blog</option>
            <option value="news">News</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-md transition duration-200"
        >
          Submit
        </button>
      </form>
      {message && (
        <div
          className={`mt-6 text-center font-medium ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}
        >
          {message}
        </div>
      )}
    </div>
  );
}


export default function AddPostPage() {
  const [section, setSection] = useState(null); // null, 'add', 'view', 'buyer'
  const BuyerPostTable = React.lazy(() => import('./BuyerPostTable'));

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-green-100 via-green-200 to-emerald-100 flex items-center justify-center py-10">
      <div className="max-w-5xl w-full mx-auto p-8 rounded-2xl shadow-2xl backdrop-blur-md bg-white/60 border border-white/40 flex flex-col items-center">
        {section === null && (
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-8 w-full">
            <h1 className="text-3xl font-extrabold text-emerald-700 mb-8 drop-shadow-md">Admin Blog/News Management</h1>
            <div className="flex flex-col sm:flex-row gap-8 w-full justify-center">
              <button
                className="px-10 py-4 rounded-lg font-semibold text-lg bg-emerald-600 text-white shadow-md hover:bg-emerald-700 transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-300 w-full sm:w-auto"
                onClick={() => setSection('add')}
              >
                Add Post
              </button>
              <button
                className="px-10 py-4 rounded-lg font-semibold text-lg bg-cyan-600 text-white shadow-md hover:bg-cyan-700 transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-cyan-300 w-full sm:w-auto"
                onClick={() => setSection('view')}
              >
                View Posts
              </button>
              <button
                className="px-10 py-4 rounded-lg font-semibold text-lg bg-amber-600 text-white shadow-md hover:bg-amber-700 transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-amber-300 w-full sm:w-auto"
                onClick={() => setSection('buyer')}
              >
                Publish post
              </button>
            </div>
          </div>
        )}
        {section === 'add' && (
          <div className="w-full flex flex-col items-center">
            <button
              className="mb-6 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-150 shadow self-start"
              onClick={() => setSection(null)}
            >
              ← Back
            </button>
            <AddPost />
          </div>
        )}
        {section === 'view' && (
          <div className="w-full flex flex-col items-center">
            <button
              className="mb-6 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-150 shadow self-start"
              onClick={() => setSection(null)}
            >
              ← Back
            </button>
            <PostTable />
          </div>
        )}
        {section === 'buyer' && (
          <div className="w-full flex flex-col items-center">
            <button
              className="mb-6 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-150 shadow self-start"
              onClick={() => setSection(null)}
            >
              ← Back
            </button>
            <React.Suspense fallback={<div>Loading...</div>}>
              <BuyerPostTable />
            </React.Suspense>
          </div>
        )}
      </div>
    </div>
  );
}

