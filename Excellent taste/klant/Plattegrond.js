"use strict";

/* ========= API endpoints (pas aan waar nodig) ========= */
const API = {
  tafels: "../Personeel/TafelsOphalen.php",
  reserveringen: (tafel) => `TafelReserveringen.php?table=${encodeURIComponent(tafel)}`,
  noShow: (id) => `NoShowReservering.php?id=${encodeURIComponent(id)}`,
  verwijder: (id) => `VerwijderReservering.php?id=${encodeURIComponent(id)}`,
  bewerk: "BewerkReserveringen.php",
  opslaanTafel: "TafelOpslaan.php",
  bewerkFormulierPartial: "bewerkFormulier.html",
};

let huidigeReserveringen = [];

/* ========= DOM helpers ========= */
function ensureOverlayAndCloseButton() {
  // Overlay
  let overlay = document.getElementById("formOverlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "formOverlay";
    overlay.className = "form-overlay";
    overlay.style.display = "none";
    document.body.appendChild(overlay);
  }

  // Formulier
  let form = document.getElementById("reserveringsformulier");
  if (!form) {
    console.warn("⚠️ #reserveringsformulier niet gevonden in DOM.");
    return { overlay, form: null, closeBtn: null };
  }

  // Zorg dat formulier en overlay NIET in .plattegrond-container zitten
  const container = document.querySelector(".plattegrond-container");
  const nav = document.querySelector(".navigatie");
  if (container && container.contains(form)) {
    if (nav && nav.parentNode) {
      nav.after(overlay);
      nav.after(form);
    } else {
      document.body.prepend(overlay);
      document.body.prepend(form);
    }
  } else {
    // zet overlay vóór form als ze al goed staan
    if (form.previousElementSibling !== overlay) {
      form.parentNode.insertBefore(overlay, form);
    }
  }

  // Sluitknop (X) toevoegen als die ontbreekt
  let closeBtn = form.querySelector("#formCloseBtn") || form.querySelector(".form-close");
  let header = form.querySelector(".form-header");
  if (!header) {
    // minimal fallback-header
    header = document.createElement("div");
    header.className = "form-header";
    header.innerHTML = `<h2 style="margin:0">Reservering <span id="tafelnummer"></span></h2>`;
    form.insertBefore(header, form.firstChild);
  }
  if (!closeBtn) {
    closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.id = "formCloseBtn";
    closeBtn.className = "form-close";
    closeBtn.setAttribute("aria-label", "Sluiten");
    closeBtn.textContent = "×";
    header.appendChild(closeBtn);
  }

  return { overlay, form, closeBtn };
}

/* ========= Show / Hide ========= */
function toonReserveringsFormulier() {
  const form = document.getElementById("reserveringsformulier");
  const overlay = document.getElementById("formOverlay");
  if (form) form.style.display = "block";
  if (overlay) overlay.style.display = "block";
  form?.focus();
}
function sluitReserveringsFormulier() {
  const form = document.getElementById("reserveringsformulier");
  const overlay = document.getElementById("formOverlay");
  if (form) form.style.display = "none";
  if (overlay) overlay.style.display = "none";
}

/* ========= Open + vul formulier ========= */
function openFormulier(tafelNummer) {
  const span = document.getElementById("tafelnummer"); // ✅ juiste ID
  const hidden = document.getElementById("tafel");
  if (span) span.textContent = tafelNummer;
  if (hidden) hidden.value = tafelNummer;

  toonReserveringsFormulier();

  // Reserveringen inladen
  fetch(API.reserveringen(tafelNummer))
    .then((r) => r.json())
    .then((data) => {
      huidigeReserveringen = Array.isArray(data) ? data : [];
      huidigeReserveringen.sort(
        (a, b) => new Date(`${a.datum}T${a.tijd}`) - new Date(`${b.datum}T${b.tijd}`)
      );

      const overzicht = document.getElementById("reserveringenOverzicht");
      if (!overzicht) return;

      if (huidigeReserveringen.length === 0) {
        overzicht.innerHTML = `<h3>Reserveringen voor tafel ${tafelNummer}</h3><p>Geen reserveringen gevonden.</p>`;
      } else {
        let html = `<h3>Reserveringen voor tafel ${tafelNummer}</h3><ul>`;
        huidigeReserveringen.forEach((res) => {
          html += `<li>
            ${res.datum} ${res.tijd} - ${res.naam} (${res.personen} personen)
            <button type="button" onclick="bewerkReservering(${res.id})">Bewerk</button>
            <button type="button" onclick="verwijderReservering(${res.id}, ${tafelNummer})">Verwijder</button>
            <button type="button" onclick="noShowReservering(${res.id}, ${tafelNummer})">No Show</button>
          </li>`;
        });
        html += `</ul>`;
        overzicht.innerHTML = html;
      }
    })
    .catch((err) => console.error("Fout bij laden reserveringen:", err));
}

