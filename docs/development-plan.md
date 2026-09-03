# svgops Development Plan / svgops 开发计划

## 1. Goals / 目标

svgops will evolve from a flat SVG catalog into a curated, maintainable catalog of functional website icons.

The next development cycle has two primary goals:

1. Reduce visual duplication without deleting useful site-specific variants.
2. Periodically detect and review new or changed icons from the configured website collections.

The default behavior should remain fast, searchable, responsive, and safe to review before publication.

## 2. Current Constraints / 当前约束

- Icons are currently stored as per-site SVG assets under `static/site-icons/<site>`.
- Metadata is maintained in `src/data/site-icons/<site>.ts`.
- `SiteIcon` already records the site, category, style, animation state, source URL, and license state.
- `utils/filter-site-icons.mjs` checks same-site duplicate SVGs and overly simple geometry before builds.
- The filter currently removes files only when explicitly run with `--apply`; normal builds only validate.
- Kimi and Monica are the currently curated real website icon collections.
- Cross-site similarity must not silently delete source assets.

## 2.1. Bilingual Keywords / 双语关键词

| English | 中文 | Meaning in this plan |
| --- | --- | --- |
| Catalog | 目录 | The searchable collection of approved icons. |
| Collection | 网站集合 | Icons and metadata belonging to one product or website. |
| Site adapter | 网站适配器 | Site-specific discovery and parsing logic. |
| Crawl | 爬取 | Scheduled discovery and download of public icon resources. |
| Staging | 暂存区 | Review area for incoming assets before publication. |
| Grouped view | 分组视图 | One card representing related icon variants. |
| Flat view | 平铺视图 | One card per individual icon asset. |
| Variant | 变体 | A site, style, color, or animation version of a function. |
| Canonical key | 规范键 | Stable normalized identity for a functional icon. |
| Alias | 别名 | Alternate searchable name for the same function. |
| Source hash | 来源哈希 | Normalized-content fingerprint for change detection. |
| Similarity key | 相似度指纹 | Geometry or semantic fingerprint used to find candidates. |
| Confidence | 可信度 | Strength of an exact, semantic, or manually reviewed match. |
| Provenance | 来源追溯 | URL, timestamp, parser, license, and snapshot information. |
| Curation | 内容策展 | Human and automated review before an asset enters the catalog. |
| Apply | 应用变更 | Explicitly promote approved staging changes to catalog data. |
| Rollback | 回滚 | Restore a previous approved asset or metadata snapshot. |
| Observability | 可观测性 | Crawl health, failures, change history, and quality signals. |
| Acceptance criteria | 验收标准 | Conditions that must be true before a milestone is complete. |
| Dependency | 前置依赖 | Earlier capability required by a milestone. |

## 3. Phase One: Icon Identity and Metadata / 第一阶段：图标身份与元数据

Introduce a stable identity layer for grouping and change detection.

Recommended fields:

- `canonicalKey`: normalized function identity such as `add`.
- `aliases`: searchable names such as `plus` or `create`.
- `sourceHash`: hash of normalized SVG content.
- `similarityKey`: geometry or semantic similarity fingerprint.
- `variantOf`: optional group identifier shared by related variants.
- `confidence`: `exact`, `semantic`, or `manual` grouping confidence.
- `lastSeenAt`: timestamp from the latest approved crawl.

The existing stable `siteId` plus icon slug remains the primary asset identity. Grouping is a presentation relationship, not a replacement for the original asset.

Acceptance criteria:

- Every catalog icon has a stable ID and source metadata.
- Same-site exact duplicates can be identified without relying on display names.
- Cross-site candidates are reported but never removed automatically.

## 4. Phase Two: Grouped Icon Experience / 第二阶段：分组图标体验

Add two catalog views:

- `Grouped`: the default view, showing one card per functional group.
- `All icons`: a complete flat view of every retained source asset.

### Group card interaction / 分组卡片交互

For a group such as `Add`:

- Show the primary icon in front of a compact stacked set of variants.
- Display the number of variants and source-site labels.
- Show relevant properties such as `Outline`, `Filled`, and `Animation`.
- Keep the card compact so repeated functions do not dominate the page.
- Open an inline expansion or Sheet/Drawer containing every variant.

Each expanded variant must retain its own:

- Favorite action.
- Download action.
- Copy action.
- Source link.
- Animation preview and play control when applicable.

### Filter behavior / 筛选行为

