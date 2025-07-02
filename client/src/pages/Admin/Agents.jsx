import { useEffect, useState } from 'react';
import axios from '../../api/axios';
import AdminSidebar from '../../components/AdminSidebar';
import { Trash2, Pencil } from 'lucide-react';

const Agents = () => {
  const [agents, setAgents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [newAgent, setNewAgent] = useState({ name: '', email: '', phone: '' });
  const [editAgent, setEditAgent] = useState(null);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/agents');
      setAgents(res.data);
    } catch {
      alert('❌ Failed to fetch agents');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (search.trim() === '') return;
    setLoading(true);
    try {
      const res = await axios.get(`/agents/search?name=${search}`);
      setAgents(res.data);
    } catch {
      alert('❌ Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAgent = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/agents', newAgent);
      alert('✅ Agent added');
      setNewAgent({ name: '', email: '', phone: '' });
      fetchAgents();
    } catch {
      alert('❌ Failed to add agent');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this agent?')) return;
    try {
      await axios.delete(`/agents/${id}`);
      fetchAgents();
    } catch {
      alert('❌ Failed to delete agent');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/agents/${editAgent._id}`, editAgent);
      alert('✅ Agent updated');
      setEditAgent(null);
      fetchAgents();
    } catch {
      alert('❌ Failed to update agent');
    }
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="ml-64 p-6 w-full bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-800 dark:text-white">
        <h2 className="text-2xl font-bold mb-6">Agent Management</h2>

        <form onSubmit={handleAddAgent} className="bg-white dark:bg-gray-800 p-6 rounded shadow mb-6 max-w-xl space-y-3">
          <h3 className="text-lg font-semibold">Add New Agent</h3>
          <input
            type="text"
            placeholder="Name"
            value={newAgent.name}
            onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
            className="w-full p-2 border rounded bg-white dark:bg-gray-900 dark:border-gray-700"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={newAgent.email}
            onChange={(e) => setNewAgent({ ...newAgent, email: e.target.value })}
            className="w-full p-2 border rounded bg-white dark:bg-gray-900 dark:border-gray-700"
          />
          <input
            type="tel"
            placeholder="Phone"
            value={newAgent.phone}
            onChange={(e) => setNewAgent({ ...newAgent, phone: e.target.value })}
            className="w-full p-2 border rounded bg-white dark:bg-gray-900 dark:border-gray-700"
          />
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Add Agent
          </button>
        </form>

        <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
          <input
            type="text"
            placeholder="Search agent by name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded w-full sm:w-72 bg-white dark:bg-gray-800"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSearch}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Search
            </button>
            <button
              onClick={() => {
                setSearch('');
                fetchAgents();
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Reset
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-center text-lg font-medium">Loading...</p>
        ) : agents.length === 0 ? (
          <p className="text-center text-lg font-medium text-red-500">No agents found.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent) => (
              <div key={agent._id} className="bg-white dark:bg-gray-800 p-4 shadow rounded border dark:border-gray-700">
                <h3 className="text-xl font-semibold text-blue-800 dark:text-blue-300">{agent.name}</h3>
                <p>Email: {agent.email || 'N/A'}</p>
                <p>Phone: {agent.phone || 'N/A'}</p>
                <p className="mt-2"><strong>Total Bills:</strong> {agent.totalBills || 0}</p>
                <p><strong>Total Commission:</strong> <span className="text-green-700 font-bold">₹{(agent.totalCommission || 0).toFixed(2)}</span></p>
                <div className="flex gap-3 mt-3">
                  <button
                    onClick={() => setEditAgent(agent)}
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <Pencil className="w-4 h-4" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(agent._id)}
                    className="text-red-600 hover:text-red-800 flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {editAgent && (
          <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Edit Agent</h3>
              <form onSubmit={handleEditSubmit} className="space-y-3">
                <input
                  type="text"
                  value={editAgent.name}
                  onChange={(e) => setEditAgent({ ...editAgent, name: e.target.value })}
                  className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-700"
                  required
                />
                <input
                  type="email"
                  value={editAgent.email}
                  onChange={(e) => setEditAgent({ ...editAgent, email: e.target.value })}
                  className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-700"
                />
                <input
                  type="text"
                  value={editAgent.phone}
                  onChange={(e) => setEditAgent({ ...editAgent, phone: e.target.value })}
                  className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-700"
                />
                <div className="flex justify-between mt-4">
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Update
                  </button>
                  <button type="button" onClick={() => setEditAgent(null)} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Agents;
