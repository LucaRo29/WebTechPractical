"use strict";
// In this file, we write a background script to convert documents to embeddings
// We use the word2vec library for the computation of the word vectors
const fs = require('fs');
const w2v = require('word2vec');

function preprocess(originalString) {
    // Write a standard preprocessing pipeline for strings
    let string = originalString.toLowerCase();
    //strip html-tags
    string = string.replace(/<[^>]*>/g, "");
    //replace special characters
    string = string.replace(/[^a-zA-Z0-9\s]+/g, " ");
    // // //remove spaces, newline, etc. at begin/end and multiples
    string = string.replace(/\s+/g, " ");
    string = string.replace(/\s+$/g, "");
    string = string.replace(/^\s+/g, "");
    return string;
}

function embeddings(model, cleanedString) {
    // Convert a cleaned string to an embedding representation using a pretrained model
    // E.g., by averaging the word embeddings
    let wordArray = cleanedString.split(/\s+/gi);
    // initialize vector with 0
    let vectorAverage;
    (vectorAverage = []).length = 100;
    vectorAverage.fill(0);

    // count of words found in model
    let n = 0;

    for (let i in wordArray) {
        let vec = model.getVector(wordArray[i]);
        if (vec != null) {
            for(let j in vectorAverage) {
                vectorAverage[j] = vectorAverage[j] + vec["values"][j];
            }
            n = n + 1;
        }
    }
    for(let j in vectorAverage) {
        if (n !== 0) {
            vectorAverage[j] = vectorAverage[j] / n;
        }
        else {
            vectorAverage[j] = 0;
        }
    }
    return vectorAverage;
}

function exportSearch(_callback) {
    w2v.loadModel("data/query_entities.txt", (error, model) => {
        let jsonSearch = model.mostSimilar("query", 10);
        let jsonAnswers = fs.readFileSync("data/Answers.json", 'utf8');
        const objAnswers = JSON.parse(jsonAnswers);
        let jsonQuestions = fs.readFileSync("data/Questions.json", 'utf8');
        const objQuestions = JSON.parse(jsonQuestions);
        let out = "{";
        for (let elem in jsonSearch) {
            let answerID = jsonSearch[elem].word.toString().substr(1);
            let questionID = objAnswers[answerID].ParentId;
            out = out + '"' + questionID + '":' + JSON.stringify(objQuestions[questionID]);
            if(elem < jsonSearch.length-1) out = out + ",\n";
        }
        out = out + "}";
        _callback(out);
    });
}

module.exports = {

createCorpus: function createCorpus(inputFile, outputFile) {
    // Create a corpus from the input file
    // Preprocess the strings
    // Write to the output file
    let processed_data = "";
    try {
        let data = fs.readFileSync(inputFile, 'utf8');
        const obj = JSON.parse(data);
        for(let elem in obj) {
            let processed_string = preprocess(obj[elem].Body);
            processed_data = processed_data + " " + processed_string;
        }
        fs.writeFileSync(outputFile, processed_data, 'utf8');
    } catch (err) {
        console.error(err);
    }
},

createEmbeddings: function createEmbeddings(inputFile, modelFile, outputFile) {
    // Create the document embeddings using the pretrained model
    // Save them for lookup of the running server
    try {
        let data = fs.readFileSync(inputFile, 'utf8');
        const obj = JSON.parse(data);
        w2v.loadModel(modelFile, (error, model) => {
            let out = Object.keys(obj).length.toString() + " 100\n";
            for(let elem in obj) {
                out = out + "i" + elem + " ";
                let processed_string = preprocess(obj[elem].Body);
                let vecAverage = embeddings(model, processed_string);

                for(let i in vecAverage) {
                    out = out + " " +  vecAverage[i].toString();
                }
                out = out + "\n";
            }
            fs.writeFileSync(outputFile, out, 'utf8');
        });

    } catch (err) {
        console.error(err);
    }
},

    calcQuery: function calcQuery(query, modelFile, entityFile, _callback) {
        try {
            //empty buffer files between searches
            fs.writeFileSync("data/query_entities.txt", "", 'utf8');

            let entities = fs.readFileSync(entityFile, 'utf8');
            //calculate entities for query
            let entitiesSplit = entities.split('\n');
            let firstline = entitiesSplit[0];
            let firstlineSplit = firstline.split(' ');
            let numEntries = Number(firstlineSplit[0]) + 1;
            let numVecs = firstlineSplit[1];
            firstline = numEntries.toString() + " " + numVecs;
            entitiesSplit[0] = firstline;
            let out = "";
            for (let line in entitiesSplit) {
                out = out + entitiesSplit[line];
                if (line < entitiesSplit.length - 1) out = out + "\n";
            }
            w2v.loadModel(modelFile, (error, model) => {
                // TODO: alter first line in doc
                out = out + "query" + " ";
                let processed_string = preprocess(query);
                let vecAverage = embeddings(model, processed_string);

                for (let i in vecAverage) {
                    out = out + " " + vecAverage[i].toString();
                }
                out = out + "\n";
                fs.writeFileSync("data/query_entities.txt", out, 'utf8');
                exportSearch(_callback);
            });

        } catch (err) {
            console.error(err);
        }
    }
};


