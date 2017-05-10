# node-sfxbundler

`node-sfxbundler` is a Node module wrapper around the [touchifyapp/sfx](https://github.com/touchifyapp/sfx) binary.

## Getting Started

`node-sfxbundler` works as a wrapper around the `sfx` bundler.
It abstracts the commands' switches with JS object abstraction.

### Installation

`node-sfxbundler` can be installed using NPM:

```shell
$ npm install node-sfxbundler --save
```

### Usage

First import `node-sfxbundler` in your project:

```javascript
var sfxbundler = require("sfxbundler");
```

Then use sfxbundler's commands:

```javascript
sfxbundler.bundle("path/to/my.exe", "path/to/dir", { id: "my.app.id", version: "1.2.3", arch: "i386" });
```

`node-sfxbundler` uses native `Promise` to wrap asynchronous operations and resolves with the result of the command:

```javascript
sfxbundler.bundle("path/to/my.exe", { certificate: "path/to/my/cert.pfx", password: "*******" });
	.then(result => {
		result.code 	// The sfx bundler exit code.
		result.stdout 	// The sfx bundler stdout content.
		result.stderr	// The sfx bundler stderr content.
	});
```

### Command-line

`node-sfxbundler` can work as a simple wrapper around [touchifyapp/sfx](https://github.com/touchifyapp/sfx).

```shell
# Install module globally
$ npm install node-sfxbundler -g

# Run module from command line
$ sfxbundler -exe path/to/sfx.exe -dir path/to/dir -id my.app.id
```

## Documentation

### sfxbundler.bundle(dest: string, dir: string, [options: BundleOptions]): Promise<RunResult>

Bundle a new sfx Executable using sfx bootstrapper.

```typescript
/** Bundle Options */
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
```

### sfxbundler.run(args: string[], [runOptions: RunOptions]): Promise<RunResult>

Run SFX bundler by using raw arguments.

```typescript
/** Run Options */
export interface RunOptions {
    /** The current working directory to execute sfx bundler binary on. */
    cwd?: string;
    /** The inner spawn stdio option. */
    stdio?: string;
}
```

## Contribute

### Install Project dependencies

```shell
$ npm install
```

### Build project

```shell
$ npm run build
```

## License

[MIT](https://github.com/touchifyapp/node-sfxbundler/blob/master/LICENSE)