const algorithmia = require("algorithmia")
const algorithmiaApiKey = require("../credentials/algorithmia.json").apiKey
const sentenceBoundaryDetection = require("sbd")
async function robot(content){
    await fetchContentFromWikipedia(content)
    sanitizeContent(content)
    breakContentIntoSentences(content)
    
    async function fetchContentFromWikipedia(content){
        const algorithmiaAuthenticated = algorithmia(algorithmiaApiKey)
        const wikipediaAlgorithm = algorithmiaAuthenticated.algo("web/WikipediaParser/0.1.2")
        const wikipediaResponse = await wikipediaAlgorithm.pipe(content.searchTerm)
        const wikipediaContent = wikipediaResponse.get()
        
        content.sourceContentOriginal = wikipediaContent.content
    }

    function sanitizeContent(content){
        const withOutBlankLinesAndMarketDown = RemoveBlankLinesAndMarketDown(content.sourceContentOriginal)
        content.sourceContentSanitized = withOutBlankLinesAndMarketDown

        function RemoveBlankLinesAndMarketDown(text){
            const allLines = text.split('\n')
            const withOutBlank = allLines.filter((line) => {
                if(line.trim().length === 0 || line.trim().startsWith('=')){
                    return false
                }
                return true
            })
            return withOutBlank.join(' ')
        }
    }

    function breakContentIntoSentences(content){
        content.sentences = []

        const sentences = sentenceBoundaryDetection.sentences(content.sourceContentOriginal)
        sentences.forEach((sentence) =>{
            content.sentences.push({
                text: sentence,
                keywords: [],
                images: []
            })
        })
    }


}

module.exports = robot