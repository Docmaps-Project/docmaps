import ParserJsonld from '@rdfjs/parser-jsonld'
import Serializer from '@rdfjs/serializer-turtle'
import ParserN3 from '@rdfjs/parser-n3'
import formats from '@rdfjs/formats-common'
import SerializerNtriples from '@rdfjs/serializer-ntriples'
import { Readable, Transform } from 'stream'
import fs from "fs";

const BASE_IRI='https://w3id.org/docmaps/examples/'

async function loadFile(fileName) {
  try {
    const data = await fs.promises.readFile(fileName, "utf-8");
    return data;
  } catch (err) {
    console.error(err);
  }
}

const fileName = process.argv[2];
const  data = await loadFile(fileName);

const parserJsonld = new ParserJsonld({baseIRI: BASE_IRI})
const serializerNtriples = new SerializerNtriples()
const serializer = new Serializer()

const input = new Readable({
  read: () => {
    input.push(data)
    input.push(null)
  }
})

// TODO: include declaration that a docmap is a :Docmap
const quads = parserJsonld.import(input)

const nt = serializerNtriples.import(quads)

// TODO: add conversion to turtle as well.
nt.pipe(process.stdout)

