# AhaCreator frontend research

Date: 2026-06-19

This note collects public references and reusable frontend resources for building a
frontend experience close to AhaCreator. It intentionally stores links, feature
breakdowns, and implementation notes instead of copying proprietary UI assets.

## Target product references

### Official AhaCreator links

- Brand/home site: <https://www.ahacreator.com/>
- Creator landing page: <https://www.ahacreator.com/creators>
- Creator app entry: <https://creator.ahacreator.com/>
- LinkedIn/company context: <https://www.linkedin.com/company/ahacreator>

### Public walkthrough / article references

- Yahoo/Tech article: <https://tech.yahoo.com/ai/deals/articles/weeks-minutes-ahacreator-redefines-influencer-084907112.html>
- YouTube brand-side review: <https://www.youtube.com/watch?v=eTzK67HvFyA>
- YouTube creator-side overview: <https://www.youtube.com/watch?v=gCJs-v2CKIw>

## Publicly visible AhaCreator positioning

AhaCreator positions itself as an AI-native influencer marketing platform:

- "24/7 Influencer Marketing AI Agent"
- one marketer can launch and manage many creator collaborations
- 5M+ creator profiles
- 100K+ onboarded creators
- 140+ countries and regions
- AI creator matching using content, audience fit, brand DNA, and fake follower
  detection
- automated outreach, creator follow-up, reminders, timeline management, and
  delay escalation
- AI draft/content review against the campaign brief
- standardized contracts, escrow/fund protection, global payouts, and delivery
  guarantees

## Frontend product flows to emulate

### Brand-side flow

Public walkthroughs describe a brand workflow roughly like this:

1. Input product URL or campaign brief.
2. AI analyzes the product and prepares campaign setup:
   - basic campaign information
   - business / brand introduction
   - core selling points
   - creator targeting suggestions
   - benchmark brands
3. User can manually edit generated fields.
4. User reviews early creator examples with "match" / "not a match" style
   feedback, which refines the matching direction.
5. Forecasting and budget section:
   - projected campaign performance
   - budget adjustment
   - estimated creator pricing
   - CPM / views / CPC / clicks
   - strongest-fit creator shortlist
6. Release / launch campaign.
7. Campaign dashboard tracks the full lifecycle:
   - quoted / invited creators
   - negotiation
   - confirmed collaborations
   - sample shipping or product handoff
   - script / draft review
   - publication
   - final link submission
   - settlement / payout

### Creator-side flow

The creator-facing materials describe:

1. Creator receives matched brand deal invites.
2. Invite dashboard shows:
   - brand and product details
   - requirements
   - delivery expectations
   - offered rate
3. Creator can accept, negotiate, or decline.
4. Accepted collaboration opens a milestone timeline:
   - draft/script due date
   - revision windows
   - final content due date
   - publish and submit final link
5. Creator uploads draft scripts or content files.
6. Brand comments, requests changes, or approves in-platform.
7. Payment is protected through campaign funding, platform settlement, and wallet
   withdrawal.

## Fit with this repository

Current frontend stack:

- React 18
- TypeScript
- Vite 7
- React Router 6
- Ant Design 5
- global `src/styles.css`
- local component state plus direct `apiFetch("/v1/...")`

Relevant existing frontend pieces:

- `src/components/CreateCampaignModal.tsx`
  - currently the closest match to AhaCreator's campaign creation flow
  - already has a multi-step modal, campaign name, collaboration mode, brand URL,
    product URL, data-source selection, Excel upload, draft save, and publish
- `src/pages/PlanPage.tsx`
  - campaign listing / plan entry
- `src/pages/CampaignDetailPage.tsx`
  - campaign detail and publish action
- `src/components/TaskProgress.tsx`
  - task/workflow progression reference
- `src/components/ChatModal.tsx`
  - static communication/composer UI mock; not wired to routing/API yet
- `openapi.json`
  - campaign/task/collaboration contract reference

Suggested frontend IA based on current routes:

- `/plan`: campaign dashboard and "create with AI" entry
- `/plan/:id`: campaign lifecycle dashboard
- `/talent`: creator matching, shortlist, profile cards, match/not-match feedback
- `/tasks`: operational tasks such as confirmation, shipping, script review
- `/review`: draft/content review queue
- future creator-side route if needed:
  - `/creator/invites`
  - `/creator/collaborations/:id`
  - `/creator/wallet`

## Reusable / reference resources

### Highest-fit resources for this codebase

1. Ant Design Pro
   - URL: <https://github.com/ant-design/ant-design-pro>
   - Why useful:
     - mature Ant Design dashboard patterns
     - step forms, advanced forms, table lists, profile pages, result pages
     - useful IA patterns for enterprise campaign dashboards
   - Caveat:
     - heavier scaffold based on Umi/ProComponents; do not wholesale migrate this
       Vite app unless the product direction requires it
   - Best use:
     - borrow page patterns, form/table compositions, and dashboard layout ideas

