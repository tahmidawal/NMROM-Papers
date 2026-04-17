(async function () {
  const res = await fetch("knobs.json", { cache: "no-cache" });
  const data = await res.json();

  document.getElementById("page-title").textContent = data.intro.title;
  document.getElementById("page-intro").innerHTML = mdInline(data.intro.plain_english);
  document.getElementById("how-to-read").innerHTML = mdInline(data.intro.how_to_read);

  const tiersEl = document.getElementById("tiers");
  data.tiers.forEach((tier) => {
    const card = document.createElement("section");
    card.className = "tier-card";
    card.id = tier.id;
    const knobsHTML = tier.knobs.map((k) => `
      <div class="knob">
        <div class="knob-head">
          <span class="knob-name">${escapeHTML(k.name)}</span>
          <span class="knob-loc">${escapeHTML(k.location)}</span>
          <span class="lever-tag">${escapeHTML(k.lever_size)}</span>
        </div>
        <div class="knob-current">Current: ${mdInline(k.current)}</div>
        <dl class="knob-grid">
          <dt>Turn up</dt><dd>${mdInline(k.effect_up)}</dd>
          <dt>Turn down</dt><dd>${mdInline(k.effect_down)}</dd>
          <dt>Cost model</dt><dd>${mdInline(k.cost_model)}</dd>
          ${k.analog_in_corpus ? `<dt>In the corpus</dt><dd>${mdInline(k.analog_in_corpus)}</dd>` : ""}
        </dl>
      </div>`).join("");
    card.innerHTML = `
      <h2>${escapeHTML(tier.title)}</h2>
      <p class="tier-blurb">${mdInline(tier.blurb)}</p>
      ${knobsHTML}`;
    tiersEl.appendChild(card);
  });

  const demoEl = document.getElementById("demonstration");
  const demo = data.demonstration;
  const expHTML = demo.experiments.map((e) => `
    <article class="exp-card" id="${e.id}">
      <h3>${escapeHTML(e.title)}</h3>
      <dl class="exp-grid">
        <dt>What</dt><dd>${mdInline(e.what)}</dd>
        <dt>How</dt><dd>${mdInline(e.how)}</dd>
        <dt>Why</dt><dd>${mdInline(e.why)}</dd>
        <dt>Interpretation</dt><dd>${mdInline(e.interpretation)}</dd>
      </dl>
    </article>`).join("");
  demoEl.innerHTML = `
    <h2>${escapeHTML(demo.title)}</h2>
    <p class="tier-blurb">${mdInline(demo.blurb)}</p>
    ${expHTML}
    <p class="mvp">${mdInline(demo.minimum_viable)}</p>`;

  function escapeHTML(s) {
    if (s == null) return "";
    return String(s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );
  }
  function mdInline(s) {
    if (s == null) return "";
    let out = escapeHTML(s);
    out = out.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    out = out.replace(/(?<!\*)\*(?!\*)(.+?)\*(?!\*)/g, "<em>$1</em>");
    out = out.replace(/`([^`]+)`/g, "<code>$1</code>");
    return out;
  }
})();
