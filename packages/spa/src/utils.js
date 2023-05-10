// import { fetchPublicationByDoi, CrossrefClient } from 'ts-etl'
// import * as D from 'docmaps-sdk'
// import { either } from 'fp-ts/lib/Either'
//
// export async function fetchData() {
// 	// Create a CrossrefClient instance
// 	const client = new CrossrefClient();
//
// 	// Create a DocmapPublisherT instance (replace with appropriate values)
// 	const publisher = new D.DocmapPublisherT(/*...publisher values...*/);
//
//   const result: ErrorOrDocmap = await fetchPublicationByDoi(
//     client,
//     publisher,
//     inputUrl
//   );
//
//   either.fold(
//     (error) => {
//       // Handle the error case (e.g., display an error message)
//       console.error('Error:', error);
//     },
//     (docmap: D.DocmapT[]) => {
//       // Handle the success case
//       const resultArea = document.getElementById('resultArea');
//       const renderRev = document.createElement('render-rev');
//       renderRev.setAttribute('source', JSON.stringify(docmap));
//       resultArea.appendChild(renderRev);
//     }
//   )(result);
// }

export function configureForDoiString(rev, str) {

  let config = {
    display: {
      publisherName: name => name.toUpperCase(),
    }
  }

  try {
    const url = new URL(str);
    config["docmapsUrl"] = (_) => str;
  } catch (e) {
    config["doi"] = str;
  }
  console.log('running with', rev, str)

  rev.configure({
    ...config,
  });
}
