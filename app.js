(async function () {
  const res = await fetch("papers.json", { cache: "no-cache" });
  const data = await res.json();

  document.getElementById("built").textContent = new Date().toISOString().slice(0, 10);

  const toc = document.getElementById("toc");
  const content = document.getElementById("content");

  let totalPapers = 0;
  let openAccess = 0;

  for (const section of data.sections) {
    // TOC for this section
    const tocH = document.createElement("h3");
    tocH.textContent = section.title;
    toc.appendChild(tocH);
    const tocUL = document.createElement("ul");
    toc.appendChild(tocUL);

    // Section block
    const secDiv = document.createElement("div");
    secDiv.className = "section";
    secDiv.id = `sec-${section.id}`;
    secDiv.innerHTML = `<h2 class="section-title">${escapeHTML(section.title)}</h2>
      <p class="section-blurb">${escapeHTML(section.blurb)}</p>`;

    for (const cat of section.categories) {
      const catId = `cat-${section.id}-${cat.id}`;
      const tocLI = document.createElement("li");
      tocLI.className = "cat";
      tocLI.innerHTML = `<a href="#${catId}">${escapeHTML(cat.title)} <span style="color:var(--muted)">(${cat.papers.length})</span></a>`;
      tocUL.appendChild(tocLI);

      const catDiv = document.createElement("div");
      catDiv.className = "category";
      catDiv.id = catId;
      catDiv.innerHTML = `
        <h3 class="cat-title"><span><span class="toggle">▾</span>${escapeHTML(cat.title)}</span><span class="count">${cat.papers.length} papers</span></h3>
        <p class="cat-blurb">${escapeHTML(cat.blurb)}</p>
        <div class="cards"></div>`;
      const cardsDiv = catDiv.querySelector(".cards");
      catDiv.querySelector(".cat-title").addEventListener("click", () => {
        catDiv.classList.toggle("collapsed");
        catDiv.querySelector(".toggle").textContent = catDiv.classList.contains("collapsed") ? "▸" : "▾";
      });

      for (const p of cat.papers) {
        totalPapers += 1;
        if (!p.closed_access) openAccess += 1;

        const card = document.createElement("article");
        card.className = "card" + (p.closed_access ? " closed-access" : "");
        card.dataset.blob = [
          p.title, p.authors, p.year, p.venue, p.summary, p.doi, p.arxiv
        ].filter(Boolean).join(" ").toLowerCase();

        const chips = [
          `<span class="chip year">${p.year}</span>`,
          `<span class="chip">${escapeHTML(p.venue)}</span>`,
          p.citations ? `<span class="chip cite">${p.citations} citations</span>` : "",
          p.closed_access ? `<span class="chip closed">link only</span>` : "",
        ].filter(Boolean).join("");

        card.innerHTML = `
          <h4>${escapeHTML(p.title)}</h4>
          <p class="authors">${escapeHTML(p.authors)}</p>
          <div class="meta">${chips}</div>`;
        card.addEventListener("click", () => openReader(p));
        cardsDiv.appendChild(card);
      }

      secDiv.appendChild(catDiv);
    }

    content.appendChild(secDiv);
  }

  document.getElementById("counts").textContent =
    `${totalPapers} papers · ${openAccess} with embedded PDFs · ${totalPapers - openAccess} link-only (closed-access)`;

  // Reader wiring
  const reader = document.getElementById("reader");
  const readerBody = document.querySelector(".reader-body");
  const readerClose = document.getElementById("reader-close");
  readerClose.addEventListener("click", closeReader);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !reader.classList.contains("hidden")) closeReader();
  });

  function openReader(p) {
    document.getElementById("reader-title").textContent = p.title;
    document.getElementById("reader-meta").textContent =
      `${p.authors} · ${p.venue} · ${p.year}` + (p.citations ? ` · ${p.citations} citations` : "");

    setLink("reader-doi", p.doi ? (p.doi.startsWith("10.") ? `https://doi.org/${p.doi}` : p.doi) : null);
    setLink("reader-arxiv", p.arxiv ? `https://arxiv.org/abs/${p.arxiv}` : null);
    setLink("reader-pdf", p.pdf || null, "Open PDF");

    document.getElementById("reader-summary").innerHTML =
      `<h3>150-word summary</h3><p>${escapeHTML(p.summary)}</p>`;

    const frame = document.getElementById("reader-frame");
    if (p.pdf) {
      frame.src = p.pdf + "#view=FitH";
      readerBody.classList.remove("no-pdf");
    } else {
      frame.src = "about:blank";
      readerBody.classList.add("no-pdf");
    }

    reader.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }

  function closeReader() {
    reader.classList.add("hidden");
    document.getElementById("reader-frame").src = "about:blank";
    document.body.style.overflow = "";
  }

  function setLink(id, href, label) {
    const el = document.getElementById(id);
    if (href) {
      el.href = href;
      el.classList.remove("hidden");
      if (label) el.textContent = label;
    } else {
      el.classList.add("hidden");
    }
  }

  // Search
  const search = document.getElementById("search");
  search.addEventListener("input", () => {
    const q = search.value.trim().toLowerCase();
    let visible = 0;
    for (const card of document.querySelectorAll(".card")) {
      const match = !q || card.dataset.blob.includes(q);
      card.style.display = match ? "" : "none";
      if (match) visible += 1;
    }
    for (const cat of document.querySelectorAll(".category")) {
      const anyVisible = [...cat.querySelectorAll(".card")].some(c => c.style.display !== "none");
      cat.style.display = anyVisible ? "" : "none";
    }
    if (q) {
      document.getElementById("counts").textContent = `${visible} of ${totalPapers} papers match "${q}"`;
    } else {
      document.getElementById("counts").textContent =
        `${totalPapers} papers · ${openAccess} with embedded PDFs · ${totalPapers - openAccess} link-only (closed-access)`;
    }
  });

  function escapeHTML(s) {
    if (s == null) return "";
    return String(s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );
  }
})();
