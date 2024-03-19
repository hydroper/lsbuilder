import fs from "fs";
import nodePath from "path";
import MarkdownIt from "markdown-it";

const markdownIt = MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
});

export class SectionFile {
    /**
     * @type {string}
     */
    path;

    /**
     * @type {string}
     */
    html;

    /**
     * @type {SectionFile[]}
     */
    subsections = [];

    constructor(path) {
        this.path = nodePath.resolve(process.cwd(), path);
        this.html = markdownIt.render(fs.readFileSync(this.path, "utf8"));
    }

    static parseList(list) {
        const result = [];
        for (const rawSection of list) {
            const section = new SectionFile(rawSection.path);
            if (rawSection.subsections instanceof Array) {
                section.subsections.push.apply(section.subsections, SectionFile.parseList(rawSection.subsections));
            }
            result.push(section);
        }
        return result;
    }
}