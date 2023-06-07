// see PublisherT
const A: Validation<PublisherT> = Publisher.decode({
  id: 'https://docmaps-project.github.io/ex/publisher',
  logo: 'https://docmaps-project.github.io/ex/publisher/logo',
  name: 'DocMaps',
  homepage: 'https://docmaps-project.github.io/ex/publisher/homepage',
  url: 'https://docmaps-project.github.io/ex/publisher/url',
  account: {
    id: 'https://docmaps-project.github.io/ex/onlineaccount',
    service: 'https://docmaps-project.github.io/ex/onlineaccount/www'
  }
});
