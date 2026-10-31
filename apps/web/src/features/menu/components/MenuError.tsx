import { ErrorState } from '@/components/ui/ErrorState';

interface MenuErrorProps {
  message: string;
  onRetry: () => void;
  retrying: boolean;
}

export function MenuError({ message, onRetry, retrying }: MenuErrorProps) {
  return <ErrorState title="Không tải được menu" message={message} onRetry={onRetry} retrying={retrying} />;
}
