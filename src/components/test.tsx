// src/components/MistakeFloater.tsx
import React, { useState, useEffect } from 'react';
import { Trash2, Edit2, Plus, X, Disc } from 'lucide-react';

// Define the type locally since we are fetching from an API now
export interface Mistake {
  id?: string;
  text: string;
  created_at?: string;
}


  const BASE_URL = import.meta.env.PUBLIC_BACKEND_URL;
  const API_URL = `${BASE_URL}/mistake`; 
const MistakeFloater = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [inputText, setInputText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // New state to toggle form visibility
  const [showInput, setShowInput] = useState(false);

  useEffect(() => {
    if (isOpen) fetchMistakes();
  }, [isOpen]);

  const fetchMistakes = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setMistakes(data);
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
      resetForm(); // This now closes the input too
      fetchMistakes();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Scrape this off the plate?')) return;
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      fetchMistakes();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (m: Mistake) => {
    setEditingId(m.id!);
    setInputText(m.text);
    setShowInput(true); // Force open the input when editing
  };

  const handleAddNew = () => {
    setEditingId(null);
    setInputText('');
    setShowInput(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setInputText('');
    setShowInput(false); // Hide input on cancel/submit
  };

  return (
    <>
      {/* 1. The Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 bg-black text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform z-50 flex items-center justify-center border-2 border-white"
      >
        <Disc size={24} />
      </button>

      {/* 2. The Popup Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            
            {/* Header */}
            <div className="bg-black text-white p-4 flex justify-between items-center shrink-0">
              <span className="font-bold text-lg tracking-wider uppercase">The Mistake Plate</span>
              <button onClick={() => setIsOpen(false)}><X size={20} /></button>
            </div>

            {/* Input Area (Conditional) */}
            <div className="bg-gray-50 border-b shrink-0 transition-all duration-300">
              {!showInput ? (
                // STATE 1: The "Plus" Button to open form
                <button 
                  onClick={handleAddNew}
                  className="w-full p-4 flex items-center justify-center gap-2 text-gray-500 hover:text-black hover:bg-gray-100 transition-colors"
                >
                  <Plus size={20} />
                  <span className="font-medium text-sm uppercase tracking-wide">Add new mistake</span>
                </button>
              ) : (
                // STATE 2: The Form
                <div className="p-4 animate-in slide-in-from-top-2 fade-in duration-200">
                  <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                    <textarea
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black focus:outline-none resize-none text-sm bg-white"
                      rows={3}
                      placeholder={editingId ? "Refine the mistake..." : "Write it down to let it go..."}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      autoFocus
                    />
                    <div className="flex justify-end gap-2">
                      <button 
                        type="button" 
                        onClick={resetForm} 
                        className="text-xs text-gray-500 hover:text-black px-2"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="bg-black text-white text-xs px-4 py-2 rounded-lg font-medium hover:bg-gray-800 flex items-center gap-1"
                      >
                        {editingId ? <Edit2 size={12}/> : <Plus size={12}/>}
                        {editingId ? 'Update' : 'Etch it'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* The List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-100">
              {loading && <div className="text-center text-xs text-gray-400">Loading...</div>}
              
              {!loading && mistakes.map((m) => (
                <div key={m.id} className="group bg-white p-3 rounded shadow-sm border border-gray-100 flex justify-between items-start hover:shadow-md transition-shadow">
                  <p className="text-gray-800 text-sm whitespace-pre-wrap leading-relaxed">{m.text}</p>
                  
                  {/* Action Icons */}
                  <div className="flex gap-1 ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(m)} className="p-1 text-gray-400 hover:text-blue-600">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(m.id!)} className="p-1 text-gray-400 hover:text-red-600">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              
              {!loading && mistakes.length === 0 && (
                <div className="text-center text-gray-400 text-sm mt-10 italic">
                  Plate is clean.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MistakeFloater;