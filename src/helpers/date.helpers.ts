export const formatMonthValue = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
}

export const parseMonthValue = (monthString: string): Date => {
    return new Date(monthString);
}

export const formatMonthLabel = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? parseMonthValue(date) : date;

    return new Intl.DateTimeFormat('en-GB', {
        month: "long",
        year: 'numeric',
    }).format(dateObj);
};