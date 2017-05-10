#!/usr/bin/env node

console.log(process.argv.slice(2));

import * as bundler from "../index";

const args = process.argv.slice(2);
bundler.run(args, { stdio: "inherit" })
    .catch(err => console.error(err));