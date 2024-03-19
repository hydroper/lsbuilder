import { program } from "commander";
import fs from "fs";
import path from "path";
import { globSync } from "glob";
import { LSBuilderConfiguration } from "./LSBuilderConfiguration";

export class LSBuilder {
    constructor() {
        // Parse command line options
        program.parse();

        // Parse lsbuilder.json
        const lsbuilderConfig = new LSBuilderConfiguration();

        // Clean output
        fs.rmSync(lsbuilderConfig.output, { recursive: true });
        fs.mkdirSync(lsbuilderConfig.output, { recursive: true });

        // Copy assets
        const assetPaths1 = [];
        for (const assetPattern in lsbuilderConfig.assetFiles) {
            const m = globSync(path.resolve(process.cwd(), assetPattern));
            assetPaths1.push.apply(assetPaths1, m);
        }
        for (const assetPath in assetPaths1) {
            fs.copyFileSync(assetPath, path.resolve(lsbuilderConfig.output, path.basename(assetPath)));
        }
    }
}

new LSBuilder();