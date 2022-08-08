import { customSerializers, defaultDocumentLevelConfig, BaseDocumentSerializer, BaseDocumentDeserializer, documentLevelPatch, findLatestDraft, } from "sanity-plugin-studio-smartling"
import schemas from 'part:@sanity/base/schema'
import { SanityDocument } from "@sanity/client";

const myCustomSerializers = {
  ...customSerializers,
  marks: {
    internalLink: (props) => {

      const { children, value, markKey } = props;

      const reference = value?.reference?._ref;
      const anchorId = value?.anchorId;

      return `<a class="internalLink" data-reference="${reference}" href="#${anchorId ?? ''}" id=${markKey}>${children}</a>`;
    },
    externalLink: (props) => {

      const { children, value, markKey} = props;

      // const href = escapeHTML(value?.href);
      const href = value?.href;
      const anchorId = value?.anchorId;
      const target = value?.blank ? '_blank' : '';

      return `<a class="externalLink" href="${href}${anchorId ? `#${anchorId}` : ''}" target="${target}" id=${markKey}>${children}</a>`;
    },
  }
}

const myBlockDeserializers = [
  {
    deserialize(el, next) {
      if (!el.className || el.className.toLowerCase() !== 'externallink') {
        return undefined
      }

      const markDef = {
        _key: el.id,
        _type: 'externalLink',
        href: el.getAttribute('href'),
        blank: !!el.getAttribute('target')
      }

      return {
        _type: '__annotation',
        markDef: markDef,
        children: next(el.childNodes),
      }
    },
  },
  {
    deserialize(el, next) {
      if (!el.className || el.className.toLowerCase() !== 'internallink') {
        return undefined
      }

      const markDef = {
        _key: el.id,
        _type: 'internalLink',
        reference: {
          _ref: el.getAttribute('data-reference'),
          _type: 'reference'
        }
      }

      return {
        _type: '__annotation',
        markDef: markDef,
        children: next(el.childNodes),
      }
    },
  }
]

export default {
  ...defaultDocumentLevelConfig,
  exportForTranslation: async (id: string) => {
    const doc = await findLatestDraft(id)
    const serialized = BaseDocumentSerializer(schemas).serializeDocument(
      doc,
      'document',
      'en',
      [],
      myCustomSerializers
    );

    //needed for lookup by translation tab
    serialized.name = id;
    return serialized;
  },
  importTranslation: async (id: string, localeId: string, document: string) => {
    const deserialized = BaseDocumentDeserializer.deserializeDocument(
      document, {types: {}}, myBlockDeserializers) as SanityDocument
    documentLevelPatch(id, deserialized, localeId)
  },

}