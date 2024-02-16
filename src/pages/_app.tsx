import { SessionProvider } from 'next-auth/react'; // Import Provider from NextAuth
import type { AppProps } from 'next/app';
import Head from 'next/head';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS

function MyApp({ Component, pageProps }: AppProps) {
	return (
		<SessionProvider session={pageProps.session}>
			<Head>
				<title>Apparel Quoter</title>
				<meta
					name='description'
					content=''
				/>
			</Head>
			<Component {...pageProps} />
		</SessionProvider> // Uncomment this line
	);
}

export default MyApp;
