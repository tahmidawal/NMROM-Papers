(async function () {
  const res = await fetch("experiments.json", { cache: "no-cache" });
  const data = await res.json();

  document.getElementById("page-title").textContent = data.intro.title;
  document.getElementById("page-intro").innerHTML = mdInline(data.intro.plain_english);
  document.getElementById("how-to-read").innerHTML = mdInline(data.intro.how_to_read);

  const nav = document.getElementById("paper-nav");
  const list = document.getElementById("paper-list");

  const navHeading = document.createElement("h3");
  navHeading.textContent = `${data.papers.length} papers`;
  nav.appendChild(navHeading);
  const ol = document.createElement("ol");
  nav.appendChild(ol);

  data.papers.forEach((p, idx) => {
    const li = document.createElement("li");
    li.innerHTML = `<a href="#p-${p.slug}">${escapeHTML(shortTitle(p.title))}</a>`;
    ol.appendChild(li);

    const card = document.createElement("article");
    card.className = "paper-card";
    card.id = `p-${p.slug}`;

    const detailsRows = Object.entries(p.details)
      .map(([k, v]) => `<tr><td>${escapeHTML(k)}</td><td>${mdInline(String(v))}</td></tr>`)
      .join("");

    const actions = [];
    if (p.pdf) actions.push(`<a href="${p.pdf}" class="open-pdf" data-pdf="${p.pdf}" data-title="${escapeHTML(p.title)}">Open PDF →</a>`);
    actions.push(`<a href="index.html">↩ Back to reading room</a>`);

    card.innerHTML = `
      <h2><span class="paper-num">#${idx + 1}</span>${escapeHTML(p.title)}</h2>
      <p class="tldr">${mdInline(p.tldr)}</p>
      <h3>In plain English</h3>
      <p class="plain">${mdInline(p.in_plain_english)}</p>
      <h3>Details</h3>
      <table class="details"><tbody>${detailsRows}</tbody></table>
      <p class="borrow">${mdInline(p.what_to_borrow)}</p>
      <div class="actions">${actions.join("")}</div>`;
    list.appendChild(card);
  });

  // Wire PDF split-view
  const mainEl = document.querySelector(".experiments-main");
  const pane = document.getElementById("pdf-pane");
  const frame = document.getElementById("pdf-frame");
  const paneTitle = document.getElementById("pdf-pane-title");
  const openNew = document.getElementById("pdf-open-new");
  const closeBtn = document.getElementById("pdf-close");

  document.querySelectorAll("a.open-pdf").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const pdf = a.dataset.pdf;
      const title = a.dataset.title;
      openInPane(pdf, title, a.closest(".paper-card"));
    });
  });

  closeBtn.addEventListener("click", closePane);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && mainEl.classList.contains("with-pdf")) closePane();
  });

  function openInPane(pdf, title, cardEl) {
    mainEl.classList.add("with-pdf");
    pane.classList.remove("pdf-empty");
    frame.src = pdf + "#view=FitH";
    paneTitle.textContent = title;
    openNew.href = pdf;
    document.querySelectorAll(".paper-card.pdf-active").forEach((c) => c.classList.remove("pdf-active"));
    if (cardEl) cardEl.classList.add("pdf-active");
  }

  function closePane() {
    mainEl.classList.remove("with-pdf");
    pane.classList.add("pdf-empty");
    frame.src = "about:blank";
    document.querySelectorAll(".paper-card.pdf-active").forEach((c) => c.classList.remove("pdf-active"));
  }

  // Takeaways
  const takeaways = document.getElementById("takeaways");
  takeaways.innerHTML = `
    <h2>${escapeHTML(data.takeaways.title)}</h2>
    <ul>${data.takeaways.points.map(pt => `<li>${mdInline(pt)}</li>`).join("")}</ul>`;

  function shortTitle(t) {
    // use the em-dash-prefix only
    const dash = t.indexOf(" — ");
    return dash >= 0 ? t.slice(0, dash) : t;
  }
  function escapeHTML(s) {
    if (s == null) return "";
    return String(s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );
  }
  // Minimal markdown: **bold**, *italic*, `code`
  function mdInline(s) {
    if (s == null) return "";
    let out = escapeHTML(s);
    out = out.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    out = out.replace(/(?<!\*)\*(?!\*)(.+?)\*(?!\*)/g, "<em>$1</em>");
    out = out.replace(/`([^`]+)`/g, "<code>$1</code>");
    return out;
  }
})();
