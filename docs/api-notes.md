# GitHub API Notes

## Repository API R&D

This document contains initial notes for exploring the GitHub REST API.

### APIs to investigate

1. Commits API
2. Pull Requests API

### Information to collect

For commits:

* Commit SHA
* Commit message
* Author
* Commit date
* Commit URL

For pull requests:

* Pull request number
* Title
* Author
* State
* Created date
* Closed date
* Merged date
* Review information
* Comments

### R&D Objective

Understand the raw JSON response returned by GitHub and identify the fields that can be used for repository activity analysis.
