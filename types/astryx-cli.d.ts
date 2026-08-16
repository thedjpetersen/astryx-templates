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

/** External integration envelope accepted by parseTemplate(). */
export type AstryxIntegrationTemplate = AstryxTemplateInput & {
  type: 'page' | 'block';
};
