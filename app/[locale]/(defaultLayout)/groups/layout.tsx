export default function GroupsLayout({ children }) {
    return (
        <div className="bg-secondary min-h-full">
            <div className="w-[1024px] mx-auto flex gap-x-6">
                <div className="flex-1">{children}</div>
            </div>
        </div>
    );
}
