import type {ComponentType} from 'react';

import ActivationFunnelAnalytics from '../../templates/activation-funnel-analytics';
import activationFunnelAnalyticsSource from '../../templates/activation-funnel-analytics.tsx?raw';
import AiChatArtifact from '../../templates/ai-chat-artifact';
import aiChatArtifactSource from '../../templates/ai-chat-artifact.tsx?raw';
import AiChatToolStream from '../../templates/ai-chat-tool-stream';
import aiChatToolStreamSource from '../../templates/ai-chat-tool-stream.tsx?raw';
import AlbumTracklistPlayer from '../../templates/album-tracklist-player';
import albumTracklistPlayerSource from '../../templates/album-tracklist-player.tsx?raw';
import ArtifactPinDock from '../../templates/artifact-pin-dock';
import artifactPinDockSource from '../../templates/artifact-pin-dock.tsx?raw';
import AutomationRuleBuilder from '../../templates/automation-rule-builder';
import automationRuleBuilderSource from '../../templates/automation-rule-builder.tsx?raw';
import BrowserSessionReplay from '../../templates/browser-session-replay';
import browserSessionReplaySource from '../../templates/browser-session-replay.tsx?raw';
import CliPairingConsole from '../../templates/cli-pairing-console';
import cliPairingConsoleSource from '../../templates/cli-pairing-console.tsx?raw';
import CodeBlockTerminal from '../../templates/codeblock-terminal';
import codeblockTerminalSource from '../../templates/codeblock-terminal.tsx?raw';
import CommandPaletteLauncher from '../../templates/command-palette-launcher';
import commandPaletteLauncherSource from '../../templates/command-palette-launcher.tsx?raw';
import CompactionInspector from '../../templates/compaction-inspector';
import compactionInspectorSource from '../../templates/compaction-inspector.tsx?raw';
import ComposerStateGallery from '../../templates/composer-state-gallery';
import composerStateGallerySource from '../../templates/composer-state-gallery.tsx?raw';
import DashboardExecutiveSummary from '../../templates/dashboard-executive-summary';
import dashboardExecutiveSummarySource from '../../templates/dashboard-executive-summary.tsx?raw';
import DashboardFilterable from '../../templates/dashboard-filterable';
import dashboardFilterableSource from '../../templates/dashboard-filterable.tsx?raw';
import DashboardSplit from '../../templates/dashboard-split';
import dashboardSplitSource from '../../templates/dashboard-split.tsx?raw';
import DashboardTabbed from '../../templates/dashboard-tabbed';
import dashboardTabbedSource from '../../templates/dashboard-tabbed.tsx?raw';
import DashboardWidgetGrid from '../../templates/dashboard-widget-grid';
import dashboardWidgetGridSource from '../../templates/dashboard-widget-grid.tsx?raw';
import DeploymentDetail from '../../templates/deployment-detail';
import deploymentDetailSource from '../../templates/deployment-detail.tsx?raw';
import DiffViewer from '../../templates/diff-viewer';
import diffViewerSource from '../../templates/diff-viewer.tsx?raw';
import FeatureGateConsole from '../../templates/feature-gate-console';
import featureGateConsoleSource from '../../templates/feature-gate-console.tsx?raw';
import FileBrowserPreview from '../../templates/file-browser-preview';
import fileBrowserPreviewSource from '../../templates/file-browser-preview.tsx?raw';
import FleetNodeStatus from '../../templates/fleet-node-status';
import fleetNodeStatusSource from '../../templates/fleet-node-status.tsx?raw';
import FormInlineEdit from '../../templates/form-inline-edit';
import formInlineEditSource from '../../templates/form-inline-edit.tsx?raw';
import FormModal from '../../templates/form-modal';
import formModalSource from '../../templates/form-modal.tsx?raw';
import FormPage from '../../templates/form-page';
import formPageSource from '../../templates/form-page.tsx?raw';
import FormSideSheet from '../../templates/form-side-sheet';
import formSideSheetSource from '../../templates/form-side-sheet.tsx?raw';
import FormWizard from '../../templates/form-wizard';
import formWizardSource from '../../templates/form-wizard.tsx?raw';
import Inbox from '../../templates/inbox';
import inboxSource from '../../templates/inbox.tsx?raw';
import IncidentConsole from '../../templates/incident-console';
import incidentConsoleSource from '../../templates/incident-console.tsx?raw';
import InfiniteScrollFeed from '../../templates/infinite-scroll-feed';
import infiniteScrollFeedSource from '../../templates/infinite-scroll-feed.tsx?raw';
import KanbanBoard from '../../templates/kanban-board';
import kanbanBoardSource from '../../templates/kanban-board.tsx?raw';
import KpiDashboard from '../../templates/kpi-dashboard';
import kpiDashboardSource from '../../templates/kpi-dashboard.tsx?raw';
import KpiStrip from '../../templates/kpi-strip';
import kpiStripSource from '../../templates/kpi-strip.tsx?raw';
import LiveStreamViewer from '../../templates/live-stream-viewer';
import liveStreamViewerSource from '../../templates/live-stream-viewer.tsx?raw';
import LogsExplorer from '../../templates/logs-explorer';
import logsExplorerSource from '../../templates/logs-explorer.tsx?raw';
import MailCompose from '../../templates/mail-compose';
import mailComposeSource from '../../templates/mail-compose.tsx?raw';
import MailSearchBuilder from '../../templates/mail-search-builder';
import mailSearchBuilderSource from '../../templates/mail-search-builder.tsx?raw';
import MailThreadReader from '../../templates/mail-thread-reader';
import mailThreadReaderSource from '../../templates/mail-thread-reader.tsx?raw';
import MediaAssetPipeline from '../../templates/media-asset-pipeline';
import mediaAssetPipelineSource from '../../templates/media-asset-pipeline.tsx?raw';
import MemoryRelationExplorer from '../../templates/memory-relation-explorer';
import memoryRelationExplorerSource from '../../templates/memory-relation-explorer.tsx?raw';
import MessagingShell from '../../templates/messaging-shell';
import messagingShellSource from '../../templates/messaging-shell.tsx?raw';
import NewsletterComposer from '../../templates/newsletter-composer';
import newsletterComposerSource from '../../templates/newsletter-composer.tsx?raw';
import NotebookReport from '../../templates/notebook-report';
import notebookReportSource from '../../templates/notebook-report.tsx?raw';
import NotificationCenter from '../../templates/notification-center';
import notificationCenterSource from '../../templates/notification-center.tsx?raw';
import OnboardingGuidedInstall from '../../templates/onboarding-guided-install';
import onboardingGuidedInstallSource from '../../templates/onboarding-guided-install.tsx?raw';
import OperationsDashboard from '../../templates/operations-dashboard';
import operationsDashboardSource from '../../templates/operations-dashboard.tsx?raw';
import PodcastEpisodePlayer from '../../templates/podcast-episode-player';
import podcastEpisodePlayerSource from '../../templates/podcast-episode-player.tsx?raw';
import ProductList from '../../templates/product-list';
import productListSource from '../../templates/product-list.tsx?raw';
import ProfilePage from '../../templates/profile-page';
import profilePageSource from '../../templates/profile-page.tsx?raw';
import ScheduledJobsManager from '../../templates/scheduled-jobs-manager';
import scheduledJobsManagerSource from '../../templates/scheduled-jobs-manager.tsx?raw';
import ScheduledSendOutbox from '../../templates/scheduled-send-outbox';
import scheduledSendOutboxSource from '../../templates/scheduled-send-outbox.tsx?raw';
import SearchResults from '../../templates/search-results';
import searchResultsSource from '../../templates/search-results.tsx?raw';
import SenderProfileRail from '../../templates/sender-profile-rail';
import senderProfileRailSource from '../../templates/sender-profile-rail.tsx?raw';
import SettingsExtensionCatalog from '../../templates/settings-extension-catalog';
import settingsExtensionCatalogSource from '../../templates/settings-extension-catalog.tsx?raw';
import SettingsSecretsEnv from '../../templates/settings-secrets-env';
import settingsSecretsEnvSource from '../../templates/settings-secrets-env.tsx?raw';
import SharedTeamInbox from '../../templates/shared-team-inbox';
import sharedTeamInboxSource from '../../templates/shared-team-inbox.tsx?raw';
import ShellBreadcrumb from '../../templates/shell-breadcrumb';
import shellBreadcrumbSource from '../../templates/shell-breadcrumb.tsx?raw';
import ShellLeftSidebar from '../../templates/shell-left-sidebar';
import shellLeftSidebarSource from '../../templates/shell-left-sidebar.tsx?raw';
import ShellTopNav from '../../templates/shell-top-nav';
import shellTopNavSource from '../../templates/shell-top-nav.tsx?raw';
import ShellTopNavSidebar from '../../templates/shell-top-nav-sidebar';
import shellTopNavSidebarSource from '../../templates/shell-top-nav-sidebar.tsx?raw';
import SkillPackageDetail from '../../templates/skill-package-detail';
import skillPackageDetailSource from '../../templates/skill-package-detail.tsx?raw';
import SlideDeckViewer from '../../templates/slide-deck-viewer';
import slideDeckViewerSource from '../../templates/slide-deck-viewer.tsx?raw';
import SpamQuarantineConsole from '../../templates/spam-quarantine-console';
import spamQuarantineConsoleSource from '../../templates/spam-quarantine-console.tsx?raw';
import StreamingBrowseHome from '../../templates/streaming-browse-home';
import streamingBrowseHomeSource from '../../templates/streaming-browse-home.tsx?raw';
import SubAgentMonitor from '../../templates/sub-agent-monitor';
import subAgentMonitorSource from '../../templates/sub-agent-monitor.tsx?raw';
import SubtitleCueEditor from '../../templates/subtitle-cue-editor';
import subtitleCueEditorSource from '../../templates/subtitle-cue-editor.tsx?raw';
import TableBulkActions from '../../templates/table-bulk-actions';
import tableBulkActionsSource from '../../templates/table-bulk-actions.tsx?raw';
import TableChart from '../../templates/table-chart';
import tableChartSource from '../../templates/table-chart.tsx?raw';
import TableComparison from '../../templates/table-comparison';
import tableComparisonSource from '../../templates/table-comparison.tsx?raw';
import TableIndexDetail from '../../templates/table-index-detail';
import tableIndexDetailSource from '../../templates/table-index-detail.tsx?raw';
import TableInlineExpansion from '../../templates/table-inline-expansion';
import tableInlineExpansionSource from '../../templates/table-inline-expansion.tsx?raw';
import TableSplitPane from '../../templates/table-split-pane';
import tableSplitPaneSource from '../../templates/table-split-pane.tsx?raw';
import TableTree from '../../templates/table-tree';
import tableTreeSource from '../../templates/table-tree.tsx?raw';
import Timeline from '../../templates/timeline';
import timelineSource from '../../templates/timeline.tsx?raw';
import TranscriptAnnotator from '../../templates/transcript-annotator';
import transcriptAnnotatorSource from '../../templates/transcript-annotator.tsx?raw';
import VideoClipTimeline from '../../templates/video-clip-timeline';
import videoClipTimelineSource from '../../templates/video-clip-timeline.tsx?raw';
import VideoWatchPage from '../../templates/video-watch-page';
import videoWatchPageSource from '../../templates/video-watch-page.tsx?raw';

