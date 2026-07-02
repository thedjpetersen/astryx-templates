declare module '@astryxdesign/cli/integration' {
  export interface AstryxIntegration {
    components?: string;
    templates?: string;
    codemods?: string;
    issuesUrl?: string;
  }

  export function createIntegration<T extends AstryxIntegration>(integration: T): T;
}

declare module '@astryxdesign/cli/template' {
  export interface AstryxTemplatePreview {
    image?: string;
    aspectRatio?: string;
  }

  export interface AstryxTemplateInput {
    name: string;
    description: string;
    category?: string;
    componentsUsed?: string[];
    preview?: AstryxTemplatePreview;
  }

  export type AstryxPageTemplate = AstryxTemplateInput & {type: 'page'};
  export type AstryxBlockTemplate = AstryxTemplateInput & {type: 'block'};
}

