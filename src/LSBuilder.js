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
        const sectionContent = this.generateSection(sections);

        // Load layout
        const indexLayout = Handlebars.compile(fs.readFileSync(path.resolve(thisScriptDirectory, "../layout/index.hb"), "utf8"));
        const scriptLayout = Handlebars.compile(fs.readFileSync(path.resolve(thisScriptDirectory, "../layout/script.js"), "utf8"));

        // Generate index.html
        fs.writeFileSync(path.resolve(this.lsbuilderConfig.output, "index.html"), indexLayout({
            title: this.lsbuilderConfig.title,
            sidebar: this.generateSidebar(sections),
            content: sectionContent,
        }));

        // Generate script.js
        fs.writeFileSync(path.resolve(this.lsbuilderConfig.output, "script.js"), scriptLayout({
            /* ... */
        }));

        // Copy theme files
        this.copyThemeFiles("fonts");
        this.copyThemeFiles("css");
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

    copyThemeFiles(directory) {
        fs.mkdirSync(path.resolve(this.lsbuilderConfig.output, directory), { recursive: true });

        const fullThemeDirectory = path.resolve(thisScriptDirectory, "../theme", directory);
        const themeFiles = fs.readdirSync(fullThemeDirectory);

        for (let i = 0; i < themeFiles.length; ++i) {
            themeFiles[i] = path.resolve(fullThemeDirectory, themeFiles[i]);
            if (!fs.lstatSync(themeFiles[i]).isFile()) {
                themeFiles.splice(i, 1);
                i--;
            }
        }
        for (const themeFile of themeFiles) {
            fs.copyFileSync(themeFile, path.resolve(this.lsbuilderConfig.output, directory, path.basename(themeFile)));
        }
    }

    /**
     * @param {Section[]} sections
     */
    generateSection(sections) {
        const output = [];
        this.generateSectionTo(output, sections);
        return output.join("");
    }

    /**
     * @param {string[]} contentOutput
     * @param {Section[]} sections 
     */
    generateSectionTo(contentOutput, sections) {
        for (const section of sections) {
            // No Math.clamp() here, so using ternary.
            const headingTagName = section.number.values.length == 1 ? "h1" : section.number.values.length == 2 ? "h2" : "h3";
            const idAttribute = section.label == null ? "" : " id=\"" + section.label.replace(/"/g, "")  + "\"";
            const headingTitle = "<" + headingTagName + idAttribute + "><span class=\"sec-title-number\" id=\"" + section.slug + "\">" + section.number.toString() + "</span> " + section.title + "</" + headingTagName + ">";

            contentOutput.push("<div class=\"section-title\" href=\"" + section.slug + "\">" + headingTitle + "</div>");
            contentOutput.push(section.content);

            this.generateSectionTo(contentOutput, section.subsections);
        }
    }

    /**
     * @param {Section[]} sections
     */
    generateSidebar(sections) {
        const output = [];
        this.generateSidebarTo(output, sections);
        return output.join("\n");
    }

    /**
     * @param {string[]} output
     * @param {Section[]} sections
     */
    generateSidebarTo(output, sections) {
        for (const section of sections) {
            const toggle = section.subsections.length != 0 ? "<button class=\"toggle\">+</button>" : "";
            const secTopClass = section.number.values.length == 1 ? " sec-top" : "";
            output.push("<div class=\"sec" + secTopClass + "\"><a href=\"#" + section.slug + "\"><span class=\"sec-num\">" + section.number.toString() + "</span><span>" + section.title + "</span></a> " + toggle + "</div>");
            if (section.subsections.length != 0) {
                output.push("<div class=\"subsections\">");
                this.generateSidebarTo(output, section.subsections);
                output.push("</div>");
            }
        }
    }
}