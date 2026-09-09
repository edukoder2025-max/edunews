export default function Head() {
  return (
    <>
      <link rel="preconnect" href="https://fundingchoicesmessages.google.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://pagead2.googlesyndication.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://coin-images.coingecko.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://www.laizquierdadiario.com" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://ipapi.co" />
      <link
        rel="preload"
        href="/_next/static/css/c7e8b63cb51660f2.css"
        as="style"
        onLoad={(event) => {
          const link = event.currentTarget as HTMLLinkElement;
          link.onload = null;
          link.rel = 'stylesheet';
        }}
      />
      <noscript>
        <link rel="stylesheet" href="/_next/static/css/c7e8b63cb51660f2.css" />
      </noscript>
      {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && (
        <meta
          name="google-adsense-account"
          content={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
        />
      )}
    </>
  );
}
