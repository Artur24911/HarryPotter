const apiUrl = "https://hogwarts-api.com/api/characters";
const minBatch = 20;
const pageCache = {};
let currentList = [];
let currentPage = 0;
let totalPages = 1;
let searchText = "";
let searchTimer = null;
let pendingSearch = null;
let currentIndex = 0;
let isLoading = false;

function getElement(dataId) {
    return document.querySelector(`[data-id="${dataId}"]`);
}

function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, (char) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[char]);
}

function init() {
    setupDialog();
    withLoading(() => showFirstPage(""));
}

async function withLoading(task) {
    setLoading(true);
    try {
        await task();
    } catch (error) {
        showMessage("error-message", "Something went wrong. Please try again.");
    } finally {
        setLoading(false);
        runPendingSearch();
    }
}

async function fetchPage(page, search) {
    const key = `${search}|${page}`;
    if (pageCache[key]) return pageCache[key];
    let url = `${apiUrl}?page=${page}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    const response = await fetch(url);
    if (response.status === 404) return { data: [], meta: { total_pages: 0 } };
    if (!response.ok) throw new Error(`Response status: ${response.status}`);
    pageCache[key] = await response.json();
    return pageCache[key];
}

async function showFirstPage(search) {
    searchText = search;
    currentList = [];
    currentPage = 0;
    totalPages = 1;
    getElement("character-list").innerHTML = "";
    removeMessage();
    await loadNextPage();
    if (currentList.length === 0) showMessage("not-found", "No match found.");
}

function hasImage(character) {
    return Boolean(character.image);
}

async function collectCharacters() {
    const found = [];
    let page = currentPage;
    while (found.length < minBatch && page < totalPages) {
        page++;
        const result = await fetchPage(page, searchText);
        totalPages = result.meta.total_pages;
        found.push(...result.data.filter(hasImage));
    }
    return { found, page };
}

async function loadNextPage() {
    const startIndex = currentList.length;
    const { found, page } = await collectCharacters();
    currentPage = page;
    currentList.push(...found);
    renderCards(found, startIndex);
    updateLoadMoreButton();
    await waitForImages(startIndex);
}

function renderCards(characters, startIndex) {
    const listElement = getElement("character-list");
    characters.forEach((character, i) => {
        const html = getCardTemplate(character, startIndex + i);
        listElement.insertAdjacentHTML("beforeend", html);
    });
}

function loadMore() {
    withLoading(loadNextPage);
}

function waitForImages(startIndex) {
    const images = [...document.querySelectorAll('[data-id="card-image"]')].slice(startIndex);
    const loaded = images.map((img) => new Promise((done) => {
        if (img.complete) done();
        img.onload = img.onerror = done;
    }));
    const timeout = new Promise((done) => setTimeout(done, 5000));
    return Promise.race([Promise.all(loaded), timeout]);
}

function setLoading(isOn) {
    isLoading = isOn;
    getElement("loading").hidden = !isOn;
    getElement("load-more-button").disabled = isOn;
}

function updateLoadMoreButton() {
    getElement("load-more-button").hidden = currentPage >= totalPages;
}

function showMessage(dataId, text) {
    removeMessage();
    getElement("content").insertAdjacentHTML("beforeend", getMessageTemplate(dataId, text));
}

function removeMessage() {
    const selector = '[data-id="not-found"], [data-id="error-message"]';
    document.querySelectorAll(selector).forEach((element) => element.remove());
}

function onSearchInput() {
    const text = getElement("search-input").value.trim();
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => runSearch(text), 400);
}

function runSearch(text) {
    if (text.length > 0 && text.length < 3) return;
    pendingSearch = null;
    if (text === searchText) return;
    if (isLoading) {
        pendingSearch = text;
        return;
    }
    withLoading(() => showFirstPage(text));
}

function runPendingSearch() {
    if (pendingSearch === null) return;
    const text = pendingSearch;
    pendingSearch = null;
    runSearch(text);
}

function setupDialog() {
    const dialog = getElement("dialog");
    dialog.addEventListener("click", (event) => {
        if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener("close", () => {
        dialog.innerHTML = "";
        document.body.classList.remove("no-scroll");
    });
}

function openDialog(index) {
    currentIndex = index;
    renderDialog();
    getElement("dialog").showModal();
    document.body.classList.add("no-scroll");
}

function renderDialog() {
    getElement("dialog").innerHTML = getDialogTemplate(currentList[currentIndex]);
}

function closeDialog() {
    getElement("dialog").close();
}

function showNext() {
    currentIndex = (currentIndex + 1) % currentList.length;
    renderDialog();
}

function showPrevious() {
    currentIndex = (currentIndex - 1 + currentList.length) % currentList.length;
    renderDialog();
}

function getInfoRows(character) {
    return [
        ["Species", character.species],
        ["Blood status", character.blood_status],
        ["Born", character.born],
        ["Gender", character.gender],
        ["Patronus", character.patronus],
        ["Wand", joinList(character.wands)],
    ];
}

function joinList(list) {
    return Array.isArray(list) ? list.join(", ") : "";
}

function getInfoRowsTemplate(character) {
    return getInfoRows(character).map(getInfoRowTemplate).join("");
}

function getHouseText(character) {
    return escapeHtml(character.house || "No house");
}

function getImage(character) {
    return character.image || placeholderImage;
}

function getHouseClass(character) {
    return character.house ? character.house.toLowerCase().replace(/\s+/g, "-") : "none";
}
