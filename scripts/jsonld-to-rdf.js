import ParserJsonld from "@rdfjs/parser-jsonld";
import Serializer from "@rdfjs/serializer-turtle";
import ParserN3 from "@rdfjs/parser-n3";
import formats from "@rdfjs/formats-common";
import SerializerNtriples from "@rdfjs/serializer-ntriples";
import { Readable, Transform } from "stream";
import fs from "fs";
import readline from "readline";

const BASE_IRI = "https://w3id.org/docmaps/examples/";

async function processFile(fileName, callback) {
  try {
    const readStream = readline.createInterface({
      input: fs.createReadStream(fileName, "utf-8"),
    });

    let i = 0;

    for await (const line of readStream) {
      console.error(
        `${i} ... Processing graph: ${line.substring(0, 120)} with length ${line.length
        }`,
      );
      await callback(line);
      i++;
    }
  } catch (err) {
    console.error(err);
  }
}

async function processGraphString(g) {
  const input = new Readable({
    read: () => {
      input.push(g);
      input.push(null);
    },
  });

  return new Promise((res, rej) => {
    const parserJsonld = new ParserJsonld({
      baseIRI: BASE_IRI,
      steamingProfile: false,
    });
    const serializerNtriples = new SerializerNtriples();

    // TODO: include declaration that a docmap is a :Docmap
    const quads = parserJsonld.import(input);

    const nt = serializerNtriples.import(quads);
    nt.on("data", (d) => {
      process.stdout.write(d);
    })
      .on("end", () => {
        res();
      })
      .on("close", (err) => {
        if (err) {
          rej(err);
        } else {
          res();
        }
      });
  });
}

const fileName = process.argv[2];
const _ = await processFile(fileName, processGraphString);
