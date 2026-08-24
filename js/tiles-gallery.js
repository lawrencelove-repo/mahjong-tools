/**
 * tiles.html — every tileset with samples, source links, and click-to-zoom.
 */
(function () {
  const root = document.getElementById("tiles-gallery-root");
  if (!root || !window.Tiles) return;

  /** @type {HTMLDialogElement | null} */
  let dialog = null;

  function ensureZoomDialog() {
    if (dialog) return dialog;
    dialog = document.createElement("dialog");
    dialog.className = "tile-zoom-dialog";
    dialog.innerHTML = `
      <form method="dialog" class="tile-zoom-chrome">
        <button type="submit" class="tile-zoom-close" value="close" aria-label="Close">Close</button>
      </form>
      <div class="tile-zoom-body"></div>
      <p class="tile-zoom-caption"></p>
    `;
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) dialog.close();
    });
    document.body.appendChild(dialog);
    return dialog;
  }

  /**
   * @param {string} styleId
   * @param {string} tileId
   */
  function openZoom(styleId, tileId) {
    const dlg = ensureZoomDialog();
    const body = dlg.querySelector(".tile-zoom-body");
    const caption = dlg.querySelector(".tile-zoom-caption");
    if (!body || !caption) return;

    body.replaceChildren();
    const meta = Tiles.tileMeta(tileId);
    const blown = Tiles.renderTile(tileId, styleId, "off", {
      nmjlText: styleId === "text",
    });
    blown.classList.add("tile-zoom-face");
    body.appendChild(blown);

    const set = Tiles.getTileset(styleId);
    caption.textContent = `${meta.label} (${tileId}) · ${set.label}`;

    if (typeof dlg.showModal === "function") dlg.showModal();
    else dlg.setAttribute("open", "");
  }

  /**
   * @param {HTMLElement} hand
   * @param {string} styleId
   */
  function wireZoom(hand, styleId) {
    hand.querySelectorAll(".tile-wrap, .tile-text").forEach((el) => {
      const id = el.dataset.id;
      if (!id) return;
      el.classList.add("tiles-gallery-tile");
      el.tabIndex = 0;
      el.setAttribute("role", "button");
      el.setAttribute("aria-label", `Enlarge ${Tiles.tileMeta(id).label}`);
      const activate = () => openZoom(styleId, id);
      el.addEventListener("click", activate);
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          activate();
        }
      });
    });
  }

  for (const set of Tiles.listTilesets()) {
    const section = document.createElement("section");
    section.className = "tiles-gallery-set";
    section.id = set.id;

    const head = document.createElement("div");
    head.className = "tiles-gallery-set-head";

    const title = document.createElement("h2");
    title.textContent = set.label;
    head.appendChild(title);

    const meta = document.createElement("p");
    meta.className = "tiles-gallery-set-meta";
    if (set.kind === "text") {
      meta.textContent = "Colored digits and letters (no image pack).";
    } else if (set.creditName && set.creditUrl) {
      meta.append("Source: ");
      const a = document.createElement("a");
      a.href = set.creditUrl;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = set.creditName;
      meta.appendChild(a);
    } else if (set.creditName) {
      meta.textContent = `Source: ${set.creditName}`;
    } else {
      meta.textContent = `Id: ${set.id}`;
    }
    head.appendChild(meta);

    if (set.excludeTiles?.length) {
      const note = document.createElement("p");
      note.className = "tiles-gallery-exclude-note";
      note.textContent = `Excluded from gallery / keys: ${set.excludeTiles.join(", ")}`;
      head.appendChild(note);
    }

    section.appendChild(head);

    const ids = Tiles.galleryIdsForStyle(set.id);
    if (!ids.length) {
      const empty = document.createElement("p");
      empty.className = "tiles-gallery-empty";
      empty.textContent = "No tiles to show (all excluded).";
      section.appendChild(empty);
      root.appendChild(section);
      continue;
    }

    const hand = Tiles.renderHand(ids.join(" "), set.id, {
      rankLabels: "off",
      nmjlText: set.id === "text",
    });
    hand.classList.add("tiles-gallery-hand");
    wireZoom(hand, set.id);
    section.appendChild(hand);

    root.appendChild(section);
  }
})();
