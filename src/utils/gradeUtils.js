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
 * Calculate weighted total score from a map of { category: score }
 * and a weights object { category: weight }.
 *
 * Returns:
 *   { earned, totalWeight, isComplete, display }
 *   - earned:      sum of (score × weight / 100) for entered categories
 *   - totalWeight: sum of weights for entered categories
 *   - isComplete:  true when all 6 categories have scores
 *   - display:     null if nothing entered, otherwise the earned points
 *
 * Returns null if no entries exist.
 */
export const calcWeightedTotal = (entries, weights) => {
    let earned = 0;
    let enteredWeight = 0;
    let enteredCount = 0;

    CATEGORIES.forEach(cat => {
        const score = entries[cat];
        const weight = weights?.[cat] ?? DEFAULT_WEIGHTS[cat];
        if (score != null && score !== '') {
            earned += (parseFloat(score) * weight) / 100;
            enteredWeight += weight;
            enteredCount++;
        }
    });

    if (enteredCount === 0) return null;

    return {
        earned:       parseFloat(earned.toFixed(2)),   // points earned out of 100
        enteredWeight,                                  // how much of the grade is covered
        isComplete:   enteredCount === CATEGORIES.length,
        // Projected score if remaining categories score 0
        projected:    parseFloat(earned.toFixed(2)),
    };
};
