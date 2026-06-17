import { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

import { useDocument } from '../hooks/useDocuments.js';
import { useChats, useAskQuestion, useDeleteChat } from '../hooks/useChat.js';
import { Spinner } from '../components/Spinner.jsx';
import { CardSkeleton } from '../components/Skeleton.jsx';
import { errMsg } from '../api/axios.js';

export default function Chat() {
  const { id } = useParams();
  const { data: doc } = useDocument(id);
  const { data: chatData, isLoading } = useChats(id);
  const ask = useAskQuestion(id);
  const delChat = useDeleteChat(id);

  const [question, setQuestion] = useState('');
  const bottomRef = useRef(null);

  const messages = [...(chatData?.items || [])].reverse();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, ask.isPending]);

  const onSubmit = async (e) => {
    e.preventDefault();
    const q = question.trim();
    if (!q) return;
    setQuestion('');
    try {
      await ask.mutateAsync(q);
    } catch (err) {
      toast.error(errMsg(err, 'Failed to get an answer'));
    }
  };

  const onDelete = async (chatId) => {
    try {
      await delChat.mutateAsync(chatId);
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-7rem)] max-w-3xl flex-col">
      <div className="mb-4">
        <Link to={`/documents/${id}`} className="text-sm text-brand-600 hover:underline">
          ← {doc?.title || 'Document'}
        </Link>
        <h1 className="text-xl font-bold text-slate-900">Ask this document</h1>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto pr-1">
        {isLoading && <CardSkeleton />}
        {!isLoading && messages.length === 0 && (
          <p className="py-10 text-center text-sm text-slate-400">
            No questions yet. Ask something about “{doc?.title}”.
          </p>
        )}

        {messages.map((m) => (
          <div key={m._id} className="space-y-2">
            <div className="flex justify-end">
              <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-brand-600 px-4 py-2 text-sm text-white">
                {m.question}
              </div>
            </div>
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-white px-4 py-3 text-sm text-slate-700 shadow-sm ring-1 ring-slate-100">
                <p className="whitespace-pre-wrap">{m.answer}</p>
                {m.sources?.length > 0 && (
                  <details className="mt-2 text-xs text-slate-500">
                    <summary className="cursor-pointer select-none">
                      {m.sources.length} source{m.sources.length > 1 ? 's' : ''}
                    </summary>
                    <ul className="mt-2 space-y-1">
                      {m.sources.map((s, i) => (
                        <li key={i} className="rounded bg-slate-50 p-2">
                          <span className="font-medium">#{s.chunkIndex}</span> — {s.text}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
                <button
                  onClick={() => onDelete(m._id)}
                  className="mt-2 text-xs text-slate-400 hover:text-rose-500"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {ask.isPending && (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Spinner className="h-4 w-4" /> Thinking…
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={onSubmit} className="mt-4 flex gap-2">
        <input
          className="input"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question about this document…"
          disabled={ask.isPending}
        />
        <button className="btn-primary" disabled={ask.isPending || !question.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}
