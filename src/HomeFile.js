import fs from "fs";
import nodePath from "path";
import MarkdownIt from "markdown-it";

const markdownIt = MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
});

export class HomeFile {
    /**
     * @type {string}
     */
    path;

    /**
     * @type {string}
     */
    html;

    constructor(path) {
        this.path = nodePath.resolve(process.cwd(), path);
        this.html = markdownIt.render(fs.readFileSync(this.path, "utf8"));
    }
}