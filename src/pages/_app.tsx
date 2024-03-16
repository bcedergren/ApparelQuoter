import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@/styles/global.css';

function MyApp({ Component, pageProps }: AppProps) {
	return (
		<SessionProvider session={pageProps.session}>
			<Head>
				<title>Apparel Quoter</title>
				<meta
					name='ApparelQuoter'
					content=''
				/>
			</Head>
			<Component {...pageProps} />
		</SessionProvider>
	);
}

export default MyApp;
