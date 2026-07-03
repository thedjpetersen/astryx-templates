import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Identity & SSO Administration',
  description:
    'Identity-admin console of the Kestrel Labs workforce platform (the platform is the IdP for the 140-person company): clickable posture chips (8 connections · 7 active · 1 cert expiring) and a SAML/OIDC SegmentedControl scope a sortable SSO connections Table (app glyph + protocol/provisioning line, active/disabled StatusDot, labelled 7-day sign-in sparkbars with totals, credential-expiry countdown with one amber SAML cert 23 days out, assigned seats, last sign-in, per-row actions menu); selecting a row opens a connection detail strip (entity/client ID, ACS or redirect URI, cert serial with a working Rotate that clears the amber countdown and the chip, SCIM/JIT provisioning with group tokens, app owner). Below sit a directory-sync panel (SCIM 2.0 from Kestrel HRIS, 140 users · 12 groups · 6 push targets, last/next sync, 2 error rows tied to the in-flight hires Ava Lindqvist and Ken Tanaka with Retry), a password-policy card with per-rule met/attention org compliance (140/140 length, 3 breach-flagged with Force reset), and a session-policy card (12h session, 2h idle, 4h admin re-auth, step-up MFA for payroll). A 340px enforcement rail — folding into the column below 1180px — carries the MFA meter (128 of 140 enrolled, passkey/authenticator/hardware-key split bar with legend), the 12 unenrolled employees with per-row and bulk Remind, and the break-glass note (2 sealed admin accounts, dual custody, rotation-drill dates). Choose over cert-key-inventory when the expiring credentials are IdP signing certs and client secrets attached to SSO connections inside an identity console, not a fleet-wide TLS certificate lifecycle; over it-app-provisioning when the job is authentication posture (SSO connections, MFA, password/session policy, directory sync), not per-app seat grants; and over auth-sign-in-showcase when the surface is the admin configuration console, not end-user sign-in screens.',
  category: 'Workforce IT',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Button',
    'Divider',
    'DropdownMenu',
    'EmptyState',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Layout',
    'MetadataList',
    'SegmentedControl',
    'StackItem',
    'StatusDot',
    'Table',
    'Text',
    'Timestamp',
    'ToggleButton',
    'Token',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
