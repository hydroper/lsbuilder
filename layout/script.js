(() => {
    const toggleSidebarButton = document.querySelector("#menubar #toggleSidebar");

    toggleSidebarButton.addEventListener("click", _e => {
        const htmlElement = document.querySelector("html");
        htmlElement.setAttribute("data-sidebar", (!(htmlElement.getAttribute("data-sidebar") == "true")).toString());
    });

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