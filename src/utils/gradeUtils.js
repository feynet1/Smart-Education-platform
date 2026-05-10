/**
 * Convert a numeric score (0-100) to a letter grade.
 */
export const scoreToGrade = (score) => {
    if (score >= 97) return 'A+';
    if (score >= 93) return 'A';
    if (score >= 90) return 'A-';
    if (score >= 87) return 'B+';
    if (score >= 83) return 'B';
    if (score >= 80) return 'B-';
    if (score >= 77) return 'C+';
    if (score >= 73) return 'C';
    if (score >= 70) return 'C-';
    if (score >= 67) return 'D+';
    if (score >= 60) return 'D';
    return 'F';
};

/** Convert letter grade to GPA points */
export const gradeToPoints = (grade) => {
    const map = {
        'A+': 4.0, 'A': 4.0, 'A-': 3.7,
        'B+': 3.3, 'B': 3.0, 'B-': 2.7,
        'C+': 2.3, 'C': 2.0, 'C-': 1.7,
        'D+': 1.3, 'D': 1.0, 'F': 0.0,
    };
    return map[grade] ?? 0;
};

/** MUI color for a letter grade */
export const gradeColor = (grade) => {
    if (!grade) return 'default';
    if (grade.startsWith('A')) return 'success';
    if (grade.startsWith('B')) return 'primary';
    if (grade.startsWith('C')) return 'warning';
    return 'error';
};

/** Default weights for the 6 categories (must sum to 100) */
export const DEFAULT_WEIGHTS = {
    homework:   10,
    assignment: 15,
    quiz:       10,
    midterm:    25,
    project:    15,
    final_exam: 25,
};

/**
 * Default maximum marks per category.
 * Teacher enters actual score (e.g. 8) out of this max (e.g. 10).
 * System converts: percentage = (score / maxMark) * 100
 * then applies weight.
 */
export const DEFAULT_MAX_MARKS = {
    homework:   10,
    assignment: 20,
    quiz:       10,
    midterm:    50,
    project:    30,
    final_exam: 100,
};

/** Human-readable labels for each category */
export const CATEGORY_LABELS = {
    homework:   'Homework',
    assignment: 'Assignment',
    quiz:       'Quiz',
    midterm:    'Midterm',
    project:    'Project',
    final_exam: 'Final Exam',
};

export const CATEGORIES = Object.keys(DEFAULT_WEIGHTS);

/**
 * Calculate weighted total from raw scores.
 *
 * @param entries   { category: rawScore }  — actual marks entered by teacher
 * @param weights   { category: weight% }   — from course_weights or DEFAULT_WEIGHTS
 * @param maxMarks  { category: maxMark }   — from course_weights or DEFAULT_MAX_MARKS
 *
 * Returns null if nothing entered, otherwise:
 *   {
 *     earned:        weighted points earned out of 100,
 *     enteredWeight: sum of weights for entered categories,
 *     isComplete:    true when all 6 categories have scores,
 *   }
 */
export const calcWeightedTotal = (entries, weights, maxMarks) => {
    let earned = 0;
    let enteredWeight = 0;
    let enteredCount = 0;

    CATEGORIES.forEach(cat => {
        const raw    = entries[cat];
        const weight = weights?.[cat]  ?? DEFAULT_WEIGHTS[cat];
        const max    = maxMarks?.[cat] ?? DEFAULT_MAX_MARKS[cat];

        if (raw != null && raw !== '') {
            // Cap percentage at 100% — score cannot exceed max marks
            const pct = Math.min((parseFloat(raw) / max) * 100, 100);
            earned += (pct * weight) / 100;
            enteredWeight += weight;
            enteredCount++;
        }
    });

    if (enteredCount === 0) return null;

    return {
        earned:        parseFloat(Math.min(earned, 100).toFixed(2)), // never exceed 100
        enteredWeight,
        isComplete:    enteredCount === CATEGORIES.length,
    };
};
