"use client";

import { useEffect } from "react";

export default function WebpushrInit() {
  useEffect(() => {
    // Only run on client-side, after React hydration completes
    if (typeof window === "undefined") return;

    // Check if script already loaded
    if (typeof window.webpushr !== "undefined") return;

    // Load Webpushr script dynamically after hydration
    const script = document.createElement("script");
    script.innerHTML = `
      (function(w,d, s, id) {
        if(typeof(w.webpushr)!=='undefined') return;
        w.webpushr=w.webpushr||function(){(w.webpushr.q=w.webpushr.q||[]).push(arguments)};
        var js, fjs = d.getElementsByTagName(s)[0];
        js = d.createElement(s);
        js.id = id;
        js.async=1;
        js.src = "https://cdn.webpushr.com/app.min.js";
        fjs.parentNode.appendChild(js);
      }(window,document, 'script', 'webpushr-jssdk'));

      webpushr('setup',{'key':'BP5YqipkV7UBNSdaEs4R4pnAonDNwihhpMuAqSv1QaXDXzV1Stn-8gZ0GmaQDitOtAnQa_DlNAkPyGY1xGqplGM' });
    `;

    document.body.appendChild(script);

    return () => {
      // Cleanup if component unmounts
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return null;
}
