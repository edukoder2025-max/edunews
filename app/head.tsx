export default function Head() {
  return (
    <>
      {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && (
        <>
          <meta
            name="google-adsense-account"
            content={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
          />
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
            crossOrigin="anonymous"
          />
        </>
      )}
    </>
  );
}
