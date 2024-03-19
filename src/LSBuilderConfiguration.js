import path from "path";

export class LSBuilderConfiguration {
    constructor() {
        const lsbuilderConfig1 = path.resolve(process.cwd(), "lsbuilder.json");
        const lsbuilderConfig2 = fs.readFileSync(lsbuilderConfig1, "utf8");
        const { output, assetFiles, sectionFiles } = JSON.parse(lsbuilderConfig2);

        /**
         * Output directory.
         * @type {string}
         */
        this.output = path.resolve(process.cwd(), String(output));

        /**
         * File patterns to include in the output directory.
         */
        this.assetFiles = assetFiles;

        /**
         * Array of section files. Section file entries
         * are in the { "path": "path/to/file.md", "subsections": [ ... ] }
         * form.
         */
        this.sectionFiles = sectionFiles;
    }
}