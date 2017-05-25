import * as fs from "fs";
import * as path from "path";
import * as mkdirp from "mkdirp";

const
    downloadRelease = require("download-github-release").default,

    GITHUB_USER = "touchifyapp",
    GITHUB_REPO = "sfx",
    DEST_PATH = path.resolve(__dirname, "sfx-bin");

downloadTarget("x64")
    .then(() => downloadTarget("i386"))
    .then(() => {
        if (process.arch === "arm") {
            return downloadTarget("arm");
        }
    })
    .then(() => {
        const bundlerPath = sfxbundler();
        if (bundlerPath) {
            return chmod(bundlerPath, "755");
        }
    });

function downloadTarget(target: string): Promise<void> {
    const 
        platform = process.platform,
        dest = path.join(DEST_PATH, target);

    mkdirp.sync(dest);
    
    return downloadRelease(
        GITHUB_USER,
        GITHUB_REPO,
        dest,
        () => true,
        (asset: { name: string }) => asset.name === `sfx-${target}.zip`
    );
}

function chmod(path: string | Buffer, mode: number | string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        fs.chmod(path, <any>mode, err => {
            err ?
                reject(err) :
                resolve();
        });
    });
}

function sfxbundler(): string {
    const bin = process.platform === "win32" 
        ? "bundler.exe"
        : process.platform === "darwin"
            ? "bundlerosx"
            : "bundler";
            
    switch(process.arch) {
        case "ia32":
            return path.join(__dirname, "sfx-bin", "i386", bin);

        case "x64":
            return path.join(__dirname, "sfx-bin", "x64", bin);

        case "arm":
            return path.join(__dirname, "sfx-bin", "arm", bin);

        default:
            throw new Error("SFX is not supported in this environment");
    }
}
