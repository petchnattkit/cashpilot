# Project Workflow & Agreements

This document defines the mandatory workflow, task structure, and verification standards for the CashPilot project. All agents and developers must strictly adhere to these rules.

## 1. Task Definition Agreement

Every unit of work is an **Atomic Task**. 
- **Rule**: 1 Task = 1 File. 
- **Location**: `openspec/changes/<change-id>/tasks/<task-id>-<name>.md`

### Task File Template
```markdown
# Task: [Title]

## User Story
**As** [Role],
**I want** [Ticket Goal],
**So I can** [Outcome].

## Atomic Scope
- [Specific, single unit of work, e.g., "Create migration file X"]
- [No scope creep]

## Acceptance Criteria
1. [Verification Step 1: Verification command or script]
2. [Verification Step 2: Database check or UI validation]
3. **Constraint**: Migration/Change must not affect other services.
4. **Constraint**: API must work properly after change.

## Impact Area
- [List Service / API Route A]
- [List Service / API Route B]
```

## 2. Working Workflow

### Step 1: Branching
- **Rule**: Create a strictly isolated branch for **each** task.
- **Pattern**: `cp-<change-id>-<task-id>` (e.g., `cp-add-core-features-1.1`).
- **Forbidden**: Working on Task 2 before Task 1 is merged.

### Step 2: Implementation & Verification
1. Implement the Atomic Scope.
2. **Review Gate 1 (Code Reviewer)**: 
   - Load `code-reviewer` skill.
   - strict check for patterns, clean code, and no breaking changes.
3. **Review Gate 2 (Tester)**:
   - Load `tester` skill.
   - Run tests, Verify coverage, Check scenario coverage.
   - **Zero Tolerance**: No errors, no lack of unit tests.

### Step 3: Merge
- Branch must be merged into `main` before the next task begins.

## 3. Restrictions

1. **Code Reviewer Authority**: Must reject any exception or bad quality code. If requirements are unclear, halt and ask the human.
2. **Tester Authority**: Must reject if tests are insufficient or failing.
3. **Atomic Execution**: Never bundle multiple tasks. Start -> Finish -> Verify -> Merge -> Next.
