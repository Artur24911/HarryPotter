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

function getInfoRowTemplate([label, value]) {
    return `<dt>${label}</dt><dd>${escapeHtml(value || "Unknown")}</dd>`;
}

function getMessageTemplate(dataId, text) {
    return `<p class="message" data-id="${dataId}">${escapeHtml(text)}</p>`;
}