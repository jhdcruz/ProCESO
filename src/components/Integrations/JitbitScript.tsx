import Script from 'next/script';

/**
 * TIP internal jitbit integration
 */
export const JitbitScript = () => (
  <Script
    async
    defer
    src="https://tip.jitbit.com/helpdesk/js/support-widget-light.js"
  />
);
