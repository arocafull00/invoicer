import { cn } from '@/lib/utils';

type SpinnerProps = {
  className?: string;
};

export const Spinner = ({ className }: SpinnerProps) => {
  return (
    <div
      className={cn(
        'animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary',
        className
      )}
    />
  );
};