/* ========= Validatie submit ========= */
function checktafel() {
  const v = document.getElementById("tafel")?.value;
  if (!v) { alert("Selecteer een tafel voordat je reserveert."); return false; }
  return true;
}

/* ========= Reserveringsbeheer ========= */
function noShowReservering(id, tafelNummer) {
  if (!confirm("No Show markeren?")) return;
  fetch(API.noShow(id), { method: "POST" })
    .then((r) => r.json())
    .then((result) => { if (result?.success) { alert("Gemarkeerd als No Show"); openFormulier(tafelNummer); }})
    .catch(console.error);
}
function bewerkReservering(id) {
  const res = huidigeReserveringen.find((r) => String(r.id) === String(id));
  if (!res) return alert("Niet gevonden");
  const setVal = (i, v) => { const el = document.getElementById(i); if (el) el.value = v ?? ""; };
  document.getElementById("editId")?.setAttribute("value", res.id);
  setVal("editNaam", res.naam); setVal("editDatum", res.datum);
  setVal("editTijd", res.tijd); setVal("editPersonen", res.personen);
  const bf = document.getElementById("bewerkFormulier"); if (bf) bf.style.display = "flex";
}
function sluitBewerkFormulier() {
  const bf = document.getElementById("bewerkFormulier"); if (bf) bf.style.display = "none";
}
function verwijderReservering(id, tafelNummer) {
  if (!confirm("Weet je zeker dat je wilt verwijderen?")) return;
  fetch(API.verwijder(id), { method: "POST" })
    .then((r) => r.json())
    .then((result) => { if (result?.success) { alert("Verwijderd!"); openFormulier(tafelNummer); }})
    .catch(console.error);
}

/* ========= Tafels (laden + click) ========= */
function renderTafels() {
  fetch(API.tafels)
    .then((res) => res.json())
    .then((tafels) => {
      const container = document.querySelector(".plattegrond-container");
      if (!container || !Array.isArray(tafels)) return;
      tafels.forEach((t) => {
        const btn = document.createElement("button");
        btn.className = "tafel";
        btn.textContent = t.nummer;
        btn.style.left = (t.left_px ?? 0) + "px";
        btn.style.top = (t.top_px ?? 0) + "px";
        container.appendChild(btn);
        btn.addEventListener("click", () => openFormulier(t.nummer));
      });
    })
    .catch((err) => console.error("Fout bij laden tafels:", err));
}

/* ========= Init ========= */
document.addEventListener("DOMContentLoaded", () => {
  const { overlay, form, closeBtn } = ensureOverlayAndCloseButton();

  // Listeners voor sluiten
  overlay?.addEventListener("click", sluitReserveringsFormulier);
  closeBtn?.addEventListener("click", sluitReserveringsFormulier);

  // Klik-buiten (niet op navbar)
  document.addEventListener("pointerdown", (e) => {
    if (form?.style.display === "block" && !form.contains(e.target) && !e.target.closest(".navigatie")) {
      sluitReserveringsFormulier();
    }
  }, true);

  // Escape sluit
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && form?.style.display === "block") sluitReserveringsFormulier();
  });

  // (optioneel) bewerkformulier partial
  fetch(API.bewerkFormulierPartial)
    .then((r) => (r.ok ? r.text() : ""))
    .then((html) => {
      const host = document.getElementById("formulierContainer");
      if (host && html) host.innerHTML = html;
      const editForm = document.getElementById("editForm");
      if (editForm) {
        editForm.addEventListener("submit", (e) => {
          e.preventDefault();
          const id = document.getElementById("editId")?.value;
          const naam = document.getElementById("editNaam")?.value;
          const datum = document.getElementById("editDatum")?.value;
          const tijd = document.getElementById("editTijd")?.value;
          const personen = document.getElementById("editPersonen")?.value;
          fetch(API.bewerk, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, naam, datum, tijd, personen }),
          })
            .then((r) => r.json())
            .then((result) => {
              if (result?.success) {
                alert("Bijgewerkt!");
                sluitBewerkFormulier();
                const tafelVal = document.getElementById("tafel")?.value;
                if (tafelVal) openFormulier(tafelVal);
              }
            })
            .catch(console.error);
        });
      }
    })
    .catch(() => { /* optioneel */ });

  // Tafels tekenen
  renderTafels();

  // Exports (voor inline onclick in HTML, indien gebruikt)
  window.openFormulier = openFormulier;
  window.noShowReservering = noShowReservering;
  window.bewerkReservering = bewerkReservering;
  window.sluitBewerkFormulier = sluitBewerkFormulier;
  window.verwijderReservering = verwijderReservering;
  window.checktafel = checktafel;
});
