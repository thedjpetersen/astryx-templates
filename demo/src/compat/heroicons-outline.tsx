import type {SVGProps} from 'react';

type IconProps = SVGProps<SVGSVGElement>;

function DemoIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}>
      <path d="M12 4v16" />
      <path d="M4 12h16" />
      <path d="M7 7l10 10" opacity={0.35} />
    </svg>
  );
}

export const ArrowPathIcon = DemoIcon;
export const BellAlertIcon = DemoIcon;
export const BellIcon = DemoIcon;
export const BookmarkIcon = DemoIcon;
export const ChatBubbleLeftRightIcon = DemoIcon;
export const Cog6ToothIcon = DemoIcon;
export const EllipsisHorizontalIcon = DemoIcon;
export const HashtagIcon = DemoIcon;
export const HomeIcon = DemoIcon;
export const InboxIcon = DemoIcon;
export const MagnifyingGlassIcon = DemoIcon;
export const PencilSquareIcon = DemoIcon;
export const PlusIcon = DemoIcon;
export const UserGroupIcon = DemoIcon;
export const XMarkIcon = DemoIcon;

