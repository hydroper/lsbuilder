import fs from "fs";
import path from "path";

export class LSBuilderConfiguration {
    /**
     * @type {string}
     */
    title;

    /**
     * Output directory.
     * @type {string}
     */
    output;

    /**
     * Files to include in the output directory.
     */
    assetFiles;

    /**
     * Indicates the home Markdown file.
     */
    homeFile;

    /**
     * Array of section files. Section file entries
     * are in the { "path": "path/to/file.md", "subsections": [ ... ] }
     * form.
     */
    sectionFiles;

    constructor() {
        const lsbuilderConfig1 = path.resolve(process.cwd(), "lsbuilder.json");
        const lsbuilderConfig2 = fs.readFileSync(lsbuilderConfig1, "utf8");
        const { title, output, assetFiles, homeFile, sectionFiles } = JSON.parse(lsbuilderConfig2);

        this.title = String(title);
        this.output = path.resolve(process.cwd(), String(output));
        this.assetFiles = assetFiles;
        this.homeFile = homeFile;
        this.sectionFiles = sectionFiles;
    }
}