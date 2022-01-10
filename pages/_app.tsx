import React, { useState } from 'react'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import 'tailwindcss/tailwind.css'
import '../styles/global.scss'

export default function MyApp({ Component, pageProps }: AppProps) {

	// Context of the app
	const [context, setContext] = useState() 

	return (
		<>
			<Head>
				<title>Hexakill</title>
				<link rel="icon" href="/favicon.ico" />
				<meta name="description" content="Hexakill - a javascript + react game" />
                {/* Bootstrap Icons */}
                <link rel='stylesheet' href='https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.0/font/bootstrap-icons.css' />
                {/* Animate CSS */}
                <link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css' />
			</Head>

			<main>
				<Component {...pageProps} />
			</main>
		</>
	)
}