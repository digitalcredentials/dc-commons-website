/* Digital Credentials Commons: site behavior */
/* Feature flags. sampleCredential turns the "Get a sample credential" button and the
   "Try it yourself" block on or off together. */
var FEATURES = { sampleCredential: false };

/* Submissions go to a Google Form. Fill in the form's formResponse URL and each question's
   entry ID (from the form's "Get pre-filled link"). Until then the forms run in draft mode. */
var GOOGLE_FORM = {
  action: "",                 // https://docs.google.com/forms/d/e/<FORM_ID>/formResponse
  entries: { name:"", email:"", org:"", orgOther:"", interest:"", intOther:"", note:"", source:"" }
};
var SAMPLE_ENDPOINT = "";     // the service that emails a sample credential

/* Apply feature flags. */
document.getElementById("page").dataset.sample = FEATURES.sampleCredential ? "on" : "off";

/* Hero: the three checks tick in once and the credential settles on Verified. */
(function(){
  var box = document.getElementById("verify"), status = document.getElementById("verifyStatus");
  var items = box.querySelectorAll(".verify-list li");
  function finish(){ box.classList.add("done"); status.textContent = "Verified"; }
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    items.forEach(function(li){ li.classList.add("ok"); }); finish(); return;
  }
  var t = 900;
  items.forEach(function(li){ setTimeout(function(){ li.classList.add("ok"); }, t); t += 650; });
  setTimeout(finish, t);
})();

var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function setStatus(el, msg, kind){ el.textContent = msg; el.className = "status" + (kind ? " " + kind : ""); }

document.querySelectorAll("input[data-other]").forEach(function(box){
  var text = document.getElementById(box.dataset.other);
  box.addEventListener("change", function(){ text.hidden = !box.checked; if (box.checked) text.focus(); });
});

document.getElementById("sampleForm").addEventListener("submit", function(e){
  e.preventDefault();
  var name = document.getElementById("sample-name").value.trim();
  var email = document.getElementById("sample-email").value.trim();
  var status = document.getElementById("sampleStatus");
  if (!name) { setStatus(status, "Add your name. It goes on the credential.", "err"); return; }
  if (!EMAIL_RE.test(email)) { setStatus(status, "Enter an email address, like name@example.org.", "err"); return; }
  if (!SAMPLE_ENDPOINT) { setStatus(status, "Draft: sending isn't connected yet. On the live site, the credential goes to " + email + ".", "ok"); return; }
  fetch(SAMPLE_ENDPOINT, { method:"POST", headers:{ "Content-Type":"text/plain" }, body: JSON.stringify({ name: name, email: email }) })
    .then(function(r){ if (!r.ok) throw new Error(); setStatus(status, "Sent. Check " + email + " for your sample credential.", "ok"); })
    .catch(function(){ setStatus(status, "We couldn't send it just now. Try again in a minute.", "err"); });
});

document.getElementById("contactForm").addEventListener("submit", function(e){
  e.preventDefault();
  var f = e.target, status = document.getElementById("contactStatus");
  if (f.website.value) return;
  var name = f.name.value.trim(), email = f.email.value.trim();
  if (!name) { setStatus(status, "Add your name so we know who to reply to.", "err"); f.name.focus(); return; }
  if (!EMAIL_RE.test(email)) { setStatus(status, "Enter an email address, like name@example.org.", "err"); f.email.focus(); return; }
  if (!GOOGLE_FORM.action) {
    setStatus(status, "Draft: the form isn't connected yet. On the live site, this sends your details to the team.", "ok");
    return;
  }
  var E = GOOGLE_FORM.entries, data = new URLSearchParams();
  data.append(E.name, name);
  data.append(E.email, email);
  f.querySelectorAll('input[name="org"]:checked').forEach(function(c){ data.append(E.org, c.value); });
  if (f.orgOther.value.trim()) data.append(E.org + ".other_option_response", f.orgOther.value.trim());
  f.querySelectorAll('input[name="interest"]:checked').forEach(function(c){ data.append(E.interest, c.value); });
  if (f.intOther.value.trim()) data.append(E.interest + ".other_option_response", f.intOther.value.trim());
  if (f.note.value.trim()) data.append(E.note, f.note.value.trim());
  var src = new URLSearchParams(location.search).get("src");
  if (src && E.source) data.append(E.source, src);
  fetch(GOOGLE_FORM.action, { method:"POST", mode:"no-cors", body:data })
    .then(function(){ f.reset(); f.querySelectorAll(".other-text").forEach(function(t){ t.hidden = true; });
      setStatus(status, "Thanks, " + name.split(" ")[0] + ". We'll be in touch.", "ok"); })
    .catch(function(){ setStatus(status, "That didn't go through. Check your connection and try again.", "err"); });
});
