import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Trust Center',
  description:
    'Art-directed security/trust marketing page for a fictional data platform ("Vantage Trust Center"): condensing sticky navbar, 78px gradient-ink hero over a drifting aurora + grain field that stages the 90-day uptime tick-strip card as a parallax product theater with bobbing satellite chips bleeding into the compliance band; a staggered wall of four hover-raising seal cards (SOC 2 / ISO 27001 / GDPR / HIPAA) with validating request-access email captures; a sticky-rail practices split with an oversized numeral beside the twelve-row accordion; a scheme-locked dark architecture band where a pinned scroll story advances the client→edge→vault SVG schematic (drawing connectors, clickable step rail, pointer spotlight); a subprocessor Table that collapses to cards; a responsible-disclosure card with copyable security.txt CodeBlock and PGP fingerprint row; and a three-entry security changelog. Fully reduced-motion safe. Choose it over saas-landing-page when the surface is a compliance/security trust page rather than a product pitch.',
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
