import { JsonLdParser } from "jsonld-streaming-parser";
import { Readable } from "stream";
import readline from "readline";
import SerializerNtriples from "@rdfjs/serializer-ntriples";
import util from "util";
import axios from "axios";
import { readFileSync } from "fs";

const OXIGRAPH_STORE_URL =
  process.env["DM_DEV_OXIGRAPH_URL"] || "http://localhost:33378";

const contextObject = JSON.parse(
  readFileSync("docmaps-context.jsonld").toString(),
);

const ONLY_DOCMAPS_LOADER = {
  load: (url: string) => {
    return Promise.resolve(contextObject);
  },
};

async function uploadNtriples(nt: Buffer): Promise<any> {
  return axios.post(`${OXIGRAPH_STORE_URL}/store?default`, nt, {
    headers: {
      "Content-Type": "application/n-triples",
      "Content-Length": Buffer.byteLength(nt),
    },
  });
}

const waiters: Promise<any>[] = [];

const rl = readline.createInterface({
  input: process.stdin,
  // output: process.stdout,
});

rl.on("line", (line) => {
  const parseAndUpload = new Promise<string>((res, _rej) => {
    console.log(`>> Parsing this json line: ${line}`);
    const s = new Readable({
      read: () => {
        s.push(line);
        s.push(null);
      },
    });

    const jsonld = new JsonLdParser({ documentLoader: ONLY_DOCMAPS_LOADER });
    const nt = new SerializerNtriples();
    let nt_str = "";

    // read the input from stdin as json-ld streaming parser
    const p1 = jsonld.import(s);

    p1.on("data", (d) => {
      console.log(d);
    });

    // stream output to nt
    const output = nt.import(p1);
    output.on("data", (d) => {
      nt_str += d.toString();
    });

    output.on("end", (_) => {
      console.log(`>>> to upload: ${nt_str}`);
      res(nt_str);
    });
  }).then(async (str) => {
    const result = await uploadNtriples(Buffer.from(str));
    console.log(
      `Uploading finished with response: ${util.inspect(
        {
          status: result.status,
          statusText: result.statusText,
          headers: result.headers,
        },
        { depth: 1 },
      )}`,
    );
  });

  waiters.push(parseAndUpload);
});

rl.once("close", () => {
  // end of input
});

await Promise.all(waiters);
