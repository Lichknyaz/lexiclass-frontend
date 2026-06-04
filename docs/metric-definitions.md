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

Problem words are words with at least one wrong attempt.

The MVP tracks:

- `wrongAnswers`: total wrong attempts for the word
- `correctAnswers`: total correct attempts for the word
- `affectedStudents`: distinct students who answered the word incorrectly

## Practical Interpretation

- Use **Completion** when the question is: "How much assigned material has been practiced?"
- Use **Mastery** when the question is: "How accurately is this word answered?"
- Use **Problem words** when the question is: "Which words need teacher attention?"