export type TemplateKind = 'page' | 'block';

export interface TemplateEntry {
  id: string;
  name: string;
  kind: TemplateKind;
  category: string;
  description: string;
  component: ComponentType;
  source: string;
  requires?: string;
}

export const templates: TemplateEntry[] = [
  {
    id: 'dashboard-executive-summary',
    name: 'Executive Summary Dashboard',
    kind: 'page',
    category: 'Dashboard',
    description:
      'Hero quarterly-revenue Stat, sparkline trend rail, and regional breakdown table.',
    component: DashboardExecutiveSummary,
    source: dashboardExecutiveSummarySource,
    requires: 'Uses local demo shims until Stat and ChartV2 are released.',
  },
  {
    id: 'dashboard-widget-grid',
    name: 'Widget Grid Dashboard',
    kind: 'page',
    category: 'Dashboard',
    description:
      'Configurable grid of mixed widget cards with edit mode and per-widget menus.',
    component: DashboardWidgetGrid,
    source: dashboardWidgetGridSource,
    requires: 'Uses local demo shims until Stat and ChartV2 are released.',
  },
  {
    id: 'dashboard-split',
    name: 'Split Dashboard',
    kind: 'page',
    category: 'Dashboard',
    description:
      'Primary time-series chart beside stacked Stat cards and a plan breakdown list.',
    component: DashboardSplit,
    source: dashboardSplitSource,
    requires: 'Uses local demo shims until Stat and ChartV2 are released.',
  },
  {
    id: 'dashboard-tabbed',
    name: 'Tabbed Dashboard',
    kind: 'page',
    category: 'Dashboard',
    description:
      'Header TabList switching Overview / Traffic / Revenue / Quality dashboard views.',
    component: DashboardTabbed,
    source: dashboardTabbedSource,
    requires: 'Uses local demo shims until Stat and ChartV2 are released.',
  },
  {
    id: 'dashboard-filterable',
    name: 'Filterable Dashboard',
    kind: 'page',
    category: 'Dashboard',
    description:
      'Collapsible filter panel that live-filters KPI Stats, chart, and accounts table.',
    component: DashboardFilterable,
    source: dashboardFilterableSource,
    requires: 'Uses local demo shims until Stat and ChartV2 are released.',
  },
  {
    id: 'kpi-dashboard',
    name: 'KPI Dashboard',
    kind: 'page',
    category: 'Dashboard',
    description:
      'KPI row, chart widgets, and compact table using the upcoming Stat pattern.',
    component: KpiDashboard,
    source: kpiDashboardSource,
    requires: 'Uses local demo shims until Stat and ChartV2 are released.',
  },
  {
    id: 'fleet-node-status',
    name: 'Fleet Node Status',
    kind: 'page',
    category: 'Dashboard',
    description:
      'Node fleet health: status-square density grid, detail table, and per-user rollup with stacked bars.',
    component: FleetNodeStatus,
    source: fleetNodeStatusSource,
  },
  {
    id: 'activation-funnel-analytics',
    name: 'Activation Funnel Analytics',
    kind: 'page',
    category: 'Dashboard',
    description:
      'Funnel analytics: stat cards, drop-off callouts, comparison funnel bars, cohort heatmap, velocity strip.',
    component: ActivationFunnelAnalytics,
    source: activationFunnelAnalyticsSource,
  },
  {
    id: 'table-inline-expansion',
    name: 'Table with Inline Expansion',
    kind: 'page',
    category: 'Table',
    description:
      'Endpoint registry table with per-row toggles expanding colSpan detail regions.',
    component: TableInlineExpansion,
    source: tableInlineExpansionSource,
  },
  {
    id: 'table-index-detail',
    name: 'Index/Detail Table',
    kind: 'page',
    category: 'Table',
    description:
      'Master job table whose selected row populates an end-panel detail pane.',
    component: TableIndexDetail,
    source: tableIndexDetailSource,
  },
  {
    id: 'table-split-pane',
    name: 'Split Pane List/Detail',
    kind: 'page',
    category: 'Table',
    description:
      'Email-client split with a resizable ticket list and conversation detail pane.',
    component: TableSplitPane,
    source: tableSplitPaneSource,
  },
  {
    id: 'table-bulk-actions',
    name: 'Table with Bulk Actions',
    kind: 'page',
    category: 'Table',
    description:
      'Checkbox selection with a sticky action bar for archive, assign, and delete.',
    component: TableBulkActions,
    source: tableBulkActionsSource,
  },
  {
    id: 'table-tree',
    name: 'Tree / Hierarchical Table',
    kind: 'page',
    category: 'Table',
    description:
      'Expandable hierarchical file table with depth indenting and tree-aware search.',
    component: TableTree,
    source: tableTreeSource,
  },
  {
    id: 'table-comparison',
    name: 'Comparison Table (Frozen Column)',
    kind: 'page',
    category: 'Table',
    description:
      'Pricing matrix with a frozen label column and scrollable plan columns.',
    component: TableComparison,
    source: tableComparisonSource,
  },
  {
    id: 'table-chart',
    name: 'Table with Linked Chart',
    kind: 'page',
    category: 'Table',
    description:
      'Weekly store chart over its product table with metric switch and row overlay.',
    component: TableChart,
    source: tableChartSource,
    requires: 'Uses a local ChartV2 shim until the lab component is released.',
  },
  {
    id: 'form-page',
    name: 'Form Page',
    kind: 'page',
    category: 'Form',
    description:
      'Centered single-column settings form with grouped sections and sticky footer.',
    component: FormPage,
    source: formPageSource,
  },
  {
    id: 'form-wizard',
    name: 'Form Wizard',
    kind: 'page',
    category: 'Form',
    description:
      'Multi-step setup wizard with step indicator, per-step validation, and review.',
    component: FormWizard,
    source: formWizardSource,
  },
  {
    id: 'form-modal',
    name: 'Modal Overlay Form',
    kind: 'page',
    category: 'Form',
    description:
      'Create-project Dialog over a dimmed project table, adding rows on submit.',
    component: FormModal,
    source: formModalSource,
  },
  {
    id: 'form-side-sheet',
    name: 'Side Sheet Form',
    kind: 'page',
    category: 'Form',
    description:
      'Discounts table with a slide-in right sheet for creating or editing a record.',
    component: FormSideSheet,
    source: formSideSheetSource,
  },
  {
    id: 'form-inline-edit',
    name: 'Inline Edit Form',
    kind: 'page',
    category: 'Form',
    description:
      'Label/value rows that swap into inline inputs with per-row Save/Cancel.',
    component: FormInlineEdit,
    source: formInlineEditSource,
  },
  {
    id: 'ai-chat-artifact',
    name: 'AI Chat with Artifact',
    kind: 'page',
    category: 'AI Chat',
    description:
      'Conversation panel beside a generated-code artifact pane with version tools.',
    component: AiChatArtifact,
    source: aiChatArtifactSource,
  },
  {
    id: 'ai-chat-tool-stream',
    name: 'AI Chat with Tool Stream',
    kind: 'page',
    category: 'AI Chat',
    description:
      'Agent chat with collapsed tool-call piles expanding into per-call status rows.',
    component: AiChatToolStream,
    source: aiChatToolStreamSource,
  },
  {
    id: 'compaction-inspector',
    name: 'Context Compaction Inspector',
    kind: 'page',
    category: 'AI Chat',
    description:
      'Compaction event inspector with raw/summary comparison, context tree, and stats.',
    component: CompactionInspector,
    source: compactionInspectorSource,
  },
  {
    id: 'browser-session-replay',
    name: 'Browser Session Replay',
    kind: 'page',
    category: 'AI Chat',
    description:
      'Agent browser-session dock with play/scrub transport, frame counter, and a 12-step action timeline.',
    component: BrowserSessionReplay,
    source: browserSessionReplaySource,
  },
  {
    id: 'sub-agent-monitor',
    name: 'Sub-Agent Monitor',
    kind: 'page',
    category: 'AI Chat',
    description:
      'Docked sub-agent status tray with dismiss/restore management and a modal session transcript.',
    component: SubAgentMonitor,
    source: subAgentMonitorSource,
  },
  {
    id: 'composer-state-gallery',
    name: 'Composer State Gallery',
    kind: 'page',
    category: 'AI Chat',
    description:
      'Six frozen states of a power chat composer: slash chip, mentions, queued tray, drag-over, force-stop.',
    component: ComposerStateGallery,
    source: composerStateGallerySource,
  },
  {
    id: 'artifact-pin-dock',
    name: 'Artifact Pin Dock',
    kind: 'page',
    category: 'AI Chat',
    description:
      'Pill tab bar with CI status dots over an artifact viewer, GitHub PR card, and a data-sources run panel.',
    component: ArtifactPinDock,
    source: artifactPinDockSource,
  },
  {
    id: 'inbox',
    name: 'Inbox',
    kind: 'page',
    category: 'Tools',
    description:
      'Three-column mail triage with folder rail, message list, and reading pane.',
    component: Inbox,
    source: inboxSource,
  },
  {
    id: 'search-results',
    name: 'Search Results Page',
    kind: 'page',
    category: 'Tools',
    description:
      'Docs search with facet rail, ranked snippet results, sort, and pagination.',
    component: SearchResults,
    source: searchResultsSource,
  },
  {
    id: 'diff-viewer',
    name: 'Diff Compare Viewer',
    kind: 'page',
    category: 'Tools',
    description:
      'Split/unified code diff with gutters, change stats, and an inline comment thread.',
    component: DiffViewer,
    source: diffViewerSource,
  },
  {
    id: 'notebook-report',
    name: 'Notebook / Report Page',
    kind: 'page',
    category: 'Tools',
    description:
      'Analytics notebook of prose, SQL, chart, and table blocks with block toolbars.',
    component: NotebookReport,
    source: notebookReportSource,
    requires: 'Uses a local ChartV2 shim until the lab component is released.',
  },
  {
    id: 'incident-console',
    name: 'Incident Console',
    kind: 'page',
    category: 'Tools',
    description:
      'On-call response console with dense grouped rows and a resizable inspector.',
    component: IncidentConsole,
    source: incidentConsoleSource,
  },
  {
    id: 'kanban-board',
    name: 'Kanban Board',
    kind: 'page',
    category: 'Tools',
    description:
      'Product delivery board with fixed-width columns and accessible move controls.',
    component: KanbanBoard,
    source: kanbanBoardSource,
  },
  {
    id: 'deployment-detail',
    name: 'Deployment Detail',
    kind: 'page',
    category: 'Tools',
    description:
      'Deployment status header, metadata grid, and terminal-style build logs.',
    component: DeploymentDetail,
    source: deploymentDetailSource,
    requires: 'Uses a local LogStream shim until the lab component is released.',
  },
  {
    id: 'command-palette-launcher',
    name: 'Command Palette Launcher',
    kind: 'page',
    category: 'Tools',
    description:
      'Command palette over a dimmed workspace with fuzzy matching and grouped results.',
    component: CommandPaletteLauncher,
    source: commandPaletteLauncherSource,
  },
  {
    id: 'file-browser-preview',
    name: 'File Browser with Preview',
    kind: 'page',
    category: 'Tools',
    description:
      'TreeList file navigator beside a code/rendered preview with version history.',
    component: FileBrowserPreview,
    source: fileBrowserPreviewSource,
  },
  {
    id: 'memory-relation-explorer',
    name: 'Memory Relation Explorer',
    kind: 'page',
    category: 'Tools',
    description:
      'Faceted memory-graph browser: filter rail, relation table with weight bars, and a typed detail panel.',
    component: MemoryRelationExplorer,
    source: memoryRelationExplorerSource,
  },
  {
    id: 'feature-gate-console',
    name: 'Feature Gate Console',
    kind: 'page',
    category: 'Tools',
    description:
      'Feature-flag ops console: KPI cards, batch rollout controls, CSS bar-chart telemetry, gate table with health dots and switches.',
    component: FeatureGateConsole,
    source: featureGateConsoleSource,
  },
  {
    id: 'transcript-annotator',
    name: 'Transcript Annotator',
    kind: 'page',
    category: 'Tools',
    description:
      'Session replay transcript with seven block renderers beside a sticky golden/failure/neutral labeling panel.',
    component: TranscriptAnnotator,
    source: transcriptAnnotatorSource,
  },
  {
    id: 'mail-compose',
    name: 'Email Compose Window',
    kind: 'page',
    category: 'Mail',
    description:
      'Docked compose window with recipient chips, formatting toolbar, attachments, and schedule-send.',
    component: MailCompose,
    source: mailComposeSource,
  },
  {
    id: 'mail-thread-reader',
    name: 'Conversation Thread Reader',
    kind: 'page',
    category: 'Mail',
    description:
      'Single-column email thread with collapsed history, trimmed quotes, attachments, and quick replies.',
    component: MailThreadReader,
    source: mailThreadReaderSource,
  },
  {
    id: 'shared-team-inbox',
    name: 'Shared Team Inbox',
    kind: 'page',
    category: 'Mail',
    description:
      'Multi-agent support mailbox with assignment, SLA chips, internal notes, and collision presence.',
    component: SharedTeamInbox,
    source: sharedTeamInboxSource,
  },
  {
    id: 'scheduled-send-outbox',
    name: 'Scheduled & Snoozed Mail',
    kind: 'page',
    category: 'Mail',
    description:
      'Time-grouped outbox of scheduled sends and snoozed threads with edit-schedule and send-now actions.',
    component: ScheduledSendOutbox,
    source: scheduledSendOutboxSource,
  },
  {
    id: 'spam-quarantine-console',
    name: 'Spam Quarantine Console',
    kind: 'page',
    category: 'Mail',
    description:
      'Admin quarantine table with spam-score breakdown panel and bulk release/block actions.',
    component: SpamQuarantineConsole,
    source: spamQuarantineConsoleSource,
  },
  {
    id: 'mail-search-builder',
    name: 'Advanced Mail Search',
    kind: 'page',
    category: 'Mail',
    description:
      'Operator-chip mail search with structured filter builder, saved searches, and grouped results.',
    component: MailSearchBuilder,
    source: mailSearchBuilderSource,
  },
  {
    id: 'newsletter-composer',
    name: 'Newsletter Block Composer',
    kind: 'page',
    category: 'Mail',
    description:
      'Block-based email builder with palette, live canvas, and per-block settings inspector.',
    component: NewsletterComposer,
    source: newsletterComposerSource,
  },
  {
    id: 'sender-profile-rail',
    name: 'Sender Profile Rail',
    kind: 'page',
    category: 'Mail',
    description:
      'Open email beside a contextual sender-intelligence rail with history, files, and notes.',
    component: SenderProfileRail,
    source: senderProfileRailSource,
  },
  {
    id: 'settings-extension-catalog',
    name: 'Extension Catalog Settings',
    kind: 'page',
    category: 'Settings',
    description:
      'Marketplace grid and installed-extension list with scope badges and switches.',
    component: SettingsExtensionCatalog,
    source: settingsExtensionCatalogSource,
  },
  {
    id: 'settings-secrets-env',
    name: 'Secrets & Environment Settings',
    kind: 'page',
    category: 'Settings',
    description:
      'Collapsible sections for masked secrets, webhooks, and repos with confirm flows.',
    component: SettingsSecretsEnv,
    source: settingsSecretsEnvSource,
  },
  {
    id: 'scheduled-jobs-manager',
    name: 'Scheduled Jobs Manager',
    kind: 'page',
    category: 'Settings',
    description:
      'Cron job list with health badges plus a detail pane: execution history, autosave editor, version history.',
    component: ScheduledJobsManager,
    source: scheduledJobsManagerSource,
  },
  {
    id: 'automation-rule-builder',
    name: 'Automation Rule Builder',
    kind: 'page',
    category: 'Settings',
    description:
      'Hook list with mini switches and a six-color trigger condition editor plus script file tabs.',
    component: AutomationRuleBuilder,
    source: automationRuleBuilderSource,
  },
  {
    id: 'onboarding-guided-install',
    name: 'Guided Install Wizard',
    kind: 'page',
    category: 'Onboarding',
    description:
      'CLI-node setup stepper with copy commands, waiting/connected status strip, and troubleshooting accordions.',
    component: OnboardingGuidedInstall,
    source: onboardingGuidedInstallSource,
  },
  {
    id: 'cli-pairing-console',
    name: 'CLI Pairing Console',
    kind: 'page',
    category: 'Onboarding',
    description:
      'CLI daemon console with mascot header and status-line variants beside a four-state device-authorization card.',
    component: CliPairingConsole,
    source: cliPairingConsoleSource,
  },
  {
    id: 'product-list',
    name: 'Product List',
    kind: 'page',
    category: 'Content',
    description:
      'Faceted catalog browse with filter rail, results toolbar, and product card grid.',
    component: ProductList,
    source: productListSource,
  },
  {
    id: 'profile-page',
    name: 'Profile Page',
    kind: 'page',
    category: 'Content',
    description:
      'Directory profile with identity header, Stat row, and activity/details tabs.',
    component: ProfilePage,
    source: profilePageSource,
    requires: 'Uses a local Stat shim until the component is released.',
  },
  {
    id: 'timeline',
    name: 'Timeline',
    kind: 'page',
    category: 'Content',
    description:
      'Chronological activity feed with sticky date headers and event-type filter.',
    component: Timeline,
    source: timelineSource,
  },
  {
    id: 'infinite-scroll-feed',
    name: 'Infinite Scroll Page',
    kind: 'page',
    category: 'Content',
    description:
      'Filterable single-column post feed ending in a skeleton loading group.',
    component: InfiniteScrollFeed,
    source: infiniteScrollFeedSource,
  },
  {
    id: 'slide-deck-viewer',
    name: 'Slide Deck Viewer',
    kind: 'page',
    category: 'Content',
    description:
      'PPTX-style viewer: header pager, 112px thumbnail rail, centered 4:3 slide stage from shape fixtures.',
    component: SlideDeckViewer,
    source: slideDeckViewerSource,
  },
  {
    id: 'skill-package-detail',
    name: 'Skill Package Detail',
    kind: 'page',
    category: 'Content',
    description:
      'Package detail: badge-cluster header, file-tab code browser, and version history with inline per-file diffs.',
    component: SkillPackageDetail,
    source: skillPackageDetailSource,
  },
  {
    id: 'podcast-episode-player',
    name: 'Podcast Episode Player',
    kind: 'page',
    category: 'Media',
    description:
      'Episode page with synced transcript, chapter rail, and docked audio player bar.',
    component: PodcastEpisodePlayer,
    source: podcastEpisodePlayerSource,
  },
  {
    id: 'video-watch-page',
    name: 'Video Watch Page',
    kind: 'page',
    category: 'Media',
    description:
      'Watch page with mock player chrome, up-next rail, description, and comments.',
    component: VideoWatchPage,
    source: videoWatchPageSource,
  },
  {
    id: 'album-tracklist-player',
    name: 'Album Tracklist Player',
    kind: 'page',
    category: 'Media',
    description:
      'Album page with hero, track table, and persistent now-playing bar.',
    component: AlbumTracklistPlayer,
    source: albumTracklistPlayerSource,
  },
  {
    id: 'streaming-browse-home',
    name: 'Streaming Browse Home',
    kind: 'page',
    category: 'Media',
    description:
      'Dark browse home with hero billboard and horizontal poster carousels.',
    component: StreamingBrowseHome,
    source: streamingBrowseHomeSource,
  },
  {
    id: 'live-stream-viewer',
    name: 'Live Stream Viewer',
    kind: 'page',
    category: 'Media',
    description:
      'Live player with chat rail, viewer stats, and follow/sub actions.',
    component: LiveStreamViewer,
    source: liveStreamViewerSource,
  },
  {
    id: 'media-asset-pipeline',
    name: 'Media Asset Pipeline',
    kind: 'page',
    category: 'Media',
    description:
      'Upload/transcode manager with folder tree, status table, and renditions panel.',
    component: MediaAssetPipeline,
    source: mediaAssetPipelineSource,
  },
  {
    id: 'subtitle-cue-editor',
    name: 'Subtitle Cue Editor',
    kind: 'page',
    category: 'Media',
    description:
      'Caption cue table synced to a mock player with timing validation.',
    component: SubtitleCueEditor,
    source: subtitleCueEditorSource,
  },
  {
    id: 'video-clip-timeline',
    name: 'Video Clip Timeline Editor',
    kind: 'page',
    category: 'Media',
    description:
      'NLE-style editor with tool rail, program monitor, and multi-track timeline dock.',
    component: VideoClipTimeline,
    source: videoClipTimelineSource,
  },
  {
    id: 'shell-left-sidebar',
    name: 'Shell - Left Sidebar',
    kind: 'page',
    category: 'Shell',
    description:
      'AppShell with a collapsible grouped SideNav beside a placeholder page.',
    component: ShellLeftSidebar,
    source: shellLeftSidebarSource,
  },
  {
    id: 'shell-top-nav',
    name: 'Shell - Top Nav',
    kind: 'page',
    category: 'Shell',
    description:
      'Horizontal TopNav bar over a full-width content area with a placeholder slot.',
    component: ShellTopNav,
    source: shellTopNavSource,
  },
  {
    id: 'shell-top-nav-sidebar',
    name: 'Shell - Top Nav + Left Sidebar',
    kind: 'page',
    category: 'Shell',
    description:
      'Global TopNav plus a contextual SideNav that swaps groups per active section.',
    component: ShellTopNavSidebar,
    source: shellTopNavSidebarSource,
  },
  {
    id: 'shell-breadcrumb',
    name: 'Shell - Breadcrumb Driven',
    kind: 'page',
    category: 'Shell',
    description:
      'Drill-down shell where a deep Breadcrumbs trail carries all hierarchy.',
    component: ShellBreadcrumb,
    source: shellBreadcrumbSource,
  },
  {
    id: 'messaging-shell',
    name: 'Messaging Shell',
    kind: 'page',
    category: 'Shell',
    description:
      'Four-column messaging frame with rail, channel list, stream, and thread panel.',
    component: MessagingShell,
    source: messagingShellSource,
  },
  {
    id: 'notification-center',
    name: 'Notification Center',
    kind: 'page',
    category: 'Shell',
    description:
      'Navbar bell with unread badge, pinned-open 320px notification popover, corner toast, and state variants.',
    component: NotificationCenter,
    source: notificationCenterSource,
  },
  {
    id: 'logs-explorer',
    name: 'Logs Explorer',
    kind: 'page',
    category: 'Monitoring',
    description:
      'Facet rail, PowerSearch filters, live-tail switch, and expandable log stream.',
    component: LogsExplorer,
    source: logsExplorerSource,
    requires: 'Uses a local LogStream shim until the lab component is released.',
  },
  {
    id: 'operations-dashboard',
    name: 'Operations Dashboard',
    kind: 'page',
    category: 'Operations',
    description:
      'Starter dashboard for this package with KPI cards, review queue, and actions.',
    component: OperationsDashboard,
    source: operationsDashboardSource,
  },
  {
    id: 'kpi-strip',
    name: 'KPI Strip',
    kind: 'block',
    category: 'Operations',
    description: 'Compact metric card strip for dashboard headers.',
    component: KpiStrip,
    source: kpiStripSource,
  },
  {
    id: 'codeblock-terminal',
    name: 'Code - Terminal',
    kind: 'block',
    category: 'Code',
    description: 'Dark terminal-style CodeBlock with a syntax theme wrapper.',
    component: CodeBlockTerminal,
    source: codeblockTerminalSource,
  },
];
