'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function CourseManager() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [durationHours, setDurationHours] = useState('');
  const [modules, setModules] = useState([{ id: '1', title: '', content: '', duration: '' }]);

  const addModule = () => {
    setModules([...modules, { id: Date.now().toString(), title: '', content: '', duration: '' }]);
  };

  const updateModule = (id: string, field: string, value: string) => {
    setModules(modules.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const removeModule = (id: string) => {
    setModules(modules.filter(m => m.id !== id));
  };

  const createCourse = async () => {
    const response = await fetch('/api/admin/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description,
        category,
        durationHours: parseFloat(durationHours),
        modules
      })
    });
    
    if (response.ok) {
      alert('Course created successfully!');
      setTitle('');
      setDescription('');
      setCategory('');
      setDurationHours('');
      setModules([{ id: '1', title: '', content: '', duration: '' }]);
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Create Course</h2>
      
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border rounded"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Duration (hours)</label>
          <input
            type="number"
            value={durationHours}
            onChange={(e) => setDurationHours(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Modules</h3>
          <Button onClick={addModule} size="sm">Add Module</Button>
        </div>
        
        {modules.map((module, idx) => (
          <Card key={module.id} className="p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">Module {idx + 1}</span>
              {modules.length > 1 && (
                <Button onClick={() => removeModule(module.id)} variant="destructive" size="sm">Remove</Button>
              )}
            </div>
            <input
              type="text"
              placeholder="Module title"
              value={module.title}
              onChange={(e) => updateModule(module.id, 'title', e.target.value)}
              className="w-full p-2 border rounded"
            />
            <textarea
              placeholder="Module content"
              value={module.content}
              onChange={(e) => updateModule(module.id, 'content', e.target.value)}
              className="w-full p-2 border rounded"
              rows={2}
            />
            <input
              type="text"
              placeholder="Duration (e.g., 30 mins)"
              value={module.duration}
              onChange={(e) => updateModule(module.id, 'duration', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </Card>
        ))}
      </div>

      <Button onClick={createCourse} className="w-full">Create Course</Button>
    </Card>
  );
}
