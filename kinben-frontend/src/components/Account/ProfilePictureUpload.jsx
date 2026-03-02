import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ProfilePictureUpload = ({ currentImage, onUpload }) => {
  const [preview, setPreview] = useState(currentImage || null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('accessToken');

  const handleFile = async (file) => {
    if (!file) return;

    // Validate file type
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      toast.error('Only JPG and PNG images are allowed');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload file
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('profileImage', file);

      const response = await axios.patch(
        `${apiUrl}/users/profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.data.profile_image_url) {
        onUpload(response.data.data.profile_image_url);
      }
      toast.success('Profile picture updated successfully');
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Failed to upload image';
      toast.error(message);
      // Revert preview on error
      setPreview(currentImage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    handleFile(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  return (
    <div className="space-y-4">
      {/* Current/Preview */}
      <div className="flex justify-center">
        <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-4 border-gray-300">
          {preview ? (
            <img src={preview} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <span className="text-4xl">👤</span>
          )}
        </div>
      </div>

      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
        }`}
      >
        <input
          type="file"
          id="profileImage"
          accept="image/jpeg,image/png"
          onChange={handleChange}
          disabled={loading}
          className="hidden"
        />

        <label htmlFor="profileImage" className="cursor-pointer">
          <div className="text-4xl mb-2">📸</div>
          <p className="font-medium text-gray-900">
            {loading ? 'Uploading...' : 'Click to upload or drag and drop'}
          </p>
          <p className="text-sm text-gray-600 mt-1">PNG or JPG (max. 5MB)</p>
        </label>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-700">
          💡 <strong>Tip:</strong> Upload a square image for best results. Minimum size 200x200px.
        </p>
      </div>
    </div>
  );
};

export default ProfilePictureUpload;
