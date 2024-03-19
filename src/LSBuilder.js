import { program } from "commander";
import fs from "fs";
import path from "path";
import url from "url";
import { globSync } from "glob";
import { LSBuilderConfiguration } from "./LSBuilderConfiguration.js";
import { Section } from "./Section.js";
import { SectionFile } from "./SectionFile.js";
import { SectionNumber } from "./SectionNumber.js";
import Handlebars from "handlebars";

const thisScriptDirectory = path.resolve(url.fileURLToPath(import.meta.url), "..");

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
        if (fs.existsSync(this.lsbuilderConfig.output)) {
            fs.rmSync(this.lsbuilderConfig.output, { recursive: true });
        }
        fs.mkdirSync(this.lsbuilderConfig.output, { recursive: true });

        // Copy assets
        this.copyAssets();

        // Process sections
        const sectionFiles = SectionFile.parseList(this.lsbuilderConfig.sectionFiles);
        const sections = Section.processList(sectionFiles, new SectionNumber([0]));
        /**
         * @type {string[]}
         */
        const sectionHTML1 = [];
        this.generateSectionHTML(sections, sectionHTML1);
        const sectionHTML = sectionHTML1.join("");

        // Load layout
        const indexLayout = Handlebars.compile(fs.readFileSync(path.resolve(thisScriptDirectory, "../layout/index.hb"), "utf8"));

        // Generate index.html
        fs.writeFileSync(path.resolve(this.lsbuilderConfig.output, "index.html"), indexLayout({
            title: this.lsbuilderConfig.title,
            content: sectionHTML,
        }));

        // Copy theme files
        this.copyThemeFonts();
        this.copyThemeCSS();
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

    copyThemeFonts() {
        fs.mkdirSync(path.resolve(this.lsbuilderConfig.output, "fonts"), { recursive: true });
        const themeFiles = [];
        const m = globSync(path.resolve(thisScriptDirectory, "../theme/fonts/*"));
        themeFiles.push.apply(themeFiles, m);
        for (const themeFile of themeFiles) {
            fs.copyFileSync(themeFile, path.resolve(this.lsbuilderConfig.output, "fonts", path.basename(themeFile)));
        }
    }

    copyThemeCSS() {
        fs.mkdirSync(path.resolve(this.lsbuilderConfig.output, "css"), { recursive: true });
        const themeFiles = [];
        const m = globSync(path.resolve(thisScriptDirectory, "../theme/css/*"));
        themeFiles.push.apply(themeFiles, m);
        for (const themeFile of themeFiles) {
            fs.copyFileSync(themeFile, path.resolve(this.lsbuilderConfig.output, "css", path.basename(themeFile)));
        }
    }

    /**
     * @param {Section[]} sections 
     * @param {string[]} contentOutput
     */
    generateSectionHTML(sections, contentOutput) {
        for (const section of sections) {
            // No Math.clamp() here, so using ternary.
            const headingTagName = section.number.values.length == 1 ? "h1" : section.number.values.length == 2 ? "h2" : "h3";
            const idAttribute = section.label == null ? "" : " id=\"" + section.label.replace(/"/g, "")  + "\"";
            const headingTitle = "<" + headingTagName + idAttribute + ">" + section.number.toString() + " " + section.title + "</" + headingTagName + ">";

            contentOutput.push("<div class=\"section-title\" href=\"" + section.slug + "\">" + headingTitle + "</div>");
            contentOutput.push(section.content);

            this.generateSectionHTML(section.subsections, contentOutput);
        }
    }
}