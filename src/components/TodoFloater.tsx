import React, { useState, useEffect } from 'react';
import { Trash2, Edit2, Plus, X, ListTodo, Square, CheckSquare } from 'lucide-react';

export interface TodoEntry {
  id?: string;
  text: string;
  created_at?: string;
}

// 1. CONFIGURATION
// Ensure your .env file has PUBLIC_BACKEND_URL defined
const BASE_URL = import.meta.env.PUBLIC_BACKEND_URL;
const API_URL = `${BASE_URL}/temptodo`; 

const TodoFloater = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [entries, setEntries] = useState<TodoEntry[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [inputText, setInputText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showInput, setShowInput] = useState(false);

  // COMPLETION POPUP STATE
  // Stores the ID of the item currently being checked off for verification
  const [verifyId, setVerifyId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) fetchEntries();
  }, [isOpen]);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setEntries(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    try {
      if (editingId) {
        // UPDATE
        await fetch(`${API_URL}/${editingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: inputText })
        });
      } else {
        // CREATE
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: inputText })
        });
      }
      resetForm();
      fetchEntries();
    } catch (err) {
      console.error(err);
    }
  };

  // Logic: User clicks the checkbox -> Open confirmation popup
  const handleCheckInitiate = (id: string) => {
    setVerifyId(id); 
  };

  // Logic: User says "Yes, Completed" -> Delete from DB
  const handleConfirmCompletion = async () => {
    if (!verifyId) return;
    
    // Optimistic UI update: remove it visually immediately
    const previousEntries = [...entries];
    setEntries(entries.filter(e => e.id !== verifyId));
    
    // Close the popup
    setVerifyId(null); 

    try {
      // API Call
      await fetch(`${API_URL}/${verifyId}`, { method: 'DELETE' });
    } catch (err) {
      console.error(err);
      // Revert if API fails
      setEntries(previousEntries); 
      alert("Failed to complete task");
    }
  };

  // Standard delete (Trash icon) - Deletes without "completion" fanfare
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this task?')) return;
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      fetchEntries();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (entry: TodoEntry) => {
    setEditingId(entry.id!);
    setInputText(entry.text);
    setShowInput(true);
  };

  const handleAddNew = () => {
    setEditingId(null);
    setInputText('');
    setShowInput(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setInputText('');
    setShowInput(false);
  };

  return (
    <>
      {/* 1. The Floating Button - CENTER BOTTOM */}
      {/* 'left-1/2 -translate-x-1/2' centers it horizontally */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-blue-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform z-50 flex items-center justify-center border-4 border-white"
        title="Open Todos"
      >
        <ListTodo size={24} />
      </button>

      {/* 2. The Popup Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] relative animate-in zoom-in-95 duration-200">
            
            {/* --- COMPLETION CONFIRMATION OVERLAY --- */}
            {verifyId && (
              <div className="absolute inset-0 bg-white/95 z-20 flex flex-col items-center justify-center p-8 animate-in fade-in duration-200 text-center">
                <div className="bg-green-100 p-4 rounded-full mb-4 text-green-600">
                    <CheckSquare size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Task Complete?</h3>
                <p className="text-gray-500 mb-8 text-sm leading-relaxed">
                  Marking this as done will remove it from your list. Are you sure you're finished?
                </p>
                <div className="flex gap-3 w-full">
                    <button 
                        onClick={() => setVerifyId(null)}
                        className="flex-1 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Not yet
                    </button>
                    <button 
                        onClick={handleConfirmCompletion}
                        className="flex-1 py-3 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-lg shadow-green-200"
                    >
                        Yes, Done!
                    </button>
                </div>
              </div>
            )}

            {/* Header */}
            <div className="bg-blue-600 text-white p-4 flex justify-between items-center shrink-0">
              <span className="font-bold text-lg tracking-wider uppercase flex items-center gap-2">
                <ListTodo size={20}/> Temp Todo
              </span>
              <button 
                onClick={() => setIsOpen(false)} 
                className="hover:bg-blue-700 p-1 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Input Area (Conditional) */}
            <div className="bg-gray-50 border-b shrink-0 transition-all duration-300">
              {!showInput ? (
                <button 
                  onClick={handleAddNew}
                  className="w-full p-4 flex items-center justify-center gap-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors group"
                >
                  <Plus size={20} className="group-hover:scale-110 transition-transform"/>
                  <span className="font-medium text-sm uppercase tracking-wide">Add New Task</span>
                </button>
              ) : (
                <div className="p-4 animate-in slide-in-from-top-2 fade-in duration-200">
                  <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <textarea
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none resize-none text-sm bg-white shadow-sm"
                      rows={3}
                      placeholder={editingId ? "Update task details..." : "What do you need to do?"}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      autoFocus
                    />
                    <div className="flex justify-end gap-2">
                      <button 
                        type="button" 
                        onClick={resetForm} 
                        className="text-xs text-gray-500 hover:text-black px-3 py-2"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="bg-blue-600 text-white text-xs px-4 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-1 shadow-sm"
                      >
                        {editingId ? <Edit2 size={12}/> : <Plus size={12}/>}
                        {editingId ? 'Update' : 'Add Task'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* The List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-100 min-h-[200px]">
              {loading && (
                <div className="flex justify-center items-center h-full text-gray-400 text-sm">
                  Loading tasks...
                </div>
              )}
              
              {!loading && entries.map((entry) => (
                <div key={entry.id} className="group bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex gap-3 items-start hover:shadow-md transition-shadow">
                  
                  {/* CHECKBOX TRIGGER */}
                  <button 
                    onClick={() => handleCheckInitiate(entry.id!)}
                    className="mt-0.5 text-gray-300 hover:text-green-600 transition-colors"
                    title="Mark as complete"
                  >
                    <Square size={22} />
                  </button>

                  <p className="flex-1 text-gray-800 text-sm whitespace-pre-wrap leading-relaxed pt-1">
                    {entry.text}
                  </p>
                  
                  {/* Action Icons */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(entry)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(entry.id!)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              
              {!loading && entries.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <ListTodo size={40} className="mb-2 opacity-20"/>
                  <span className="text-sm italic">No active tasks.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TodoFloater;