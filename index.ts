import * as path from "path";
import * as fs from "fs";
import { spawn, SpawnOptions } from "child_process";

export interface BundleOptions extends RunOptions {
    /** A unique ID for the result SFX. (default: from dest name). */
    id?: string;
    /** The Bootstrapper architecture. */
    arch?: "i386" | "x64";
    /** The Bootstrapper Type (default: `sfx`). Set `sfxv` for verbose extraction. */
    type?: "sfx" | "sfxv";
    /** The program to run in the project directory (default: auto-detect). */
    run?: string;
    /** The absolute destination path to extract project in (default: `${os.tempdir()}/${id}`). */
    dest?: string;
    /** Arguments to pass to executable. */
    args?: string[];
    /** The program version to check for updates. */
    version?: string;
    /** The compression level. */
    compress?: number;
    
    /** Print verbose success and status messages. This may also provide slightly more information on error. */
    verbose?: boolean;
}

export interface RunOptions {
    /** The current working directory to execute sfx bundler binary on. */
    cwd?: string;
    /** The inner spawn stdio option. */
    stdio?: string;
}

export interface RunResult {
    /** The sfx bundler exit code. */
    code: number;
    /** The sfx bundler stdout content. */
    stdout: string;
    /** The sfx bundler stderr content. */
    stderr: string;
}

export type RunError = Error & RunResult & { command: string; args: string[] };

/** 
 * Bundle a new sfx Executable using sfx bootstrapper.
 * 
 * @param dest      The destination executable file.
 * @param dir       The directory to embed in the SFX.
 * @param [options] The options for the bundler.
 */
export function bundle(dest: string, dir: string, options: BundleOptions = {}): Promise<RunResult> {
    const args = [] as string[];

    args.push("-exe", dest);
    args.push("-dir", dir);

    if (!undef(options.id)) args.push("-id", options.id);
    else args.push("-id", path.basename(dest, ".exe"));
    
    if (!undef(options.run)) args.push("-run", options.run);
    if (!undef(options.dest)) args.push("-dest", options.dest);
    if (!undef(options.version)) args.push("-version", options.version);
    if (!undef(options.compress)) args.push("-compress", options.compress.toString());

    if (options.args && options.args.length) {
        args.push("-args", options.args.join(" "));
    }

    if (options.verbose) args.push("-v");

    return copy(dest, options)
        .then(() => run(args, options));
}

/**
 * Run SFX bundler by using raw arguments.
 * 
 * @param args      The arguments to pass to bundler.
 * @param [options] The options for child_process.spawn.
 */
export function run(args: string[], options: RunOptions = {}): Promise<RunResult> {
    return new Promise<RunResult>((resolve, reject) => {
        let cmd = sfxbundler();

        const childOptions = {} as SpawnOptions;
        if (!undef(options.cwd)) childOptions.cwd = options.cwd;
        if (!undef(options.stdio)) childOptions.stdio = options.stdio;

        const child = spawn(cmd, args, childOptions);

        let stdout = "", stderr = "";
        if (options.stdio !== "ignore" && options.stdio !== "inherit") {
            child.stdout.on("data", data => { stdout += String(data); });
            child.stderr.on("data", data => { stderr += String(data); });
        }

        child.on("error", reject);
        child.on("close", code => {
            if (code === 0) {
                return resolve({ code, stdout, stderr });
            }

            const err = new Error(`SFX Bundler exited with code ${code}`) as RunError;
            err.command = cmd;
            err.args = args;
            err.code = code;
            err.stdout = stdout;
            err.stderr = stderr;

            if (err.stderr) {
                err.message = err.message + "\n" + err.stderr;
            }

            reject(err);
        });
    });
}

/*
 * PRIVATE METHODS
 */

function copy(dest: string, options: BundleOptions): Promise<void> {
    const src = sfxboostrapper(options.type || "sfx", options.arch || "x64");

    return new Promise<void>((resolve, reject) => {
        fs.createReadStream(src)
            .pipe(fs.createWriteStream(dest))
            .on("error", reject)
            .on("finish", resolve)
    });
}

function undef(val: any): val is undefined {
    return typeof val === "undefined";
}

function sfxbundler(): string {
    if ((<any>sfxbundler).result) return (<any>sfxbundler).result;

    const bin = process.platform === "win32" ? "bundler.exe" : "bundler";

    switch(process.arch) {
        case "ia32":
            return ((<any>sfxbundler).result = path.join(__dirname, "sfx-bin", "i386", bin));

        case "x64":
            return ((<any>sfxbundler).result = path.join(__dirname, "sfx-bin", "x64", bin));

        case "arm":
            return ((<any>sfxbundler).result = path.join(__dirname, "sfx-bin", "arm", bin));

        default:
            throw new Error("SFX is not supported in this environment");
    }
}

function sfxboostrapper(type: "sfx" | "sfxv", arch: "i386" | "x64"): string {
    return path.join(__dirname, "sfx-bin", arch, type + ".exe");
}