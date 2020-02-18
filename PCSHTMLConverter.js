const MobileHTML = require('./mobileapps/lib/mobile/MobileHTML')
const MobileViewHTML = require('./mobileapps/lib/mobile/MobileViewHTML')

function convertParsoidDocumentToMobileHTML(doc, metadata = {}) {
    const mobileHTML = new MobileHTML(doc, metadata)
    mobileHTML.workSync()
    mobileHTML.finalizeSync()
    if (metadata.mw) {
        mobileHTML.addMediaWikiMetadata(metadata.mw)
    }
    return mobileHTML.doc.documentElement.outerHTML
}

function convertParsoidHTMLToMobileHTML(parsoidHTML, metadata = {}) {
    const parser = new DOMParser()
    const doc = parser.parseFromString(parsoidHTML, 'text/html')
    return convertParsoidDocumentToMobileHTML(doc, metadata)
}

function convertMobileViewJSONToMobileHTML(mobileViewJSON, domain, baseURI) {
    const parser = new DOMParser()
    const doc = parser.parseFromString('<html><head><meta charset="utf-8"><title></title></head><body></body></html>', 'text/html')
    const metadata = {
      domain,
      baseURI,
      mw: mwMetadataFromMobileViewJSON(mobileViewJSON)
    }
    const mobileView = mobileViewJSON.mobileview
    // for some reason this is expected in both the param and in the metadata obj
    metadata.mobileview = mobileView
    const parsoidDocument = MobileViewHTML.convertToParsoidDocument(doc, mobileView, metadata)
    return convertParsoidDocumentToMobileHTML(parsoidDocument, metadata)
}

/**
 * Converts mobile-sections JSON into mobile-html
 * @param {object} leadJSON - The /mobile-sections/lead response
 * @param {object} remainingJSON - The /mobile-sections/remaining response
 * @param {string} domain - The page domain
 * @param {string} baseURI - The baseURI for mobileapps services calls
 */
function convertMobileSectionsJSONToMobileHTML(leadJSON, remainingJSON, domain, baseURI) {
    function getSectionHTML(section) {
        return "<section data-mw-section-id=\"" + section.id + "\">" + section.text + "</section>"
    }
    function reducer(acc, curr) {
        return acc + "\n" + getSectionHTML(curr)
    }
    const parsoidHTML = remainingJSON.sections.reduce(reducer, getSectionHTML(leadJSON.sections[0]))
    const metadata = {
      domain,
      baseURI,
      mw: {
          pageid: leadJSON.id,
          ns: leadJSON.ns,
          displaytitle: leadJSON.displaytitle,
          protection: [],
          description: leadJSON.description,
          description_source: leadJSON.description_source
      }
    }
    return convertParsoidHTMLToMobileHTML(parsoidHTML, metadata)
}
//  *   {!array} protection
//  *   {?Object} originalimage
//  *   {!string} displaytitle
//  *   {?string} description
//  *   {?string} description_source
const mw = {
    "pageid": 4269567,
    "ns": 0,
    "title": "Dog",
    "displaytitle": "Dog",
    "contentmodel": "wikitext",
    "pagelanguage": "en",
    "pagelanguagehtmlcode": "en",
    "pagelanguagedir": "ltr",
    "touched": "2019-12-06T03:48:17Z",
    "lastrevid": 929485161,
    "length": 126950,
    "protection": [
        {
            "type": "edit",
            "level": "autoconfirmed",
            "expiry": "infinity"
        },
        {
            "type": "move",
            "level": "sysop",
            "expiry": "infinity"
        }
    ],
    "restrictiontypes": [
        "edit",
        "move"
    ],
    "description": "domestic animal",
    "description_source": "central"
}

async function testParsoid() {
    const url = "https://en.wikipedia.org/api/rest_v1/page/html/Dog"
    const meta = {
      baseURI: "http://localhost:6927/en.wikipedia.org/v1/",
      mw
    }
    const response = await fetch(url)
    const parsoidHTML = await response.text()
    const mobileHTML = convertParsoidHTMLToMobileHTML(parsoidHTML, meta)
    return mobileHTML
}

async function testMobileSections() {
    const leadURL = "https://en.wikipedia.org/api/rest_v1/page/mobile-sections-lead/Dog"
    const remainingURL = "https://en.wikipedia.org/api/rest_v1/page/mobile-sections-remaining/Dog"
    const domain = "en.wikipedia.org"
    const baseURI = "http://localhost:6927/en.wikipedia.org/v1/"
    const leadResponse = await fetch(leadURL)
    const remainingResponse = await fetch(remainingURL)
    const leadJSON = await leadResponse.json()
    const remainingJSON = await remainingResponse.json()
    const mobileHTML = convertMobileSectionsJSONToMobileHTML(leadJSON, remainingJSON, domain, baseURI)
    return mobileHTML
}

function mwMetadataFromMobileViewJSON(mobileViewJSON) {
  const protectionEntries = Object.entries(mobileViewJSON.mobileview.protection || {})
  const protection = e => { return { type: e[0], level: e[1][0], expiry: 'infinity' } }
  const restrictiontype = e => e[0]
  return {
    "pageid": mobileViewJSON.mobileview.id,
    "ns": mobileViewJSON.mobileview.ns,
    "displaytitle": mobileViewJSON.mobileview.displaytitle,
    "contentmodel": "wikitext",
    "touched": mobileViewJSON.mobileview.lastmodified,
    "lastrevid": mobileViewJSON.mobileview.revision,
    "description": mobileViewJSON.mobileview.description,
    "description_source": mobileViewJSON.mobileview.descriptionsource,
    "protection": protectionEntries.map(protection),
    "restrictiontypes": protectionEntries.map(restrictiontype)
  }
}

async function testMobileView() {
    const url = "https://en.wikipedia.org/w/api.php?action=mobileview&format=json&page=Dog&sections=all&prop=text%7Csections%7Clanguagecount%7Cthumb%7Cimage%7Cid%7Crevision%7Cdescription%7Cnamespace%7Cnormalizedtitle%7Cdisplaytitle%7Cprotection%7Ceditable&sectionprop=toclevel%7Cline%7Canchor&noheadings=1&thumbwidth=1024&origin=*"
    const response = await fetch(url)
    const mobileViewJSON = await response.json()
    const domain = "en.wikipedia.org"
    const baseURI = "http://localhost:6927/en.wikipedia.org/v1/"
    const mobileHTML = convertMobileViewJSONToMobileHTML(mobileViewJSON, domain, baseURI)
    return mobileHTML
}

module.exports = {
    convertParsoidHTMLToMobileHTML,
    convertMobileSectionsJSONToMobileHTML,
    convertMobileViewJSONToMobileHTML,
    testParsoid,
    testMobileView,
    testMobileSections
}