- A group remains visible when at least one variant matches the active filters.
- Search matches canonical names, aliases, site names, categories, styles, and keywords.
- Counts distinguish groups from individual icons where both numbers are shown.
- The view and group state are shareable through URL parameters, for example `view=grouped`, `view=flat`, and `group=add`.

Grouping should start with high-confidence exact and name/alias matches. Geometry-based semantic merging should require a confidence threshold or manual review to avoid merging distinct icons.

Acceptance criteria:

- Common functions such as `Add`, `Search`, and `Settings` do not create a long series of visually repetitive cards in the default view.
- Users can still inspect and operate on every individual source variant.
- Keyboard navigation, focus states, and screen-reader labels describe groups and variant counts correctly.

## 5. Phase Three: Site Collection Adapters / 第三阶段：网站 Collection 适配器

Do not use one generic scraper for every website. Add an adapter per collection because each site may expose icons through a different build system or public manifest.

Each site configuration should define:

```ts
{
  id: "monica",
  sourceUrl: "https://monica.im/",
  iconSource: "...",
  strategy: "static-manifest",
  parser: "monica",
  license: "unspecified",
  crawlInterval: "weekly"
}
```

Supported discovery strategies may include:

- Public SVG directories.
- Public JSON or icon manifests.
- Next.js/Vite build manifests.
- Public source references in HTML or CSS.
- Manually supplied ZIP packages for sites without a stable public manifest.

The first adapters should target Monica and Kimi separately. Each adapter should document its discovery URL, extraction rules, attribution, and known limitations.

## 6. Phase Four: Crawl and Review Pipeline / 第四阶段：爬取与审核流水线

Every crawl must write to a staging area and produce a reviewable diff. It must not overwrite the production catalog directly.

```text
crawl
  -> download raw SVGs
  -> record source URL and crawl timestamp
  -> normalize and sanitize SVG
  -> detect animation and outline/filled style
  -> run same-site duplicate/simple-geometry checks
  -> calculate hashes and grouping candidates
  -> generate added/changed/removed report
  -> manual review
  -> update approved assets and metadata
```

Store enough provenance to reproduce a change:

- Raw source snapshot.
- Normalized SVG.
- Source URL.
- Crawl timestamp.
- Content hash.
- Parser version.
- Detection results.
- Approval or rejection record.

Extend `filter-site-icons.mjs` with report output and metadata validation:

- Missing metadata entries.
- Missing files.
- Invalid SVG syntax.
- Broken source URLs.
- New same-site duplicates.
- Overly simple geometry.
- Animation detection changes.
- Outline/filled classification changes.
- Unexpected asset removals.

The existing `inspect`/`apply` separation should remain. Automatic deletion must never be part of the normal build.

## 7. Phase Five: Scheduled Automation / 第五阶段：定期自动化

Use GitHub Actions for periodic updates rather than crawling at application runtime.

Required triggers:

- Weekly scheduled crawl.
- Manual workflow dispatch.
- Optional single-site dispatch for debugging.

Recommended workflow:

```text
scheduled crawl
  -> adapter extraction
  -> filtering and validation
  -> data diff
  -> build and link checks
  -> create Pull Request
  -> manual review
  -> merge and deploy
```

The workflow should never commit directly to `main`. Pull requests provide a safe review point for copyright changes, false positives, mass removals, and parser regressions.

## 8. Quality, Legal, and Security Requirements / 质量、法律与安全要求

- Respect each website's robots rules, terms, rate limits, and public-source boundaries.
- Keep license and permission status visible in metadata and review reports.
- Preserve site attribution and do not imply official endorsement.
- Treat all downloaded SVG as untrusted input.
- Sanitize SVG before it enters the frontend and do not execute embedded scripts.
- Use request timeouts, retries with backoff, caching, and bounded concurrency.
- Keep snapshots or change artifacts so incorrect updates can be rolled back.
- Continue displaying the research/educational-use disclaimer in the application.

## 9. Recommended Milestones / 推荐里程碑

### Milestone A: Data foundation / 里程碑 A：数据基础

- Add identity, hash, alias, and provenance fields.
- Generate a machine-readable validation report.
- Migrate current Kimi and Monica metadata.

### Milestone B: Grouped view MVP / 里程碑 B：分组视图 MVP

- Add grouped/flat view switch.
- Implement high-confidence function grouping.
- Add stacked cards and variant expansion.
- Preserve all per-variant actions.

### Milestone C: Crawl MVP / 里程碑 C：爬取 MVP

- Implement Monica adapter.
- Implement Kimi adapter.
- Write staging output and added/changed/removed reports.
- Require explicit approval before catalog updates.

