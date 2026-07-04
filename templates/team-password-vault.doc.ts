import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Team Password Vault',
  description:
    '1Password-style team credential manager for the fictional startup Keyline (deep-green accent): a 260px vault rail (Personal/Engineering/Operations vaults with item counts, category scopes, and a Watchtower-style Security check entry with an alert badge), a 340px item-list column of logins with site monograms, favorite stars, and last-used timestamps, and an item detail pane with copyable website/username rows, a concealed password row with reveal/copy and a strength chip, a frozen 30-second TOTP countdown ring with the current code, custom fields, a shared-with facepile, and item history. A security-report strip (3 weak / 2 reused / 1 breach-exposed with fix CTAs) spans the top of the content region and an "auto-locks in 8 min" unlock hint chip sits in the header. Choose over settings-secrets-env when the surface is a standalone team credential manager organized by vaults, people, and password health — not a deployment-settings page of environment variables and webhooks.',
  category: 'Startup Showcase',
  componentsUsed: [
    'Avatar',
    'AvatarGroup',
    'Badge',
    'Button',
    'Divider',
    'EmptyState',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Layout',
    'List',
    'MoreMenu',
    'Selector',
    'StackItem',
    'Text',
    'TextInput',
    'Timestamp',
    'Token',
    'TreeList',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
