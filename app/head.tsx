export default function Head() {
  if (!process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID) return null;

  return (
    <>
      <meta
        name="google-adsense-account"
        content={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
      />
      <script
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
        crossOrigin="anonymous"
      ></script>
    </>
  );
}
