const placeholderImage = "./assets/icons/placeholder.png";

function getImage(character) {
    return character.image || placeholderImage;
}

function getHouseClass(character) {
    return character.house ? character.house.toLowerCase().replace(/\s+/g, "-") : "none";
}

function getCardTemplate(character, index) {
    return `
        <li>
            <button class="card house-${getHouseClass(character)}" data-id="card class"card-house"
                aria-label="Show details of ${escapeHtml(character.name)}"
                onclick="openDialog(${index})">
                <span class="card-name">${escapeHtml(character.name)}</span>
                <div class="card-front-info">
                <span class="card-types"><span class="type-tag">${getHouseText(character)}</span></span>
                <img data-id="card-image" src="${escapeHtml(getImage(character))}"
                    alt="${escapeHtml(character.name)}">
                </div>
            </button>
        </li>
    `;
}

function getHouseText(character) {
    return escapeHtml(character.house || "No house");
}

function getDialogTemplate(character) {
    return `
        <div class="dialog-card house-${getHouseClass(character)}" data-id="overlay-pokemon-name">
            <button class="dialog-close" data-id="close-dialog-button"
                aria-label="Close dialog" onclick="closeDialog()">✕</button>
            <h2>${escapeHtml(character.name)}</h2>
            <div class="card-types"><span class="type-tag">${getHouseText(character)}</span></div>
            <img data-id="dialog-image" src="${escapeHtml(getImage(character))}"
                alt="${escapeHtml(character.name)}">
            <div class="dialog-body">
                <dl class="info-list">${getInfoRowsTemplate(character)}</dl>
            </div>
            ${getDialogNavTemplate()}
        </div>
    `;
}

function getDialogNavTemplate() {
    return `
        <div class="dialog-nav">
            <button data-id="prev-button" aria-label="Previous character"
                onclick="showPrevious()">←</button>
            <button data-id="next-button" aria-label="Next character"
                onclick="showNext()">→</button>
        </div>
    `;
}

function getInfoRows(character) {
    return [
        ["Species", character.species],
        ["Blood status", character.blood_status],
        ["Born", character.born],
        ["Gender", character.gender],
        ["Patronus", character.patronus],
        ["Wand", joinList(character.wands)],
        ["Job", joinList(character.jobs)],
    ];
}

function joinList(list) {
    return Array.isArray(list) ? list.join(", ") : "";
}

function getInfoRowsTemplate(character) {
    return getInfoRows(character).map(getInfoRowTemplate).join("");
}

function getInfoRowTemplate([label, value]) {
    return `<dt>${label}</dt><dd>${escapeHtml(value || "Unknown")}</dd>`;
}