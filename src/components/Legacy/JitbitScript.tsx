import { memo } from 'react';

/**
 * TIP internal jitbit integration
 */
function JitbitScript() {
  return (
    <script
      type="text/javascript"
      src="https://tip.jitbit.com/helpdesk/js/support-widget-light.js"
      defer
    />
  );
}

export default memo(JitbitScript);
