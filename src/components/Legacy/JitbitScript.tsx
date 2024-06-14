'use client';

import { useEffect } from 'react';

/**
 * TIP internal jitbit integration
 */
export default function JitbitScript() {
  useEffect(() => {
    const script = document.createElement('script');

    script.src = 'https://tip.jitbit.com/helpdesk/js/support-widget-light.js';
    script.async = true;
    script.defer = true;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);
}
