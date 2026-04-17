(function () {
  const root = document.documentElement;
  const body = document.body;

  // Apply stored prefs as early as possible (inline script runs before paint)
  const storedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const initialTheme = storedTheme || (prefersDark ? "dark" : "light");
  root.setAttribute("data-theme", initialTheme);

  const storedPdfDark = localStorage.getItem("pdfDark") === "1";
  if (storedPdfDark) body.classList.add("pdf-dark");

  function wire() {
    const themeBtn = document.getElementById("theme-btn");
    const pdfBtn = document.getElementById("pdf-dark-btn");

    function renderTheme() {
      const t = root.getAttribute("data-theme");
      if (themeBtn) themeBtn.innerHTML = t === "dark" ? "☀️ Light" : "🌙 Dark";
    }
    function renderPdf() {
      if (pdfBtn) pdfBtn.classList.toggle("active", body.classList.contains("pdf-dark"));
    }
    renderTheme();
    renderPdf();

    if (themeBtn) {
      themeBtn.addEventListener("click", () => {
        const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
        root.setAttribute("data-theme", next);
        localStorage.setItem("theme", next);
        renderTheme();
      });
    }
    if (pdfBtn) {
      pdfBtn.addEventListener("click", () => {
        body.classList.toggle("pdf-dark");
        localStorage.setItem("pdfDark", body.classList.contains("pdf-dark") ? "1" : "0");
        renderPdf();
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wire);
  } else {
    wire();
  }
})();
