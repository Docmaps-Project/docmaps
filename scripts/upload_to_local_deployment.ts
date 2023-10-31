import { JsonLdParser } from "jsonld-streaming-parser";
import SerializerNtriples from "@rdfjs/serializer-ntriples";
import util from "util";
import axios from "axios";

const OXIGRAPH_STORE_URL =
  process.env["DM_DEV_OXIGRAPH_URL"] || "http://localhost:33378";

async function uploadNtriples(nt: Buffer): Promise<any> {
  return axios.post(`${OXIGRAPH_STORE_URL}/store?default`, nt, {
    headers: {
      "Content-Type": "application/n-triples",
      "Content-Length": Buffer.byteLength(nt),
    },
  });
}

const parseAndUpload = new Promise<string>((res, _rej) => {
  const jsonld = new JsonLdParser();
  const nt = new SerializerNtriples();
  let nt_str = "";

  // read the input from stdin as json-ld streaming parser
  process.stdin.pipe(jsonld);

  // stream output to nt
  const output = nt.import(jsonld);
  output.on("data", (d) => {
    nt_str += d.toString();
  });

  output.on("end", (_) => {
    console.log(`to upload: ${nt_str}`);
    res(nt_str);
  });
});

const result = await parseAndUpload.then((str) => {
  return uploadNtriples(Buffer.from(str));
});

console.log(
  `Uploading finished with response: ${util.inspect(
    {
      status: result.status,
      statusText: result.statusText,
      headers: result.headers,
    },
    { depth: 1 }
  )}`
);
