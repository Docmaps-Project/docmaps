import fs from 'fs'
import factory from 'rdf-ext'
import ParserN3 from '@rdfjs/parser-n3'
import SHACLValidator from 'rdf-validate-shacl'

async function loadDataset (filePath) {
  const stream = fs.createReadStream(filePath)
  const parser = new ParserN3({ factory })
  return factory.dataset().import(parser.import(stream))
}

export async function validateShacl(shapeFile, dataFile) {
  process.stdout.write(`... ${dataFile} `)

  const shapes = await loadDataset(shapeFile)
  const data = await loadDataset(dataFile)

  const validator = new SHACLValidator(shapes, { factory })
  const report = await validator.validate(data)


  // Check conformance: `true` or `false`
  console.log(report.conforms)

  if (!report.conforms) {
    for (const result of report.results) {
      // See https://www.w3.org/TR/shacl/#results-validation-result for details
      // about each property
      console.log(result.message)
      console.log(result.path)
      console.log(result.focusNode)
      console.log(result.severity)
      console.log(result.sourceConstraintComponent)
      console.log(result.sourceShape)
    }

    // Validation report as RDF dataset
    console.log(report.dataset)

    process.exit(1)
  }
}

