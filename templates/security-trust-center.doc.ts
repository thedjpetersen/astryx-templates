import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Trust Center',
  description:
    'Security/trust marketing page for a fictional data platform ("Vantage Trust Center"): sticky anchor navbar, assurance hero with a pulsing operational StatusDot, counting 99.98% uptime chip, and a 90-day uptime tick strip that draws in staggered on first view; a compliance wall of four seal cards (SOC 2 / ISO 27001 / GDPR / HIPAA) whose report chips open validating request-access email captures; a twelve-row practices accordion grouped by Encryption/Access/Infrastructure/People; an interactive client→edge→vault SVG data-flow schematic with a per-node detail panel; a subprocessor Table that collapses to cards; a responsible-disclosure card with copyable security.txt CodeBlock and PGP fingerprint row; and a three-entry security changelog. Choose it over saas-landing-page when the surface is a compliance/security trust page rather than a product pitch.',
  category: 'Marketing - Trust Center',
  componentsUsed: [
    'Button',
    'CodeBlock',
    'Collapsible',
    'Divider',
    'Icon',
    'Layout',
    'StatusDot',
    'Table',
    'Text',
    'TextInput',
    'Toast',
    'Token',
  ],
} satisfies AstryxPageTemplate;

export default template;
