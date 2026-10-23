import { POSTHOG_KEY, POSTHOG_API_HOST, POSTHOG_UI_HOST } from './config.js';

let enabled = false;

// Official PostHog async loader: a stub queues calls until the library from api_host takes over.
/* eslint-disable */
function loadPostHog() {
  !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
}
/* eslint-enable */

function destinationOf(href) {
  if (href.startsWith('https://admin.korza.app/create-account')) return 'signup';
  if (href.startsWith('https://wa.me/')) return 'whatsapp';
  return null;
}

// Loads PostHog only when the project key is filled (AD-004) and reports clicks on signup and WhatsApp CTAs.
export function initAnalytics(key = POSTHOG_KEY) {
  if (!key) return;
  loadPostHog();
  window.posthog.init(key, { api_host: POSTHOG_API_HOST, ui_host: POSTHOG_UI_HOST, person_profiles: 'identified_only' });
  enabled = true;
  // A blocked or failed script turns analytics off; the page keeps working.
  document.querySelector(`script[src^="${POSTHOG_API_HOST}/"]`)?.addEventListener('error', () => { enabled = false; });
  document.addEventListener('click', event => {
    const link = event.target.closest?.('a[data-track]');
    const destination = link && destinationOf(link.href);
    if (destination) track('cta_click', { location: link.dataset.track, destination });
  });
}

// Safe no-op while analytics is off or unavailable.
export function track(event, properties) {
  if (!enabled) return;
  try { window.posthog.capture(event, properties); } catch { /* analytics never breaks the page */ }
}
