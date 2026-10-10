/* Digital Credentials Commons: site behavior */
/* Feature flags. sampleCredential turns the "Get a sample credential" button and the
   "Try it yourself" block on or off together. */
var FEATURES = { sampleCredential: false };

/* "Get in touch" submissions go to the "Getting Involved with DCC" Google Form.
   Entry IDs come from the form's "Get pre-filled link". The checkbox values in index.html
   must match the form's options exactly, and the form requires a name, an email and at
   least one choice in each checkbox question. Add a short-answer "source" question to the
   form and put its ID in `source` to record ?src= links. */
var GOOGLE_FORM = {
  action: "https://docs.google.com/forms/d/e/1FAIpQLSdSKOHvGRTa11kynfITDm0HUtcfF0lZBmHEC3kPwDDIwnD5HA/formResponse",
  entries: { name:"entry.643252456", email:"entry.919152693", org:"entry.1706988591", interest:"entry.1988524056", note:"entry.593582980", source:"" }
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
  function play(){
    var t = 600;
    items.forEach(function(li){ setTimeout(function(){ li.classList.add("ok"); }, t); t += 650; });
    setTimeout(finish, t);
  }
  if (!("IntersectionObserver" in window)) { play(); return; }
  var seen = new IntersectionObserver(function(entries){
    if (entries[0].isIntersecting) { seen.disconnect(); play(); }
  }, { threshold: 0.6 });
  seen.observe(box);
})();

var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function setStatus(el, msg, kind){ el.textContent = msg; el.className = "status" + (kind ? " " + kind : ""); }

/* Show a validation message right under the field it's about, so it stays in view
   on a phone when focus moves there. */
function fieldError(input, msg){
  var field = input.closest(".field"), p = document.createElement("p");
  p.className = "field-error"; p.id = input.id + "-error"; p.textContent = msg;
  p.setAttribute("role", "alert");
  /* Above the input (under its label or question), so a phone keyboard opening
     below the focused field doesn't cover it. */
  var head = field.querySelector("legend") || field.querySelector("label");
  if (head && input.type === "checkbox") head.after(p); else input.before(p);
  (input.type === "checkbox" ? field : input).setAttribute("aria-describedby", p.id);
  p.scrollIntoView({ block: "center" });
  input.focus({ preventScroll: true });
}
function clearErrors(scope){
  scope.querySelectorAll(".field-error").forEach(function(p){ p.remove(); });
  scope.querySelectorAll("[aria-describedby]").forEach(function(i){ i.removeAttribute("aria-describedby"); });
}
/* Clear a field's error as soon as it's corrected. */
document.getElementById("contactForm").addEventListener("input", function(e){
  var field = e.target.closest(".field");
  if (field && field.querySelector(".field-error")) clearErrors(field);
});

document.querySelectorAll("input[data-other]").forEach(function(box){
  var text = document.getElementById(box.dataset.other);
  box.addEventListener("change", function(){
    text.hidden = !box.checked;
    if (box.checked) text.focus(); else text.value = "";
  });
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
  var f = e.target, status = document.getElementById("contactStatus"), send = f.querySelector('button[type="submit"]');
  if (f.trap.value || send.disabled) return;
  clearErrors(f); setStatus(status, "");
  var name = f.name.value.trim(), email = f.email.value.trim();
  if (!name) { fieldError(f.name, "Add your name so we know who to reply to."); return; }
  if (!EMAIL_RE.test(email)) { fieldError(f.email, "Enter an email address, like name@example.org."); return; }
  if (!f.querySelector('input[name="org"]:checked')) { fieldError(f["f-org-1"], "Choose at least one option."); return; }
  if (!f.querySelector('input[name="interest"]:checked')) { fieldError(f["f-int-1"], "Choose at least one option."); return; }
  var emptyOther = Array.prototype.find.call(f.querySelectorAll("input[data-other]:checked"), function(box){
    return !document.getElementById(box.dataset.other).value.trim();
  });
  if (emptyOther) { fieldError(document.getElementById(emptyOther.dataset.other), "Add a short description, or uncheck Other."); return; }
  var E = GOOGLE_FORM.entries;
  if (!GOOGLE_FORM.action || !E.name || !E.email || !E.org || !E.interest || !E.note) {
    setStatus(status, "Draft: the form isn't connected yet. On the live site, this sends your details to the team.", "ok");
    return;
  }
  var data = new URLSearchParams();
  data.append(E.name, name);
  data.append(E.email, email);
  f.querySelectorAll('input[name="org"]:checked').forEach(function(c){ data.append(E.org, c.value); });
  if (f["f-org-other"].checked && f.orgOther.value.trim()) data.append(E.org + ".other_option_response", f.orgOther.value.trim());
  f.querySelectorAll('input[name="interest"]:checked').forEach(function(c){ data.append(E.interest, c.value); });
  if (f["f-int-other"].checked && f.intOther.value.trim()) data.append(E.interest + ".other_option_response", f.intOther.value.trim());
  if (f.note.value.trim()) data.append(E.note, f.note.value.trim());
  var src = new URLSearchParams(location.search).get("src");
  if (src && E.source) data.append(E.source, src);
  var label = send.textContent;
  send.disabled = true; send.textContent = "Sending\u2026";
  fetch(GOOGLE_FORM.action, { method:"POST", mode:"no-cors", body:data })
    .then(function(){ f.reset(); f.querySelectorAll(".other-text").forEach(function(t){ t.hidden = true; });
      setStatus(status, "Thanks, " + name.split(" ")[0] + ". We'll be in touch.", "ok"); })
    .catch(function(){ setStatus(status, "That didn't go through. Check your connection and try again.", "err"); })
    .then(function(){ send.disabled = false; send.textContent = label; });
});
