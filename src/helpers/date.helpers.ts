export const parseMonthValue = (monthString: string): Date => {
    return new Date(monthString);
};

export const formatMonthLabel = (date: Date | string): string => {
    const dateObj = typeof date === "string" ? parseMonthValue(date) : date;

    return new Intl.DateTimeFormat("en-GB", {
        month: "long",
        year: "numeric",
    }).format(dateObj);
};

export const formatToIsoString = (date: Date | string): string => {
    const dateObj = typeof date === "string" ? parseMonthValue(date) : date;

    return dateObj.toISOString();
};
