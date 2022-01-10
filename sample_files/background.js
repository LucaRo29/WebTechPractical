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

function createCorpus(inputFile, outputFile) {
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
        // console.log(processed_data);
        fs.writeFileSync(outputFile, processed_data, 'utf8');
    } catch (err) {
        console.error(err);
    }
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
        vectorAverage[j] = vectorAverage[j] / n;
    }
    return vectorAverage;
}

function createEmbeddings(inputFile, modelFile, outputFile) {
    // Create the document embeddings using the pretrained model
    // Save them for lookup of the running server
    try {
        console.log("- - - - - - - - Start embedding - - - - - - - - ");
        let data = fs.readFileSync(inputFile, 'utf8');
        const obj = JSON.parse(data);
        w2v.loadModel(modelFile, (error, model) => {
            let out = Object.keys(obj).length.toString() + " 100\n";
            for(let elem in obj) {
                console.log(elem);
                out = out + elem + " ";
                let processed_string = preprocess(obj[elem].Body);
                let vecAverage = embeddings(model, processed_string);

                for(let i in vecAverage) {
                    out = out + " " +  vecAverage[i].toString();
                }
                out = out + "\n";
            }
            fs.writeFileSync(outputFile, out, 'utf8');
            console.log("- - - - - - - - End embedding - - - - - - - - ");
        });

    } catch (err) {
        console.error(err);
    }
}

// Suggested pipeline:
// - create a corpus
// - build w2v model (i.e., word vectors)
// - create document embeddings
createCorpus("data/Answers.json", 'data/corpus.txt');
//create embeddings only after training model
w2v.word2vec("data/corpus.txt", "data/word_vectors.txt", {}, () => {
    createEmbeddings("data/Answers.json", "data/word_vectors.txt", "data/entities.txt");
    createEmbeddings("data/Questions.json", "data/word_vectors.txt", "data/qentities.txt");
});

