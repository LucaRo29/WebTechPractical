
// Suggested pipeline:
// - create a corpus
// - build w2v model (i.e., word vectors)
// - create document embeddings

const w2v = require("word2vec");
const bgTask = require("./background");
// bgTask.createCorpus("data/Answers.json", 'data/corpus.txt');
// // create embeddings only after training model
// w2v.word2vec("data/corpus.txt", "data/word_vectors.txt", {}, () => {
//     bgTask.createEmbeddings("data/Answers.json", "data/word_vectors.txt", "data/entities.txt");
//     bgTask.createEmbeddings("data/Questions.json", "data/word_vectors.txt", "data/qentities.txt");
// });
bgTask.calcQuery("R", "data/word_vectors.txt", "data/entities.txt");

