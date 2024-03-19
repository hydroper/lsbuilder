import { SectionFile } from "./SectionFile.js";
import { SectionNumber } from "./SectionNumber.js";
import * as htmlparser2 from "htmlparser2";
import { DomUtils } from "htmlparser2";
import serializeDOM from "dom-serializer";
import assert from "node:assert";

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
        this.content = content;
        this.subsections = [];
    }

    /**
     * @param {SectionFile[]} sectionFiles
     * @param {SectionNumber} sectionNumberArgument
     * @returns {Section[]}
     */
    static processList(sectionFiles, sectionNumberArgument) {
        /**
         * @type {Section[]}
         */
        const result = [];
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

            // Initial section number
            const currentSectionNumber = sectionNumber.clone();

            // Initial heading tag number
            let currentHeadingTagNumber = 1;

            // Build sections
            for (let i = 0; i < headingTitles.length; i++) {
                // Track previous section number
                let previousSectionNumber = currentSectionNumber.clone();

                // Track previous heading tag number
                let previousHeadingTagNumber = currentHeadingTagNumber;

                const headingTitle = headingTitles[i];

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
                        currentSectionNumber.push(1);
                    }
                } else {
                    for (let j = previousHeadingTagNumber; j-- > currentHeadingTagNumber;) {
                        currentSectionNumber.values.pop();
                    }
                    currentSectionNumber.increment();
                }

                // Contribute section
                const section = new Section(currentSectionNumber.clone(), DomUtils.innerText(headingTitle), content);
                let correctSubsectionList = result;
                for (let i = 1; i < currentHeadingTagNumber; i++) {
                    assert(correctSubsectionList.length != 0, "Section \"" + section.title + "\" (" + section.number.toString() + ") must have a parent section.");
                    correctSubsectionList = correctSubsectionList[correctSubsectionList.length - 1].subsections;
                }
                correctSubsectionList.push(section);

                // Increment section number
                currentSectionNumber.increment();
            }

            // Increment section number
            sectionNumber.increment();
        }

        return result;
    }
}