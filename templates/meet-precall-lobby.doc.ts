import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Meeting Pre-call Lobby',
  description:
    "Meeting pre-join lobby (greenroom) for the Kestrel Labs 'Atlas Q3 · Launch Readiness Review': a large colorScheme-locked dark camera-preview stage with a CSS silhouette self-view placeholder, mirror toggle, mute/camera IconButton overlays, a level-reactive five-bar mic pulse pill, and a joining overlay with Spinner and cancel; a device selector row with microphone / speaker / camera Selectors, a segmented live input-level meter driven by a seeded level pattern, and noise-suppression / low-light Switches; a background-effects gallery (None, two blur strengths, and Office / Harbor / Loft gradient scenes) with inset selected rings that repaints the preview backdrop; a 360px end panel with the meeting-info Card (schedule, recurrence, location, organizer, 12-invitee AvatarGroup facepile with +7 overflow, already-in roster, copyable invite link) over Join now / Present instead / Companion-mode Buttons; and a pre-call health-check LayoutFooter strip with network / camera / microphone / speaker StatusDot pills that mirror the controls plus a speaker-test action. Choose over video-call-layout when the surface is the device-check greenroom before joining rather than the in-call tile grid, control bar, and chat rail.",
  category: 'Office - Meeting Pre-call Lobby',
  componentsUsed: [
    'Avatar',
    'AvatarGroup',
    'Badge',
    'Button',
    'Card',
    'Divider',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Layout',
    'Selector',
    'Spinner',
    'StatusDot',
    'Switch',
    'Text',
    'ToggleButton',
    'Token',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
