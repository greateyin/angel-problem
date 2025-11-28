'use client';

import Script from 'next/script';

export default function Analytics() {
    const gaId = process.env.NEXT_PUBLIC_GA_ID;
    const fbPixelId = process.env.NEXT_PUBLIC_FB_PIXEL_ID;
    const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;

    return (
        <>
            {/* Google Analytics */}
            {gaId && (
                <>
                    <Script
                        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
                        strategy="afterInteractive"
                    />
                    <Script id="google-analytics" strategy="afterInteractive">
                        {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}');
            `}
                    </Script>
                </>
            )}

            {/* Facebook Pixel */}
            {fbPixelId && (
                <Script id="facebook-pixel" strategy="afterInteractive">
                    {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${fbPixelId}');
            fbq('track', 'PageView');
          `}
                </Script>
            )}

            {/* Google Adsense */}
            {adsenseId && (
                <Script
                    async
                    src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
                    crossOrigin="anonymous"
                    strategy="afterInteractive"
                />
            )}
        </>
    );
}
