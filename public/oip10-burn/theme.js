(function(){"use strict";
// Runs synchronously in <head> before the stylesheet so a stored dark choice applies before first paint.
// The page defaults to light; only an explicit stored choice switches it. The system setting is never read.
try{if(localStorage.getItem("oip10-theme")==="dark"){document.documentElement.setAttribute("data-theme","dark");var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content","#0b0b0e")}}catch(e){}
})();
