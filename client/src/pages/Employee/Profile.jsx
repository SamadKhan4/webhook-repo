import { useAuth } from '../../context/AuthContext';
import EmployeeSidebar from '../../components/EmployeeSidebar';
import { useState } from 'react';
import axios from '../../api/axios';

const Profile = () => {
  const { user, setUser } = useAuth();

  const [form, setForm] = useState({
    name: user.name || '',
    phone: user.phone || '',
    address: user.address || '',
    photo: null,
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setForm({ ...form, photo: e.target.files[0] });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('phone', form.phone);
      formData.append('address', form.address);
      if (form.photo) {
        formData.append('photo', form.photo);
      }

      const res = await axios.put(`/users/${user._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert('✅ Profile updated successfully');
      setUser(res.data);
    } catch (err) {
      alert(err.response?.data?.message || '❌ Failed to update profile');
    }
  };

  return (
    <div className="flex">
      <EmployeeSidebar />
      <div className="ml-64 p-6 w-full bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-white">
        <h2 className="text-3xl font-bold mb-8">👤 Employee Profile</h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Profile Info Card */}
         <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-md">
  <h3 className="text-2xl font-bold text-blue-700 dark:text-blue-400 mb-6 border-b pb-3">
    Profile Information
  </h3>

  <div className="flex flex-col items-center text-center">
    {user.photo ? (
      <img
        src={`http://localhost:5000/uploads/${user.photo}`}
        alt="Profile"
        className="w-28 h-28 rounded-full object-cover mb-4 border-4 border-blue-500 shadow-md hover:scale-105 transition-transform duration-300"
      />
    ) : (
      <div className="w-28 h-28 mb-4 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-2xl font-bold text-white">
        {user.name?.charAt(0).toUpperCase()}
      </div>
    )}

    <div className="space-y-2 text-left w-full">
      <p>
        <span className="font-semibold text-gray-600 dark:text-gray-400">👤 Name:</span>{' '}
        <span className="font-medium">{user.name}</span>
      </p>
      <p>
        <span className="font-semibold text-gray-600 dark:text-gray-400">📧 Email:</span>{' '}
        <span className="font-medium">{user.email}</span>
      </p>
      <p>
        <span className="font-semibold text-gray-600 dark:text-gray-400">🛡️ Role:</span>{' '}
        <span className="capitalize font-medium">{user.role}</span>
      </p>
      <p>
        <span className="font-semibold text-gray-600 dark:text-gray-400">📞 Phone:</span>{' '}
        <span className="font-medium">{user.phone || 'N/A'}</span>
      </p>
      <p>
        <span className="font-semibold text-gray-600 dark:text-gray-400">📍 Address:</span>{' '}
        <span className="font-medium">{user.address || 'N/A'}</span>
      </p>
    </div>
  </div>
</div>

          {/* Edit Form */}
          <form
            onSubmit={handleUpdate}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg space-y-4"
            encType="multipart/form-data"
          >
            <h3 className="text-xl font-semibold mb-4 border-b pb-2">Edit Profile</h3>

            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Full Name"
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Phone Number"
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Address"
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="file"
              name="photo"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-sm"
            />

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-lg font-medium transition duration-200"
            >
              💾 Update Profile
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
