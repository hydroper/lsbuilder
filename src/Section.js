export class Section {
    constructor(title, content) {
        /**
         * @type {string}
         */
        this.title = title;
        /**
         * @type {string}
         */
        this.content = content;
        /**
         * @type {Section[]}
         */
        this.subsections = [];
    }
}