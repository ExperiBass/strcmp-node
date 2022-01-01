#!/usr/bin/env node

const chalk = require('chalk')
const {
    program
} = require('commander')
const {
    version
} = require('../package.json')

// set version and options
program.version(version)
    .option("-c, --case-sensitive", "toggles case-sensitivity.", false)
program.parse(process.argv)

let ARGS = process.argv.slice(2)
if (typeof ARGS[0] != "string" || typeof ARGS[1] != "string") {
    console.log("One of the two arguments is not a string. Exiting.")
    process.exit(1)
}

async function main() {

    // handle the "-" special bash character
    for (let i = 0; i < ARGS.length; i++) {
        const currArg = ARGS[i]
        if (currArg === "-") {
            ARGS[i] = await streamToString(process.stdin)
        }
    }
    const options = program.opts()
    let str1
    let str2
    if (options["caseSensitive"]) {
        str1 = ARGS[0]
        str2 = ARGS[1]
    } else {
        str1 = ARGS[0].toLowerCase()
        str2 = ARGS[1].toLowerCase()
    }

    compare(str1, str2)
}

function compare(master, comparison) {
    let res = ""
    let res2 = "" // used for the second line
    for (let i = 0; i < master.length; i++) {
        const str1char = master[i]
        const str2char = comparison[i]
        res += str1char
        if (str1char === str2char) {
            res2 += chalk.gray(str2char)
        } else {
            // make sure second char isn't undefined (nobody wants to see "undefinedundefinedundefined")
            res2 += chalk.redBright(str2char === undefined ? " " : str2char)
        }
    }
    console.log(res)
    console.log(res2)
}

// stolen and barely modified from
// https://stackoverflow.com/a/49428486
function streamToString(stream) {
    const chunks = [];
    return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
        stream.on('error', (err) => reject(err))
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8').replace("\n", "")))
    })
}

main()