// see ManifestationT
const A: Validation<ManifestationT> = Manifestation.decode({
  type: 'web-page',
  id: 'https://docmaps-project.github.io/ex/manifestation',
  service: 'https://docmaps-project.github.io/ex/manifestation/service',
  url: 'https://docmaps-project.github.io/ex/manifestation/url'
});
