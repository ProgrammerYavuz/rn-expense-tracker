export const getLast7Days = () => {
    const daysOfWeek = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
    const result = [];

    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        result.push({
            day: daysOfWeek[date.getDay()],
            date: date.toISOString().split("T")[0],
            income: 0,
            expense: 0
        });
    }

    return result.reverse();
};

export const getLast12Months = () => {
    const monthsOfYear = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
    const result = [];

    for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);

        const monthName = monthsOfYear[date.getMonth()];
        const shortYear = date.getFullYear().toString().slice(-2);
        const formattedMonthYear = `${monthName} ${shortYear}`;
        const formattedDate = date.toISOString().split("T")[0];

        result.push({
            month: formattedMonthYear,
            date: formattedDate,
            income: 0,
            expense: 0
        });
    }

    return result.reverse();
};

export const getYearsRange = (startYear: number, endYear: number): any => {
    const result = [];

    for (let year = startYear; year <= endYear; year++) {
        result.push({
            year: year.toString(),
            fullDate: `01-01-${year}`,
            income: 0,
            expense: 0
        });
    }

    return result.reverse();
}