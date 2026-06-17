export default function ErrorState({ message = 'Failed to load.', onRetry }) {
  return (
    <div className="card border-rose-200 bg-rose-50 text-center">
      <p className="text-sm font-medium text-rose-700">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-ghost mt-3">
          Try again
        </button>
      )}
    </div>
  );
}
