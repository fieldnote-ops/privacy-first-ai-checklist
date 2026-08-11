# Privacy-first AI Workflow Checklist

Version 0.1 draft  
By FIELD NOTE (temporary imprint; brand not selected)

Before AI touches real data, tools, or automated actions, review purpose, data, permissions, approval, and rollback. See the project source for the full explanations and test record.

## Any one of these? Do not submit raw data

- [ ] Passwords, tokens, identity documents, banking, or payment data
- [ ] Non-public client, patient, employee, child, or protected data
- [ ] A mistake can pay, delete, publish, change access, or create a legal commitment
- [ ] Provider retention, training, sharing, or deletion rules are unknown
- [ ] Redaction or human review before action is impossible

## 12 checks

- [ ] 01 Purpose & boundaries: purpose, prohibited actions, success, failure, and stop conditions
- [ ] 02 Data class: public, internal, confidential, or prohibited; treat unknowns as sensitive
- [ ] 03 Provider rules: privacy, retention, training, storage, and deletion
- [ ] 04 Least privilege: necessary reads only; writes, deletion, payments, and publishing off
- [ ] 05 Sanitize input: redacted copy, screenshots, metadata, hidden sheets, and revisions
- [ ] 06 Injection & escalation: websites, email, PDFs, and uploads are untrusted data
- [ ] 07 Constrain output: validate structure, types, numbers, links, citations, and code
- [ ] 08 Human approval: confirm publishing, payments, deletion, messages, access, and legal commitments
- [ ] 09 Rollback: versions/drafts, a stop mechanism, no endless retries or duplicate actions
- [ ] 10 Adversarial tests: empty, oversized, conflicting, secret-seeking, timeout, and partial cases
- [ ] 11 Minimum evidence: versions, results, and approvals without unnecessary sensitive raw text
- [ ] 12 Maintenance owner: reviews, retest cadence, pause triggers, and error reporting

## Five-minute risk screen

Score each 0–2: personal/internal data, write access, high-impact errors, hostile external content, and missing approval/logs/rollback.

- 0–2: Low-risk prototype; test on a small scope.
- 3–5: Medium risk; redact, use least privilege, and keep human approval.
- 6–10: Pause automation and seek appropriate security, legal, or compliance review.

Any prohibited data overrides the score. This checklist is not a security certification or legal advice.
