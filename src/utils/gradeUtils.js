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
