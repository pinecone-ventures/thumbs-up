# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- AI-powered feedback summarization
- Multi-signal reactions (beyond 👍/👎)
- Quality badges for README
- Automated PR suggestions based on feedback

---

## [1.0.0] - 2025-12-07

### Added
- Initial release of Thumbs Up
- GitHub Issues-based feedback collection
- Automatic dashboard generation via GitHub Actions
- Widget generator CLI tool
- Vote deduplication by user
- Comprehensive documentation (Installation, Usage, FAQ, Testing)
- Example dashboard with sample data
- MIT License

### Core Features
- **Widget System**: One-line Markdown widgets for any doc
- **Dashboard**: Auto-generated `thumbs-up.md` with metrics
- **GitHub Actions**: Automated updates on issue events
- **CLI Tools**: Widget generation, dashboard creation, data export
- **Deduplication**: Latest vote per user per document

### Documentation
- README.md with quick start guide
- docs/INSTALLATION.md - Step-by-step installation
- docs/USAGE.md - Comprehensive usage guide
- docs/FAQ.md - Frequently asked questions
- docs/TESTING.md - Testing guidelines for contributors
- docs/QUICKSTART.md - 2-minute setup guide
- docs/ARCHITECTURE.md - Technical architecture
- CONTRIBUTING.md - Contribution guidelines

### Technical
- Node.js 18+ support
- GitHub API integration via Octokit
- Pure core logic for easy testing
- Fixtures for consistent test data
- GitHub Actions workflow for automation

---

## Release Notes

### v1.0.0 - Initial Release

Thumbs Up is a zero-infrastructure documentation feedback system that uses GitHub Issues as a backend. Perfect for OSS maintainers, enterprise doc teams, and engineering orgs who want to know which docs are working and which need improvement.

**Key Benefits:**
- No servers, no databases, no external services
- < 2 minute installation time
- 100% GitHub-native
- Free to use

**What's Included:**
- Feedback widget for Markdown docs
- Automatic dashboard aggregation
- Vote deduplication
- GitHub Actions automation
- Complete documentation

**Installation:**
```bash
# 1. Add workflow file
cp .github/workflows/update-dashboard.yml to your repo

# 2. Add widget to docs
npm run widget -- docs/your-file.md

# 3. Commit and push
git add . && git commit -m "Add doc feedback" && git push
```

**Requirements:**
- GitHub repository (public or private)
- GitHub Actions enabled
- Node.js 18+ (for local development)

**Links:**
- [Documentation](README.md)
- [Installation Guide](docs/INSTALLATION.md)
- [Report Issues](https://github.com/pinecone-ventures/thumbs-up/issues)

---

## Versioning Strategy

- **Major (X.0.0)**: Breaking changes, major new features
- **Minor (1.X.0)**: New features, backwards compatible
- **Patch (1.0.X)**: Bug fixes, documentation updates

---

## How to Update

When a new version is released:

1. **Check the changelog** for breaking changes
2. **Update your repository:**
   ```bash
   git pull
   npm install
   ```
3. **Update workflow file** if changed
4. **Test locally** before deploying

---

## Contributing to Changelog

When submitting a PR, update this file under `[Unreleased]`:

```markdown
### Added
- New feature description

### Changed
- Changed feature description

### Fixed
- Bug fix description
```

Categories:
- **Added**: New features
- **Changed**: Changes to existing features
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security fixes

---

[Unreleased]: https://github.com/pinecone-ventures/thumbs-up/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/pinecone-ventures/thumbs-up/releases/tag/v1.0.0
