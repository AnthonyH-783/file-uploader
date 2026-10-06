"use strict";
(function uploadScreenController() {
    const input = document.getElementById("file");
    const uploads = document.querySelector(".file-list");
    const dropZone = document.querySelector(".upload-form__dropzone");
    let fileList = new DataTransfer();
    const MAX_SIZE = 10 * 1024 * 1024;
    let totalSize = 0;
    if (!(input instanceof HTMLInputElement)
        || !(uploads instanceof HTMLDivElement)
        || !(dropZone instanceof HTMLLabelElement))
        return;
    input.addEventListener("change", handleInputChange);
    uploads.addEventListener("click", removeUpload);
    uploads.addEventListener("click", clearAll);
    dropZone.addEventListener("drop", handleDropZone);
    dropZone.addEventListener("dragover", handleDropZoneDragover);
    // Preventing default drop behavior for files on window object
    window.addEventListener("drop", handleWindowDrop);
    window.addEventListener("dragover", handleWindowDragover);
    function handleInputChange(evt) {
        // Selecting input elements
        const input = evt.currentTarget;
        const uploadBox = input.closest('.upload-form__group');
        if (!uploadBox || !input.files)
            return;
        // Displaying files to be uploaded in list
        let list = uploadBox.nextElementSibling;
        if (!list || !list.classList.contains("file-list")) {
            list = document.createElement("div");
            list.classList.add("form-upload__group", "file-list");
            list.innerHTML = '<div class="file-list__header" hidden> <div class="file-list__header__left"> <span class="num-files"></span> </div> <div class="file-list__header__right" <span class="total-size"></span> <button class="clear-all"></button> </div>       <div class="file-list__body"> </div> </div>';
            uploadBox.after(list);
        }
        updateFileList(input);
        updateTotalSize();
        render(list);
    }
    function updateFileList(input) {
        if (!input.files)
            return;
        for (const file of input.files) {
            if (!(Array.from(fileList.files).includes(file))) {
                fileList.items.add(file);
            }
        }
        input.files = fileList.files;
    }
    function handleDropZone(evt) {
        if (!evt.dataTransfer)
            return;
        // Selecting files dragged into browser
        const files = [...evt.dataTransfer.items].filter((item) => item.kind === "file").map((item) => item.getAsFile()).filter((file) => file !== null);
        if (files.length === 0)
            return;
        // Prevent default file opening in browser
        evt.preventDefault();
        // Transfer dragged file into the input html element
        const dt = new DataTransfer();
        files.forEach((file) => dt.items.add(file));
        input.files = dt.files;
        // Dispatch input change event to trigger rendering
        input.dispatchEvent(new Event("change", { bubbles: true }));
    }
    function handleWindowDrop(evt) {
        if (!evt.dataTransfer)
            return;
        if ([...evt.dataTransfer.items].some((item) => item.kind === "file")) {
            evt.preventDefault();
        }
    }
    function handleWindowDragover(evt) {
        if (!evt.dataTransfer)
            return;
        const fileItems = [...evt.dataTransfer.items].filter((item) => item.kind === 'file');
        if (fileItems.length > 0) {
            evt.preventDefault();
            if (!(evt.target instanceof HTMLElement) || !dropZone?.contains(evt.target)) {
                evt.dataTransfer.dropEffect = "none";
            }
        }
    }
    function handleDropZoneDragover(evt) {
        if (!evt.dataTransfer)
            return;
        if ([...evt.dataTransfer.items].some((i) => i.kind === "file")) {
            evt.preventDefault();
            evt.dataTransfer.dropEffect = "copy";
        }
    }
    function render(list) {
        // Selecting needed HTML Elements
        const header = list.querySelector(".file-list__header");
        const rightHeader = list.querySelector(".file-list__header__right");
        const body = list.querySelector(".file-list__body");
        const numFiles = list.querySelector(".num-files");
        const totalSizeDiv = list.querySelector(".total-size");
        const errorMsg = document.querySelector(".file-list__error");
        const submitBtnCount = document.querySelector(".submit-count");
        if (!header || !body || !numFiles || !totalSizeDiv || !submitBtnCount) {
            console.error("File list markup is incomplete");
            return;
        }
        // Applying changes from current files collection
        const files = input.files ? Array.from(input.files) : [];
        body.replaceChildren(...files.map(createFileView));
        numFiles.textContent = String(files.length) + " file(s) selected";
        totalSizeDiv.textContent = getTotalFileSizeMB(files);
        header.hidden = files.length === 0;
        console.log(totalSize, MAX_SIZE);
        errorMsg.hidden = totalSize < MAX_SIZE;
        rightHeader.hidden = (!input.files || input.files.length === 0);
        submitBtnCount.textContent = (input.files?.length) ? String(input.files.length) + " files" : "";
    }
    function updateTotalSize() {
        totalSize = 0;
        if (!input.files) {
            return;
        }
        for (const file of input.files) {
            totalSize += file.size;
        }
    }
    function removeUpload(evt) {
        // Selecting html
        const deleteBtn = evt.target.closest(".upload-remover");
        const row = deleteBtn?.closest(".upload-form__file-upload-row");
        const list = deleteBtn?.closest(".file-list");
        if (!row || !list || !input.files)
            return;
        // Mutating input files and rendering
        const index = Number(row.dataset.index);
        fileList.items.remove(index);
        input.files = fileList.files;
        updateTotalSize();
        render(list);
    }
    function clearAll(evt) {
        // Selecting html
        const button = evt.target;
        if (!(button instanceof HTMLButtonElement))
            return;
        const list = button.closest(".file-list");
        if (!list || !input.files)
            return;
        // Clearing
        input.value = '';
        fileList.items.clear();
        updateTotalSize();
        render(list);
    }
    function formatFileType(mediaType, mediaSubtype) {
        console.log(mediaType, mediaSubtype);
        if (mediaType === 'application')
            return formatApplicationSubtype(mediaSubtype);
        return mediaType;
    }
    function formatApplicationSubtype(mediaSubtype) {
        switch (mediaSubtype) {
            case "vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                return "spreadsheet";
            case "vnd.ms-excel":
                return "spreadsheet";
            case "pdf":
                return "pdf";
            case "x-zip-compressed":
                return "zip";
            case "vnd.openxmlformats-officedocument.wordprocessingml.document":
                return "word";
            case "msword":
                return "word";
            case "vnd.openxmlformats-officedocument.presentationml.presentation":
                return "powerpoint";
            case "vnd.ms-powerpoint":
                return "powerpoint";
            default:
                return "unknown file";
        }
    }
    function createFileView(file, index) {
        const ICONS = {
            image: '<img class="icon-img" src="/images/img.png">',
            video: '<img class="icon-img" src="/images/video.png">',
            pdf: '<img class="icon-img" src="/images/pdf.png">',
            audio: '<img class="icon-img" src="/images/audio.png">',
            spreadsheet: '<img class="icon-img" src="/images/sheet.png">',
            word: '<img class="icon-img" src="/images/word.png">',
            powerpoint: '<img class="icon-img" src="/images/present.png">',
            zip: '<img class="icon-img" src="/images/zip.png">',
            delete: '<svg class="delete-upload" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x preview-icon"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
            miscellanious: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-question-mark"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M12 17h.01"/><path d="M9.1 9a3 3 0 0 1 5.82 1c0 2-3 3-3 3"/></svg>'
        };
        // Defining row
        const row = document.createElement("div");
        row.classList.add("upload-form__file-upload-row");
        row.dataset.index = String(index);
        // Defining columns
        const [mediaType, mediaSubtype] = file.type.split("/");
        const [nameContainer, nameType, fileType, icon] = [document.createElement("div"), document.createElement("div"), document.createElement("div"), document.createElement("div")];
        nameContainer.classList.add("file-name");
        const name = document.createElement("div");
        const fileSize = document.createElement("div");
        fileSize.classList.add("file-size");
        name.textContent = file.name;
        fileSize.textContent = getTotalFileSizeMB([file]);
        nameContainer.appendChild(name);
        nameContainer.appendChild(fileSize);
        fileType.textContent = formatFileType(mediaType, mediaSubtype);
        icon.innerHTML = ICONS[formatFileType(mediaType, mediaSubtype)];
        nameType.append(icon, nameContainer);
        nameType.classList.add("name-type");
        const deleteSvg = document.createElement("div");
        deleteSvg.classList.add("upload-remover");
        deleteSvg.innerHTML = ICONS.delete;
        row.append(nameType, fileType, deleteSvg);
        return row;
    }
    ;
    function getTotalFileSizeMB(files) {
        const totalSizeBytes = files.reduce((acc, file) => acc + file.size, 0);
        const sizeMB = (totalSizeBytes / (1024 * 1024)).toFixed(2);
        return sizeMB + " MB";
    }
})();
//# sourceMappingURL=uploadVisualizer.js.map