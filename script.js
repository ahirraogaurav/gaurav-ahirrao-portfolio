/* ===== SETTINGS YOU CAN EDIT ===== */
const ROLES = ["AI/ML Engineer","Python Developer","Problem Solver"]; // rotating titles on home page

/* ===== DARK / LIGHT MODE (remembers choice, defaults to system setting) ===== */
const root = document.documentElement, themeBtn = document.getElementById("themeBtn");
function setTheme(t){
  root.dataset.theme = t;
  themeBtn.textContent = t === "dark" ? "☀️" : "🌙";
  try{ localStorage.setItem("theme", t); }catch(e){}
}
let saved = null; try{ saved = localStorage.getItem("theme"); }catch(e){}
setTheme(saved || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
themeBtn.onclick = () => setTheme(root.dataset.theme === "dark" ? "light" : "dark");

/* ===== MOBILE MENU ===== */
const links = document.getElementById("links");
document.getElementById("menuBtn").onclick = () => links.classList.toggle("open");
links.querySelectorAll("a").forEach(a => a.onclick = () => links.classList.remove("open"));

/* ===== TYPING EFFECT ===== */
const typed = document.getElementById("typed"); let r = 0, c = 0, del = false;
(function type(){
  const word = ROLES[r];
  typed.textContent = word.slice(0, c);
  if(!del && c === word.length){ del = true; return setTimeout(type, 1400); }
  if(del && c === 0){ del = false; r = (r + 1) % ROLES.length; }
  c += del ? -1 : 1;
  setTimeout(type, del ? 40 : 90);
})();

/* ===== ANIMATE COUNTERS + SKILL BARS WHEN VISIBLE ===== */
const io = new IntersectionObserver(es => es.forEach(e => {
  if(!e.isIntersecting) return;
  const el = e.target;
  if(el.dataset.level) el.style.width = el.dataset.level + "%";
  if(el.dataset.n){
    const end = +el.dataset.n; let n = 0;
    const t = setInterval(() => { n++; el.textContent = n + "+"; if(n >= end) clearInterval(t); }, 90);
  }
  io.unobserve(el);
}), {threshold:.4});
document.querySelectorAll("[data-level],[data-n]").forEach(el => io.observe(el));

/* ===== FILTERS (skills + projects): each button row filters the grid right after it ===== */
document.querySelectorAll(".filters").forEach(bar => {
  const grid = bar.nextElementSibling.classList.contains("grid") ? bar.nextElementSibling : bar.nextElementSibling.nextElementSibling;
  bar.querySelectorAll("button").forEach(b => b.onclick = () => {
    bar.querySelectorAll("button").forEach(x => x.classList.remove("on"));
    b.classList.add("on");
    grid.querySelectorAll(".card").forEach(card => {
     card.style.display = (b.dataset.f === "all" || card.dataset.cat.split(" ").includes(b.dataset.f)) ? "" : "none";
    });
  });
});

/* ===== PROJECT DETAILS POP-UP ===== */
const modal = document.getElementById("modal"), box = document.getElementById("modalBox");
document.querySelectorAll("[data-open]").forEach(btn => btn.onclick = () => {
  const card = btn.closest(".proj");
  box.innerHTML = `<img src="${card.querySelector(".thumb").src}" alt=""><div class="in"><button class="mclose" aria-label="Close">✕</button>
    <h3>${card.querySelector("h3").innerHTML}</h3><div class="tags">${card.querySelector(".tags").innerHTML}</div>${card.querySelector(".more").innerHTML}</div>`;
  modal.classList.add("open"); box.querySelector(".mclose").onclick = closeModal; box.querySelector(".mclose").focus();
});
function closeModal(){ modal.classList.remove("open"); }
modal.onclick = e => { if(e.target === modal) closeModal(); };
addEventListener("keydown", e => { if(e.key === "Escape") closeModal(); });

/* ===== 3D TILT ON CARDS (mouse devices only) ===== */
if(matchMedia("(hover:hover)").matches && !matchMedia("(prefers-reduced-motion:reduce)").matches){
  document.querySelectorAll(".card").forEach(card => {
    card.addEventListener("mousemove", e => {
      const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      card.style.transform = `perspective(700px) rotateX(${-y * 7}deg) rotateY(${x * 7}deg) translateY(-6px)`;
    });
    card.addEventListener("mouseleave", () => card.style.transform = "");
  });
}

/* ===== SCROLL PROGRESS BAR + BACK-TO-TOP BUTTON ===== */
const bar = document.getElementById("progress"), toTop = document.getElementById("toTop");
addEventListener("scroll", () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  bar.style.width = (scrollY / max * 100) + "%";
  toTop.classList.toggle("show", scrollY > 600);
}, {passive:true});
toTop.onclick = () => scrollTo({top:0, behavior:"smooth"});

/* ===== COPY BUTTONS IN CONTACT CARD ===== */
document.querySelectorAll(".copy").forEach(b => b.onclick = async () => {
  try{ await navigator.clipboard.writeText(b.dataset.copy); b.textContent = "Copied!"; }catch(e){ b.textContent = "Press Ctrl+C"; }
  setTimeout(() => b.textContent = "Copy", 1500);
});

/* ===== HIGHLIGHT ACTIVE NAV LINK WHILE SCROLLING ===== */
const navLinks = [...links.querySelectorAll("a")];
const spy = new IntersectionObserver(es => es.forEach(e => {
  if(e.isIntersecting) navLinks.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
}), {rootMargin:"-45% 0px -50% 0px"});
document.querySelectorAll("section").forEach(s => spy.observe(s));

/* ===== CONTACT FORM (saves each message in YOUR Supabase SQL database) ===== */
// ✏️ EDIT: Supabase dashboard > Project Settings > API. Paste your Project URL and the public (anon / publishable) key.
// These two values are safe to be public: the database only lets visitors ADD messages, never read them.
const SUPABASE_URL = "https://rdtwewahvfipwnnwsrlv.supabase.co";
const SUPABASE_KEY = "sb_publishable_wxI0rt3GZG7WFW14R5vBnw_qyt46Yk4";
const note = document.getElementById("note");
document.getElementById("form").onsubmit = async e => {
  e.preventDefault();
  if(hp.value){ e.target.reset(); return; }              // spam trap: bots fill the hidden field
  const btn = e.target.querySelector("button");
  btn.disabled = true; note.textContent = "Sending...";
  try{
    const res = await fetch(SUPABASE_URL + "/rest/v1/contacts", {
      method: "POST",
      headers: {"Content-Type": "application/json", "apikey": SUPABASE_KEY, "Prefer": "return=minimal"},
      body: JSON.stringify({name: fn.value.trim(), email: fe.value.trim(), message: fm.value.trim()})
    });
    note.textContent = res.ok ? "Thanks! Your message was sent." : "Could not send. Please email me directly.";
    if(res.ok) e.target.reset();
  }catch(err){
    note.textContent = "Could not send. Please check your connection.";
  }
  btn.disabled = false;
};
document.getElementById("yr").textContent = new Date().getFullYear();
const contactForm = document.getElementById("contact-form");

if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData(contactForm);

        const contactData = {
            name: formData.get("name").trim(),
            email: formData.get("email").trim(),
            subject: formData.get("subject").trim(),
            message: formData.get("message").trim()
        };

        const { data, error } = await supabaseClient
            .from("contact")
            .insert([contactData]);

        if (error) {
            console.error("Error:", error.message);
            alert("Message could not be sent. Please try again.");
        } else {
            alert("Your message has been sent successfully!");
            contactForm.reset();
        }
    });
}