### Milestone D: Scheduled updates / 里程碑 D：定期更新

- Add GitHub Actions schedule and manual dispatch.
- Run filtering, checks, and production build in CI.
- Open automated Pull Requests for approved review.

### Milestone E: Hardening / 里程碑 E：系统强化

- Add rollback support and crawl history.
- Improve semantic similarity review.
- Add broken-link monitoring and parser health reporting.
- Expand adapters only after each site's legal and technical constraints are documented.

## 10. First Implementation Recommendation / 首次实施建议

Start with the identity layer and Grouped view MVP before building the crawler. The crawler needs canonical keys, hashes, grouping rules, and review reports to determine whether an incoming icon is new, a replacement, a duplicate, or a distinct site-specific variant.

This order delivers an immediate improvement to the current flat catalog while creating the foundation required for reliable scheduled collection updates.

## 11. L-Level Milestones / L 级里程碑

The following milestone levels are the stable planning interface for future work. Each level has a clear scope and acceptance criteria. A higher level may depend on lower levels, but a level can be developed in smaller tasks without changing its definition.

### L1 — Catalog Foundation / 目录基础

**Objective:** Make every icon identifiable, traceable, and machine-validatable.

**Scope:**

- Add canonical names, aliases, source hashes, provenance, and grouping metadata.
- Define the icon metadata schema and validation rules.
- Generate machine-readable reports from `filter-site-icons.mjs`.
- Verify that all metadata entries map to real files and valid source URLs.

**Deliverables:**

- Versioned `SiteIcon` metadata schema.
- Per-site metadata migration for Kimi and Monica.
- JSON validation report and human-readable console report.
- Tests for identity, hash, animation, style, and missing-file detection.

**Acceptance:** No orphan metadata, missing asset, duplicate ID, or unreported validation error exists in the catalog.

### L2 — Grouped Catalog MVP / 分组目录 MVP

**Objective:** Replace repetitive flat browsing with grouped functional icons while preserving every source variant.

**Scope:**

- Add `Grouped` and `All icons` views.
- Group high-confidence same-function icons such as `Add`, `Search`, and `Settings`.
- Add stacked group cards with variant count and site labels.
- Expand a group into individual variants.
- Preserve favorite, copy, download, source, and animation actions per variant.

**Deliverables:**

- Group index derived from L1 metadata.
- Group card and variant expansion UI.
- URL state for view and selected group.
- Group-level and icon-level result counts.

**Acceptance:** The default view reduces repeated cards, while every original icon remains reachable and independently actionable.

**Depends on:** L1.

### L3 — Search and Filter Completion / 搜索与筛选完善

**Objective:** Make grouped and flat browsing predictable across all existing filters.

**Scope:**

- Search canonical names, aliases, keywords, site names, categories, styles, and animation state.
- Apply site, function, outline/filled, animation, and view filters consistently.
- Define group behavior when only some variants match.
- Keep all filter and sort state shareable through URL parameters.
- Improve counts to distinguish groups from individual icons.

**Deliverables:**

- Unified filter pipeline shared by grouped and flat views.
- Empty-state and reset behavior for combined filters.
- Keyboard and screen-reader support for group controls.

**Acceptance:** Every visible count matches the active result set, and a shared URL reproduces the same view and filters.

**Depends on:** L2.

### L4 — Site Crawl Adapter MVP / 网站爬取适配器 MVP

**Objective:** Detect new and changed icons from configured websites without modifying the production catalog directly.

**Scope:**

- Define the site adapter contract.
- Implement separate Monica and Kimi discovery adapters.
- Support public manifests, static directories, and documented build artifacts.
- Download into staging with timeout, retry, cache, and bounded concurrency.
- Record source URL, crawl time, parser version, and raw snapshot.

**Deliverables:**

- `sites` crawl configuration.
- Monica adapter.
- Kimi adapter.
- Staging directory format.
- Added/changed/removed asset report.

**Acceptance:** A crawl can be run for one site and produces a reproducible staging snapshot and reviewable diff without changing `main` or the production catalog.

**Depends on:** L1.

### L5 — Curation and Safe Apply Pipeline / 内容策展与安全应用流水线

**Objective:** Turn crawl output into safe, reviewable catalog updates.

**Scope:**

- Normalize and sanitize downloaded SVGs.
- Run same-site duplicate and simple-geometry checks.
- Recalculate animation and outline/filled classification.
- Generate grouping candidates and flag low-confidence matches.
- Require explicit apply/review action for removals and replacements.
- Provide rollback from snapshots.

