# Changelog

All notable changes to IssueSnap are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Documentation

- Added project architecture and privacy-model references.
- Added contribution, security, conduct, and GitHub collaboration policies.

## [0.1.0] - 2026-07-13

### Added

- Chrome Manifest V3 extension for turning active-page context into an editable GitHub issue draft.
- Local drafting with reproduction, expected and actual behavior, severity, labels, and a configurable GitHub target.
- Origin-only URL capture, opt-in page-title inclusion, local Chrome storage, and user-controlled clipboard or GitHub handoff.
- Strict TypeScript checks, Vitest coverage for URL and issue-draft behavior, and production build automation.

### Security

- Local-first data model with no analytics, backend service, or automatic issue submission.
- Exclusion of page paths, query strings, fragments, page content, form values, cookies, browsing history, screenshots, console logs, and network traffic from automatic capture.
