(() => {
    const toggleSidebarButton = document.querySelector("#menubar #toggleSidebar");

    toggleSidebarButton.addEventListener("click", _e => {
        const htmlElement = document.querySelector("html");
        htmlElement.setAttribute("data-sidebar", (!(htmlElement.getAttribute("data-sidebar") == "true")).toString());
    });
})();