**Deliverables:**

- Crawl-to-catalog staging command.
- Validation and curation report.
- Explicit `inspect`, `apply`, and `rollback` commands.
- Provenance and approval records.

**Acceptance:** No crawl can silently delete an existing icon, overwrite an asset without a diff, or publish an unvalidated SVG.

**Depends on:** L1 and L4.

### L6 — Scheduled Collection Updates / 定期 Collection 更新

**Objective:** Automate periodic monitoring while keeping publication reviewable.

**Scope:**

- Add weekly scheduled GitHub Actions runs.
- Add manual dispatch and single-site dispatch.
- Run crawl, filtering, validation, link checks, and production build in CI.
- Open an automated Pull Request with the diff and reports.
- Never commit crawler output directly to `main`.

**Deliverables:**

- Scheduled crawl workflow.
- Manual workflow inputs.
- Pull Request body containing additions, changes, removals, licenses, and warnings.
- Failure logs and notification path.

**Acceptance:** A scheduled run produces either a clean report or a reviewable Pull Request; failed validation blocks publication.

**Depends on:** L4 and L5.

### L7 — Catalog Quality and Observability / 目录质量与可观测性

**Objective:** Make the catalog reliable as the number of sites and icons grows.

**Scope:**

- Track crawl health, parser failures, broken sources, and asset churn.
- Add historical snapshots and rollback selection.
- Add performance checks for large grouped result sets.
- Add visual regression checks for desktop and mobile cards.
- Add source-license review status and unresolved-risk reporting.

**Deliverables:**

- Crawl history index.
- Health summary in CI artifacts.
- Visual smoke-test workflow.
- Rollback documentation and command.

**Acceptance:** A failed or suspicious update is detectable, explainable, and reversible without manual file reconstruction.

**Depends on:** L6.

### L8 — Collection Expansion Platform / Collection 扩展平台

**Objective:** Add new website collections with a predictable, documented process.

**Scope:**

- Add an adapter template and contribution checklist.
- Define site-level licensing and attribution requirements.
- Add collection-level metadata, logo, domain, source, and crawl policy.
- Support manual package import when no reliable public endpoint exists.
- Keep unsupported or unverified collections clearly marked.

**Deliverables:**

- New-site adapter template.
- Collection onboarding documentation.
- Site validation command.
- At least one additional approved collection as a pilot.

**Acceptance:** A new collection can be added without modifying shared crawler logic or weakening existing validation rules.

**Depends on:** L6 and L7.

### L9 — Product Iteration Layer / 产品迭代层

**Objective:** Evolve svgops from a catalog into a dependable research and discovery product.

**Scope:**

- Version history for icon changes.
- “New”, “Changed”, and “Removed” collection views.
- Compare variants across sites and styles.
- User feedback and correction workflow.
- Curated collections and saved searches.
- Optional API/export formats built from approved catalog data.

**Deliverables:**

- Change history UI.
- Comparison view.
- Correction request flow.
- Versioned export or read-only API.

**Acceptance:** Users can understand where an icon came from, how it changed, why it is grouped, and which usage restrictions apply.

**Depends on:** L7 and L8.

### L10 — Governance and Scale / 治理与规模化

**Objective:** Establish long-term governance for a growing, legally sensitive icon catalog.

**Scope:**

- Formal review policy for copyright, trademarks, and licenses.
- Maintainer roles and approval ownership.
- Adapter compatibility/version policy.
- Data retention and snapshot policy.
- Rate-limit and abuse protection for any public API.
- Disaster recovery and release rollback procedures.

**Deliverables:**

- Maintainer and contributor guide.
- Legal/source review checklist.
- Release and rollback runbook.
- Adapter deprecation policy.

**Acceptance:** The project can add sites and release catalog updates without relying on undocumented personal knowledge or unsafe manual steps.

**Depends on:** L8 and L9.

## 12. How to Request Work by Level / 按级别请求开发

Future implementation requests can reference a level directly:

- `开发 L1` means complete the Catalog Foundation scope.
- `开发 L2 中的堆叠卡片` means implement only the grouped-card slice of L2.
- `继续 L4 Monica 适配器` means resume the Monica adapter within the L4 boundary.
- `验收 L5` means run the L5 acceptance checks and report unresolved issues.

When a level is requested, implementation should remain inside that level unless a dependency is missing. Missing dependencies should be reported explicitly instead of silently expanding the scope.
