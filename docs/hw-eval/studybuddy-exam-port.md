# Board-paper bank, exam packages and board practice on Study Buddy (port, 14 Nov 2026)

The owner chose the full exam port for Study Buddy on 13 Nov 2026 (`docs/hw-eval/board-bank-roadmap.md`, phase 5). This branch, `feat/exam-port`, brings Digi Classroom's work over on top of the InkBuddy phases 1-5 (PR #18, `feat/inkbuddy-phase1`).

## What came over

| Digi Classroom | What it is | Migration |
|---|---|---|
| `cb6f00c..eb85d88` | Board-paper bank, phases 1-5 (`docs/hw-eval/board-paper-importer.md`) | 032, 033 |
| `da34921..2d5eea9` | Exam packages, phases 1-6: builder, learner catalogue, timed attempts, photo booklet, answer sheet, reading and marking, pools and practice tests, reports (`docs/hw-eval/exam-packages.md`) | 034, 035 |
| `193b4fd` | Mark revisions with a named reviser; the super admin's AI usage view (`docs/hw-eval/mark-revisions.md`) | 036 |
| `a4fe02b` (exam part) | An exam report's standing among other learners' first attempts | — |
| `e6a5c3d..341fdbb` | Board-question pools with textbook references, pictures and a teacher's key check; InkBuddy board practice, weak topics and the quick test (`docs/hw-eval/board-bank-roadmap.md`) | 037 |

The bank files, the marking scheme and the pool files are board documents and stay out of git (`hw-evals/` is ignored).

## Where Study Buddy differs from Digi Classroom

- **sharp** is a declared dependency of `apps/api` (0.35.5; it was already in the lockfile under `next`). Digi Classroom gets it indirectly. The exam reader uses it to cut booklet pages and read the printed answer sheet. `exams/crop.ts SharpFn` types it for both sharp 0.32 and 0.35. After the next image build, check it loads in the api container: `node -e "require('sharp')"`.
- **zod 4:** a bank question's `alternatives_text` is a `z.partialRecord` (in zod 4, a record over an enum needs every key).
- **Icons:** `CircleDashed` is in the lucide shim (`apps/web/src/lib/icons/lucide-shim.tsx`).
- **Learner nav:** "Board Exam Practice" is added; Sarvagya and Mitram stay out, as before.
- **Tests:** the three bank suites that read the real CBSE paper read it only when `hw-evals/banks/...` exists (Jest runs a skipped block's body, so they used to fail without the file).

## Apply the migrations by hand, before deploying the code

There is no migration ledger in Study Buddy's database. It is at 031 (verified identical to Digi Classroom's at 031 on 10 Nov). Apply 032 to 037 **in order**, on the server, each first as a rehearsal and then with `--apply`. The scripts take Digi Classroom's names by default; for Study Buddy, set:

```bash
export PG_CONTAINER=$(docker ps --format '{{.Names}}' | grep c9d3yxfiw42bilo8w4gkc7nl)
export PG_SUPER=$(docker exec "$PG_CONTAINER" printenv POSTGRES_USER)   # the role is NOT studybuddy_app
export PG_APP_ROLE=$PG_SUPER
export PG_DB=studybuddy
export BACKUP_DIR=/root/backups/studybuddy
export MIG_DIR=/root/hw-migrate-sb    # copy 032..037 *.sql and *.down.sql here from packages/core/src/lib/db/migrations
```

```bash
./apply-migration-032.sh            # rehearsal on a throwaway copy; changes nothing
./apply-migration-032.sh --apply
```

Then the same for 033, 034, 035, 036 and 037. Each script checks that the one before is applied and that its own is not, takes a schema and `hw_*` data backup, rehearses up / down / up on a throwaway database (`hw_rehearsal`, dropped afterwards), and only then applies.

The rehearsal creates and drops a database on Study Buddy's own Postgres container. That is the owner's call to run.

## Before learners can use it

All switches are off by default; nothing changes for learners until they are turned on.

1. **Job runner** for the `studybuddy` api, every minute: `POST /api/cron/hw-jobs` with `Authorization: Bearer $HW_CRON_SECRET` (the secret is already set). Without it nothing is read, marked or released.
2. **HW env and an OpenAI key** on the api container: `HW_AI_PROVIDER=openai`, the `HW_*_MODEL` settings Digi Classroom uses, `OPENAI_API_KEY`.
3. **R2:** the `studybuddy` bucket and key (made 13 Nov). Pictures of the bank live under `hw-bank/`, booklet pages and pool pictures under `hw-exams/`.
4. **Switches**, when the owner says so:
   - `HW_SELF_PRACTICE_ENABLED=true`: InkBuddy, with board practice, weak topics and the quick test;
   - `HW_EXAMS_ENABLED=true`: the learner's board-exam practice (timed papers, booklets, reports);
   - `HW_INKBUDDY_POOL_AI_ENABLED`: written board questions in InkBuddy (off: only multiple choice and assertion-reason);
   - `HW_EXAMS_AUTHORED_AI_ENABLED`: AI marking of the super admin's own mock questions.

## Content

As on Digi Classroom (`board-bank-roadmap.md`, "Production, on the owner's go"):

1. Copy `cbse-science-qbank/pools` and `figures` to the server.
2. `npm run hw:exam:pool -w apps/api -- import <pool.json> --figures <dir> --year 2027 --slug cbse-x-science-chapter-practice --by "<name>"` for each of the 13 pools.
3. A teacher checks the assistant's keys in the builder (Exam Packages → the pool → key panel).
4. Publish the pools and the package.
