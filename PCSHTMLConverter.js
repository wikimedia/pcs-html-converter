const MobileHTML = require('./mobileapps/lib/mobile/MobileHTML')
const MobileViewHTML = require('./mobileapps/lib/mobile/MobileViewHTML')

async function convertParsoidDocumentToMobileHTML(doc, metadata = {}) {
    const mobileHTML = await MobileHTML.promise(doc, metadata)
    if (metadata.mw) {
        mobileHTML.addMediaWikiMedatadata(metadata.mw)
    }
    return mobileHTML.doc.documentElement.outerHTML
}

async function convertParsoidHTMLToMobileHTML(parsoidHTML, metadata = {}) {
    const parser = new DOMParser()
    const doc = parser.parseFromString(parsoidHTML, 'text/html')
    return await convertParsoidDocumentToMobileHTML(doc, metadata)
}

async function convertMobileViewJSONToMobileHTML(mobileViewJSON, metadata = {}) {
    const parser = new DOMParser()
    const doc = parser.parseFromString('<html><head><meta charset="utf-8"><title></title></head><body></body></html>', 'text/html')
    const mobileView = mobileViewJSON.mobileview
    // for some reason this is expected in both the param and in the metadata obj
    metadata.mobileview = mobileView
    const parsoidDocument = MobileViewHTML.convertToParsoidDocument(doc, mobileView, metadata)
    return await convertParsoidDocumentToMobileHTML(parsoidDocument, metadata)
}

module.exports = {
    convertParsoidHTMLToMobileHTML,
    convertMobileViewJSONToMobileHTML
}