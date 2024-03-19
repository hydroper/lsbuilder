import { SectionFile } from "./SectionFile.js";
import { SectionNumber } from "./SectionNumber.js";
import * as htmlparser2 from "htmlparser2";
import { DomUtils } from "htmlparser2";
import serializeDOM from "dom-serializer";
import assert from "node:assert";
import getSlug from "speakingurl";

const headingTags = ["h1", "h2", "h3", "h4", "h5", "h6"];

function getHeadingTagNumber(name) {
    return name.charCodeAt(1) - 0x30;
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
    slug;
    /**
     * @type {string | null}
     */
    label;
    /**
     * HTML content.
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
        // this.slug = getSlug("sec-" + number.toString() + " " + title, { custom: ["."] });
        this.slug = "sec-" + number.toString();
        this.label = null;
        this.content = content;
        this.subsections = [];
    }

    /**
     * @param {SectionFile[]} sectionFiles
     * @param {SectionNumber} sectionNumber
     * @returns {Section[]}
     */
    static processList(sectionFiles, sectionNumber) {
        /**
         * @type {Section[]}
         */
        const result = [];

        sectionNumber = sectionNumber.clone();

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

            // Initial section number
            const currentSectionNumber = sectionNumber.clone();

            // Initial heading tag number
            let currentHeadingTagNumber = 1;

            // Build sections
            for (let i = 0; i < headingTitles.length; i++) {
                // Track previous heading tag number
                let previousHeadingTagNumber = currentHeadingTagNumber;

                const headingTitle = headingTitles[i];

                // Detect label
                let label = null;
                let prevSibling = DomUtils.prevElementSibling(headingTitle);
                if (prevSibling != null && DomUtils.getName(prevSibling) == "p") {
                    const e = DomUtils.getChildren(prevSibling);
                    if (e.length != 0 && DomUtils.getName(e[0]) == "sectionlabel") {
                        label = DomUtils.innerText(e[0]).trim();
                    }
                }

                // Delimit content
                let domContent = null;
                let nextHeadingTitle = i + 1 < headingTitles.length ? headingTitles[i + 1] : null;
                const headingTitleParentIndex = domChildren.indexOf(headingTitle);
                if (nextHeadingTitle != null) {
                    const nextHeadingTitleParentIndex = domChildren.indexOf(nextHeadingTitle);
                    domContent = domChildren.slice(headingTitleParentIndex + 1, nextHeadingTitleParentIndex);
                } else {
                    domContent = domChildren.slice(headingTitleParentIndex + 1);
                }
                const content = serializeDOM(domContent);

                // Determine section number
                currentHeadingTagNumber = getHeadingTagNumber(DomUtils.getName(headingTitle));
                if (currentHeadingTagNumber > previousHeadingTagNumber) {
                    for (let j = previousHeadingTagNumber; j < currentHeadingTagNumber; j++) {
                        currentSectionNumber.values.push(1);
                    }
                } else {
                    for (let j = previousHeadingTagNumber; j-- > currentHeadingTagNumber;) {
                        currentSectionNumber.values.pop();
                    }
                    currentSectionNumber.increment();
                }

                // Contribute section
                const section = new Section(currentSectionNumber.clone(), DomUtils.innerText(headingTitle), content);
                section.label = label;
                let correctSubsectionList = result;
                for (let i = 1; i < currentHeadingTagNumber; i++) {
                    if (correctSubsectionList.length == 0) {
                        console.error("Section \"" + section.title + "\" (" + section.number.toString() + ") must have a parent section.");
                        process.exit(1);
                    }
                    correctSubsectionList = correctSubsectionList[correctSubsectionList.length - 1].subsections;
                }
                correctSubsectionList.push(section);
            }

            if (currentHeadingTagNumber > 1) {
                for (let i = currentHeadingTagNumber; i-- > 2;) {
                    currentSectionNumber.values.pop();
                }
                currentHeadingTagNumber = 1;
            } else if (currentHeadingTagNumber == 1) {
                currentSectionNumber.values.push(0);
            }

            for (const section of Section.processList(file.subsections, currentSectionNumber)) {
                if (result.length == 0) {
                    console.error("Section \"" + section.title + "\" (" + section.number.toString() + ") must have a parent section.");
                    process.exit(1);
                }
                result[result.length - 1].subsections.push(section);
            }

            // Increment section number
            sectionNumber.increment();
        }

        return result;
    }
}