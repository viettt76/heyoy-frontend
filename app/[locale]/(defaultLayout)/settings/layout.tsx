import SettingsSidebar from '@/app/components/SettingsSidebar';

export default function SettingsLayout({ children }) {
    return (
        <div className="bg-gray/20 py-5 h-full max-xs:pt-2">
            <div className="flex max-xs:block max-w-[1024px] mx-auto gap-x-5">
                <SettingsSidebar />
                <div className="flex-1 max-xs:mt-3">{children}</div>
            </div>
        </div>
    );
}
