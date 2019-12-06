const MobileHTML = require('./mobileapps/lib/mobile/MobileHTML')
const MobileViewHTML = require('./mobileapps/lib/mobile/MobileViewHTML')

async function convertParsoidHTMLToMobileHTML(parsoidHTML, metadata) {
    const parser = new DOMParser()
    const doc = parser.parseFromString(parsoidHTML, 'text/html')
    const mobileHTML = await MobileHTML.promise(doc, metadata)
    if (metadata && metadata.mw) {
        mobileHTML.addMediaWikiMedatadata(metadata.mw)
    }
    return mobileHTML.doc.documentElement.outerHTML
}

async function convertMobileViewToMobileHTML(mobileView, metadata) {

}

module.exports = {
    convertParsoidHTMLToMobileHTML,
    convertMobileViewToMobileHTML
}