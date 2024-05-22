import { createContext, useState, ReactNode, useContext } from 'react';

interface SidebarContextProps {
	collapsed: boolean;
	toggleCollapse: () => void;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
	undefined
);

export const SidebarProvider = ({ children }: { children: ReactNode }) => {
	const [collapsed, setCollapsed] = useState(false);

	const toggleCollapse = () => {
		setCollapsed((prevState) => !prevState);
	};

	return (
		<SidebarContext.Provider value={{ collapsed, toggleCollapse }}>
			{children}
		</SidebarContext.Provider>
	);
};

export const useSidebar = () => {
	const context = useContext(SidebarContext);
	if (context === undefined) {
		throw new Error('useSidebar must be used within a SidebarProvider');
	}
	return context;
};
