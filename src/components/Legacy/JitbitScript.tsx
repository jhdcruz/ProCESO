import { memo } from 'react';

/**
 * TIP internal jitbit integration
 */
function JitbitScript() {
  return (
    <script
      defer
      src="https://tip.jitbit.com/helpdesk/js/support-widget-light.js"
      type="text/javascript"
    />
  );
}

export default memo(JitbitScript);
