import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { documentsApi } from '../api/documents.api.js';
import { Spinner } from '../components/Spinner.jsx';
import { errMsg } from '../api/axios.js';

export default function Upload() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const pickFile = (f) => {
    if (!f) return;
    if (f.type !== 'application/pdf') return toast.error('Only PDF files are allowed');
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.pdf$/i, ''));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Please choose a PDF');
    setUploading(true);
    setProgress(0);
    try {
      await documentsApi.upload(file, title, setProgress);
      await qc.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Uploaded! Processing has started.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(errMsg(err, 'Upload failed'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-1 text-2xl font-bold text-slate-900">Upload a document</h1>
      <p className="mb-6 text-sm text-slate-500">PDF only · max 10MB</p>

      <form onSubmit={onSubmit} className="card space-y-5">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            pickFile(e.dataTransfer.files?.[0]);
          }}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center transition ${
            dragging ? 'border-brand-500 bg-brand-50' : 'border-slate-300 hover:border-brand-400'
          }`}
        >
          <div className="text-3xl">📄</div>
          <p className="mt-2 text-sm font-medium text-slate-700">
            {file ? file.name : 'Drag & drop a PDF, or click to browse'}
          </p>
          {file && (
            <p className="mt-1 text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            hidden
            onChange={(e) => pickFile(e.target.files?.[0])}
          />
        </div>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Title</span>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Document title" />
        </label>

        {uploading && (
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full bg-brand-600 transition-all" style={{ width: `${progress}%` }} />
          </div>
        )}

        <button className="btn-primary w-full" disabled={uploading || !file}>
          {uploading ? <Spinner /> : 'Upload & process'}
        </button>
      </form>
    </div>
  );
}
