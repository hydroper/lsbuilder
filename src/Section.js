import { SectionFile } from "./SectionFile.js";
import { SectionNumber } from "./SectionNumber.js";
import * as htmlparser2 from "htmlparser2";
import { DomUtils } from "htmlparser2";

const headingTags = ["h1", "h2", "h3", "h4", "h5", "h6"];

function getHeadingTagNumber(name) {
    return Number(name.charAt(1));
}

export class Section {
    /**
     * @type {SectionNumber}
     */
    number;
    /**
     * @type {string}
     */
    title;
    /**
     * @type {string}
     */
    content;
    /**
     * @type {Section[]}
     */
    subsections;

    /**
     * 
     * @param {SectionNumber} number 
     * @param {string} title 
     * @param {string} content 
     */
    constructor(number, title, content) {
        this.number = number;
        this.title = title;
        this.content = content;
        this.subsections = [];
    }

    /**
     * @param {SectionFile[]} sectionFiles
     * @param {SectionNumber} sectionNumberArgument
     */
    static processList(sectionFiles, sectionNumberArgument) {
        const sectionNumber = sectionNumberArgument.clone();

        for (const file of sectionFiles) {
            const dom = htmlparser2.parseDocument(file.html);
            const domChildren = DomUtils.getChildren(dom);

            const headingTitles = [];

            // Enumerate heading titles
            for (const node of domChildren) {
                const tagName = DomUtils.getName(node);
                if (headingTags.indexOf(tagName) != -1) {
                    headingTitles.push(node);
                }
            }

            // Build sections
            for (let i = 0; i < headingTitles.length; i++) {
                const headingTitle = headingTitles[i];

                // Delimit content
                let content = null;
                let nextHeadingTitle = i + 1 < headingTitles.length ? headingTitles[i + 1] : null;
                const headingTitleParentIndex = domChildren.indexOf(headingTitle);
                if (nextHeadingTitle != null) {
                    const nextHeadingTitleParentIndex = domChildren.indexOf(nextHeadingTitle);
                    content = domChildren.slice(headingTitleParentIndex + 1, nextHeadingTitleParentIndex);
                } else {
                    content = domChildren.slice(headingTitleParentIndex + 1);
                }

                // Determine section number
                const tagNumber = getHeadingTagNumber(DomUtils.getName(headingTitle));
                const sectionNumber1 = sectionNumber.clone();
                for (let j = sectionNumber1.values.length; j < tagNumber; j++) {
                    sectionNumber1.push(1);
                }
            }

            // Increment section number
            sectionNumber.increment();
        }
    }
}