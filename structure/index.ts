import S from '@sanity/desk-tool/structure-builder'
import { TranslationsTab, defaultDocumentLevelConfig } from 'sanity-plugin-studio-smartling'
import customDocumentLevelConfig from './smartlingConfig'

export const getDefaultDocumentNode = () => {
  return S.document().views([S.view.form(),
      S.view.component(TranslationsTab).title('Smartling').options(
        customDocumentLevelConfig  
        // defaultDocumentLevelConfig,
      )])
}

export default () => S.list().title('Content').items(S.documentTypeListItems())
