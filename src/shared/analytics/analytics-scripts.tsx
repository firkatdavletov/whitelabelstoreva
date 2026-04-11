import Script from "next/script";

import { env } from "@/shared/config/env";

function createGoogleAnalyticsSnippet(googleAnalyticsId: string) {
  return `
    window.dataLayer = window.dataLayer || [];
    function gtag(){window.dataLayer.push(arguments);}
    window.gtag = window.gtag || gtag;
    gtag('js', new Date());
    gtag('config', '${googleAnalyticsId}', { send_page_view: false });
  `;
}

function createMetaPixelSnippet(metaPixelId: string) {
  return `
    !function(f,b,e,v,n,t,s){
      if(f.fbq)return;
      n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;
      n.push=n;
      n.loaded=!0;
      n.version='2.0';
      n.queue=[];
      t=b.createElement(e);
      t.async=!0;
      t.src=v;
      s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${metaPixelId}');
  `;
}

function createYandexMetrikaSnippet(yandexMetrikaId: string) {
  return `
    window.dataLayer = window.dataLayer || [];
    (function(m,e,t,r,i,k,a){
      m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
      m[i].l=1*new Date();
      for (var j = 0; j < document.scripts.length; j += 1) {
        if (document.scripts[j].src === r) {
          return;
        }
      }
      k=e.createElement(t);
      a=e.getElementsByTagName(t)[0];
      k.async=1;
      k.src=r;
      a.parentNode.insertBefore(k,a);
    })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');
    ym(${yandexMetrikaId}, 'init', {
      accurateTrackBounce: true,
      clickmap: true,
      ecommerce: 'dataLayer',
      trackLinks: true,
      webvisor: true,
    });
  `;
}

export function AnalyticsScripts() {
  const googleAnalyticsId = env.NEXT_PUBLIC_GA_ID;
  const metaPixelId = env.NEXT_PUBLIC_META_PIXEL_ID;
  const yandexMetrikaId = env.NEXT_PUBLIC_YANDEX_METRIKA_ID;

  return (
    <>
      {googleAnalyticsId ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
            strategy="afterInteractive"
          />
          <Script id="storeva-ga4" strategy="afterInteractive">
            {createGoogleAnalyticsSnippet(googleAnalyticsId)}
          </Script>
        </>
      ) : null}

      {metaPixelId ? (
        <Script id="storeva-meta-pixel" strategy="afterInteractive">
          {createMetaPixelSnippet(metaPixelId)}
        </Script>
      ) : null}

      {yandexMetrikaId ? (
        <Script id="storeva-yandex-metrika" strategy="afterInteractive">
          {createYandexMetrikaSnippet(yandexMetrikaId)}
        </Script>
      ) : null}
    </>
  );
}
