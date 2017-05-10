import * as path from "path";
import * as mkdirp from "mkdirp";

const
    downloadRelease = require("download-github-release").default,

    GITHUB_USER = "touchifyapp",
    GITHUB_REPO = "sfx",
    VERSION = require("./package").version,
    DEST_PATH = path.resolve(__dirname, "sfx-bin");

downloadTarget("x64")
    .then(() => downloadTarget("i386"))
    .then(() => {
        if (process.arch === "arm") {
            return downloadTarget("arm");
        }
    });

function downloadTarget(target: string): Promise<void> {
    const dest = path.join(DEST_PATH, target);
    mkdirp.sync(dest);
    
    return downloadRelease(
        GITHUB_USER,
        GITHUB_REPO,
        dest,
        () => true,
        (asset: { name: string }) => asset.name === `sfx-${target}.zip`
    );
}
