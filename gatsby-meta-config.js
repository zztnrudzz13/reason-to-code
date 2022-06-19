/**
 * @typedef {Object} Links
 * @prop {string} github Your github repository
 */

/**
 * @typedef {Object} MetaConfig
 * @prop {string} title Your website title
 * @prop {string} description Your website description
 * @prop {string} author Maybe your name
 * @prop {string} siteUrl Your website URL
 * @prop {string} lang Your website Language
 * @prop {string} utterances Github repository to store comments
 * @prop {Links} links
 * @prop {string} favicon Favicon Path
 */

/** @type {MetaConfig} */
const metaConfig = {
  title: "Reason to Code",
  description: `Sukyeong's Blog`,
  author: "Sukyeong",
  siteUrl: "http://www.reason-to-code.com",
  lang: "utf-8",
  utterances: "zztnrudzz13/reason-to-code-comments",
  links: {
    github: "https://github.com/zztnrudzz13/reason-to-code",
  },
  favicon: "src/images/icon.png",
}

// eslint-disable-next-line no-undef
module.exports = metaConfig