2. React Admin Dashboard by larry-xue
   - URL: <https://github.com/larry-xue/react-admin-dashboard>
   - Why useful:
     - close stack: React 18 + TypeScript + Vite + Ant Design 5 + React Router 6
     - includes SaaS dashboard, auth, protected routes, customers/list-detail
       patterns, sticky layout, breadcrumbs, and Ant Design charts
   - Best use:
     - reference Vite + AntD page/module structure without switching frameworks

3. Ant Design X
   - URL: <https://x.ant.design/>
   - Why useful:
     - AI chat / agent UI components aligned with Ant Design
     - suitable for "AI campaign generator", assistant panel, and AI review
       interactions
   - Best use:
     - add a campaign-generation assistant or review assistant without inventing a
       custom chat UI from scratch

### Influencer / creator marketplace references

4. Influencer Engagement Tracker
   - URL: <https://github.com/himuexe/Influencer-Engagement-Tracker>
   - Why useful:
     - campaign analytics, ROI, engagement metrics, multi-platform tracking
   - Caveat:
     - different stack and very low public adoption; verify license and code
       quality before reusing
   - Best use:
     - data model and analytics page inspiration

5. SocialPulse / insightful-dashboard-main
   - URL: <https://github.com/blacsheep-wq/insightful-dashboard-main>
   - Why useful:
     - social media analytics dashboard and AI content generator concept
   - Caveat:
     - Next.js/Tailwind/Chart.js; use as concept reference, not direct code drop
   - Best use:
     - analytics cards, content generation flow, mock data patterns

6. Impact Arc
   - URL: <https://github.com/21prnv/impact-arc>
   - Why useful:
     - influencer scoring, rankings, filtering, and profile gallery concepts
   - Caveat:
     - Instagram-focused and Next.js/Tailwind/Radix stack
   - Best use:
     - creator discovery/profile page inspiration

7. Dashh
   - URL: <https://github.com/alphoder/Dashh>
   - Why useful:
     - campaign tracking, fraud prevention, escrow/payment concepts
   - Caveat:
     - Solana/Web3 architecture is likely out of scope
   - Best use:
     - escrow/payment state and fraud-proof campaign language only

8. Boksi creator-brand marketplace case study
   - URL:
     <https://www.parallelloop.io/case-study/boksi-creator-brand-marketplace-platform>
   - Why useful:
     - clear two-sided marketplace breakdown:
       - SEO landing and creator profile directory
       - brand dashboard for hiring, review, and payment
       - creator dashboard for orders, submission, and payout
       - AI content verification
   - Best use:
     - product flow and information architecture reference

## UI modules worth building first

These are scoped to the current repository and backend surface.

1. AI campaign setup wizard
   - upgrade `CreateCampaignModal`
   - input product/brand URL and brief
   - generated editable sections:
     - brand intro
     - selling points
     - creator targeting
     - deliverables
     - budget
2. Creator shortlist and match feedback
   - card/table hybrid
   - creator profile, platform, followers, engagement, estimated price
   - "match" / "not a match" feedback buttons
3. Forecasting and budget panel
   - budget slider/input
   - estimated views, CPM, CPC, clicks, creator count
   - scenario cards
4. Campaign lifecycle dashboard
   - stage filters
   - collaboration table grouped by status
   - timeline per creator
   - outstanding action badges
5. In-platform collaboration communication
   - evolve `ChatModal`
   - connect offers, comments, review requests, and attachments
6. Creator-side invite and delivery workspace
   - accept / negotiate / decline
   - milestone timeline
   - draft upload and final link submission
   - payout state

## Implementation notes for this repo

- Keep Ant Design as the primary UI system for now.
- Prefer evolving current routes/components before importing a large template.
- If charts are needed, evaluate Ant Design Charts first because it fits the
  existing AntD ecosystem.
- If AI conversation UI becomes central, evaluate Ant Design X before expanding
  the current static `ChatModal`.
- Avoid copying AhaCreator proprietary layouts, images, or wording directly.
  Use the public flow as product inspiration and build original UI components.
- Verify licenses before vendoring code from any GitHub template.

## Open questions before implementation

- Is the immediate user persona brand/operator only, or should the first release
  also include creator-side pages?
- Does the backend already generate campaign briefs/targeting/forecasts, or
  should the frontend start with mock/generated placeholder sections?
- Which platforms are first-class for creator discovery: Xiaohongshu, TikTok,
  YouTube, Instagram, X, LinkedIn, or a subset?
- Should negotiation/chat be a first-class workflow in v1, or only task comments
  and status changes?
- What payment/escrow states should be displayed, if any, in the first frontend
  iteration?

