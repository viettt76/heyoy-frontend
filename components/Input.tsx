import { cn } from '@/lib/utils';

export default function Input({
    value,
    className,
    placeholder,
    onChange,
}: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            className={cn('outline-none px-3 py-1 rounded-2xl', className)}
            value={value}
            placeholder={placeholder}
            onChange={onChange}
        />
    );
}
