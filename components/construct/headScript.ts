// Runs in <head> while the HTML parses, before the first paint.
//
// When JS runs and motion is allowed, it marks <html data-construct="pending">.
// The CSS then holds a dark canvas, so the first frame is already the
// construction layer and the paper page does not flash first. Every load of a
// document, a reload too, gets the full intro; only navigations inside the
// site get the short one. A #hash link and a back or forward load get none.
//
// Failsafe: if the app never starts, the mark drops after 3 s and the page
// shows as the server sent it. Without JS the script does not run, so nothing
// is ever hidden.

export const CONSTRUCT_HEAD_SCRIPT = `(function(){try{
var d=document.documentElement;
if(!window.matchMedia||matchMedia("(prefers-reduced-motion: reduce)").matches)return;
if(location.hash)return;
var n=performance.getEntriesByType&&performance.getEntriesByType("navigation")[0];if(n&&n.type==="back_forward")return;
var m="full";
d.setAttribute("data-construct","pending");
window.__srjConstruct={mode:m};
setTimeout(function(){if(d.getAttribute("data-construct")==="pending")d.setAttribute("data-construct","done")},3000);
}catch(e){}})()`;
