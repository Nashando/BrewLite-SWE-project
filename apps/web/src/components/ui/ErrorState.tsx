import { Button } from './Button';

interface ErrorStateProps {
  title: string;
  message: string;
  onRetry: () => void;
  retrying: boolean;
}

export function ErrorState({ title, message, onRetry, retrying }: ErrorStateProps) {
  return (
    <div role="alert" className="flex flex-col items-center px-6 py-16 text-center">
      <h2 className="font-display text-xl font-semibold text-danger">{title}</h2>
      <p className="mt-2 max-w-xs text-ink/70">{message}</p>
      <Button className="mt-6" onClick={onRetry} disabled={retrying}>
        {retrying ? 'Đang thử lại…' : 'Thử lại'}
      </Button>
    </div>
  );
}
