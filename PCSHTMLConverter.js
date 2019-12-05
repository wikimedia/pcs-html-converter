const MobileHTML = require('./mobileapps/lib/mobile/MobileHTML')
const MobileViewHTML = require('./mobileapps/lib/mobile/MobileViewHTML')

function convertParsoidHTMLToMobileHTML(parsoidHTML, metadata) {
    const doc = DOMParser(parsoidHTML)
    const mobileHTML = MobileHTML(doc, metadata)
    mobileHTML.workSync()
    mobileHTML.finalizeSync()
    mobileHTML.addMediaWikiMedatadata(metadata.mw)
    return mobileHTML.doc.outerHTML
}

function convertMobileViewToMobileHTML(mobileView, metadata) {

}

module.exports = {
    convertParsoidHTMLToMobileHTML,
    convertMobileViewToMobileHTML
}