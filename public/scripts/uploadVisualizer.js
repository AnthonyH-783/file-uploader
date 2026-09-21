"use strict";
(function uploadScreenController() {
    const input = document.getElementById("file");
    const uploads = document.querySelector(".file-list");
    if (!(input instanceof HTMLInputElement)
        || !(uploads instanceof HTMLDivElement))
        return;
    input.addEventListener("change", handleInputChange);
    uploads.addEventListener("click", removeUpload);
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
            uploadBox.after(list);
        }
        list.replaceChildren(...Array.from(input.files, createFileView));
        console.log(input.files);
        console.log(list);
    }
    function removeUpload(evt) {
        // Targetting the delete button
        if (!(evt.target instanceof SVGSVGElement))
            return;
        const deleteBtn = evt.target.closest(".upload-remover");
        if (!deleteBtn)
            return;
        if (!deleteBtn.classList.contains("upload-remover") || !(input.files))
            return;
        // Getting file name or id
        const row = deleteBtn.closest(".file-upload-row");
        const fileIndex = (row.dataset.index);
        if (!fileIndex)
            return;
        // Removing file from inputs and list
        removeFile(input, fileIndex);
    }
    function removeFile(input, fileIndex) {
        const dt = new DataTransfer();
        if (!input.files)
            return false;
        for (const idx in input.files) {
            if (idx !== fileIndex && input.files[idx] instanceof File) {
                dt.items.add(input.files[idx]);
            }
            else {
                uploads?.querySelector(`div[data-index='${fileIndex}']`)?.remove();
            }
        }
        input.files = dt.files;
        return true;
    }
    function createFileView(file, index) {
        const ICONS = {
            image: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-image"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><circle cx="10" cy="12" r="2"/><path d="m20 17-1.296-1.296a2.41 2.41 0 0 0-3.408 0L9 22"/></svg>',
            video: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-video-camera"><path d="M4 12V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="m10 17.843 3.033-1.755a.64.64 0 0 1 .967.56v4.704a.65.65 0 0 1-.967.56L10 20.157"/><rect width="7" height="6" x="3" y="16" rx="1"/></svg>',
            pdf: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-text"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>',
            audio: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-headphone"><path d="M4 6.835V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2h-.343"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M2 19a2 2 0 0 1 4 0v1a2 2 0 0 1-4 0v-4a6 6 0 0 1 12 0v4a2 2 0 0 1-4 0v-1a2 2 0 0 1 4 0"/></svg>',
            delete: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-x"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>',
            miscellanious: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-question-mark"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M12 17h.01"/><path d="M9.1 9a3 3 0 0 1 5.82 1c0 2-3 3-3 3"/></svg>'
        };
        // Defining row
        const row = document.createElement("div");
        row.classList.add("file-upload-row");
        row.dataset.index = String(index);
        // Defining columns
        const [mediaType, mediaSubtype] = file.type.split("/");
        const [name, fileType, icon] = [document.createElement("div"), document.createElement("div"), document.createElement("div")];
        name.classList.add("file-name");
        name.textContent = file.name;
        fileType.textContent = file.type;
        icon.innerHTML = ICONS[mediaType] ?? ICONS[mediaSubtype] ?? ICONS['miscellaneous'];
        const deleteSvg = document.createElement("div");
        deleteSvg.classList.add("upload-remover");
        deleteSvg.innerHTML = ICONS.delete;
        row.append(icon, name, fileType, deleteSvg);
        return row;
    }
    ;
})();
//# sourceMappingURL=uploadVisualizer.js.map