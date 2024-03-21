(() => {
    const toggleSidebarButton = document.querySelector("#menubar #toggleSidebar");

    toggleSidebarButton.addEventListener("click", _e => {
        const htmlElement = document.querySelector("html");
        htmlElement.setAttribute("data-sidebar", (!(htmlElement.getAttribute("data-sidebar") == "true")).toString());
    });

    // Click section title

    for (const title of document.querySelectorAll("#content .section-title")) {
        initializeSectionTitle(title);
    }

    /**
     * @param {HTMLDivElement} title
     */
    function initializeSectionTitle(title) {
        title.addEventListener("click", _e => {
            location.href = "#" + title.querySelector(".sec-title-number").id;
        });
    }

    // Click sidebar anchor

    for (const anchor of document.querySelectorAll("#sidebar a")) {
        initializeSidebarAnchor(anchor);
    }
    /**
     * @param {HTMLAnchorElement} anchor 
     */
    function initializeSidebarAnchor(anchor) {
        anchor.addEventListener("click", _e => {
            const se = anchor.parentElement.nextElementSibling;
            if (se != null && Array.from(se.classList.values()).includes("subsections")) {
                se.setAttribute("data-expand", "true");
            }
        });
    }

    // Toggle subsection

    for (const button of document.querySelectorAll("#sidebar .toggle")) {
        initializeToggleSubsectionButton(button);
    }
    /**
     * @param {HTMLButtonElement} button 
     */
    function initializeToggleSubsectionButton(button) {
        button.addEventListener("click", _e => {
            const se = button.parentElement.nextElementSibling;
            const expand = se.getAttribute("data-expand") != "true";
            if (!expand) {
                for (const subsec of se.querySelectorAll(".subsections")) {
                    subsec.removeAttribute("data-expand");
                }
            }
            se.setAttribute("data-expand", expand.toString());
        });
    }
})();