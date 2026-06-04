# LexiClass Metric Definitions

This document defines the MVP metric language used in the frontend and backend.

## Completion

Completion measures coverage: whether assigned words have been practiced at least once.

```text
completion = unique practiced words / assigned words
```

For a class assignment:

```text
completion = unique student-word pairs practiced / total student-word pairs
```

Repeated attempts on the same word do not increase completion after that word is already practiced.

## Mastery

Mastery measures correctness for a word.

```text
mastery = correct attempts / total attempts
```

Repeated attempts do affect mastery because each saved answer is part of the correctness history.

## Problem Words

Problem words are teacher-facing words that need attention.

Default teacher analytics uses the recent actionable rule:

```text
problem word = wrong attempts > 0 and wrong rate >= 40% in the selected recent window
```

The available recent windows are 14, 30, and 90 days. The all-history view shows every historical word with at least one wrong attempt.

The MVP tracks:

- `wrongAnswers`: total wrong attempts for the word
- `correctAnswers`: total correct attempts for the word
- `affectedStudents`: distinct students who answered the word incorrectly

## Weak Words

Weak words are student-facing words with low mastery.

```text
weak word = mastery < 60%
```

On the practice result screen, weak words are calculated from projected mastery after the just-finished session. This means a word can leave the weak list immediately if the session improves its mastery to 60% or higher.

The student progress sidebar lists weak words for review planning. It does not provide a global "practice weak words" action because weak words can belong to different assignments.

## Student Filters

Student dashboard assignment filters:

- `All`: every assigned word set.
- `Due today`: assigned sets whose due label contains today.
- `Completed`: assigned sets with 100% completion.
- `Low completion`: assigned sets below 60% completion.

Student progress filters:

- `All`: every practiced word.
- `Weak`: words with mastery below 60%.
- `Learned`: words with mastery of 80% or higher.

## Practical Interpretation

- Use **Completion** when the question is: "How much assigned material has been practiced?"
- Use **Mastery** when the question is: "How accurately is this word answered?"
- Use **Problem words** when the question is: "Which words need teacher attention?"
- Use **Weak words** when the question is: "Which words should this student review next?"
