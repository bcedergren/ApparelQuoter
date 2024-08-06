import { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { SidebarProvider } from '@/context/SidebarContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import '@/styles/global.css';
import '@/styles/app-styles.css';

function MyApp({ Component, pageProps }: AppProps) {
	const router = useRouter();

	useEffect(() => {
		// This effect is used to dynamically apply styles based on route change
		const handleRouteChange = (url: string) => {
			const appPaths = ['/app', '/app/[...slug]'];
			const isApp = appPaths.some((path) => url.startsWith(path));

			if (isApp) {
				document.body.classList.add('app-styles');
				document.body.classList.remove('public-styles');
			} else {
				document.body.classList.add('public-styles');
				document.body.classList.remove('app-styles');
			}
		};

		// Initial check on load
		handleRouteChange(router.pathname);

		// Subscribe to route changes
		router.events.on('routeChangeComplete', handleRouteChange);

		// Cleanup subscription on unmount
		return () => {
			router.events.off('routeChangeComplete', handleRouteChange);
		};
	}, [router]);

	return (
		<SessionProvider session={pageProps.session}>
			<SidebarProvider>
				<Component {...pageProps} />
			</SidebarProvider>
		</SessionProvider>
	);
}

export default MyApp;
