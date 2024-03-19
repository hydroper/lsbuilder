import { program } from "commander";
import fs from "fs";
import path from "path";
import { globSync } from "glob";
import { LSBuilderConfiguration } from "./LSBuilderConfiguration.js";
import { Section } from "./Section.js";
import { SectionFile } from "./SectionFile.js";
import { SectionNumber } from "./SectionNumber.js";

export class LSBuilder {
    /**
     * @type {LSBuilderConfiguration}
     */
    lsbuilderConfig;

    constructor() {
        // Parse command line options
        program.parse();

        // Parse lsbuilder.json
        this.lsbuilderConfig = new LSBuilderConfiguration();

        // Clean output
        fs.rmSync(this.lsbuilderConfig.output, { recursive: true });
        fs.mkdirSync(this.lsbuilderConfig.output, { recursive: true });

        // Copy assets
        this.copyAssets();

        // Process sections
        const sectionFiles = SectionFile.parseList(this.lsbuilderConfig.sectionFiles);
        const sections = Section.processList(sectionFiles, new SectionNumber([1]));
    }

    copyAssets() {
        const assetPaths1 = [];
        for (const assetPattern of this.lsbuilderConfig.assetFiles) {
            const m = globSync(path.resolve(process.cwd(), assetPattern));
            assetPaths1.push.apply(assetPaths1, m);
        }
        for (const assetPath of assetPaths1) {
            fs.copyFileSync(assetPath, path.resolve(this.lsbuilderConfig.output, path.basename(assetPath)));
        }
    }
}

new LSBuilder();