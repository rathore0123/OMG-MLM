export function objectEntriesToArray<T>(obj: Record<string, T>): Array<{ key: string; value: T }> {
    return Object.entries(obj).map(([key, value]) => ({ key, value }));
}


export const  ChangeDateintoLongDate = (Value:any)=>{
    const dateString: string = Value;
    const date: Date = new Date(dateString);

// Define options for the month name
const monthOptions: Intl.DateTimeFormatOptions = { month: 'long' };
const day: string = date.getDate().toString().padStart(2, '0'); // Get the day and pad with zero if needed
const month: string = date.toLocaleDateString('en-GB', monthOptions);
const year: string = date.getFullYear().toString();

// Construct the formatted date string
const formattedDate: string = `${day}-${month}-${year}`;

// console.log(formattedDate); // Output: "10-September-2024"

return formattedDate
    
}

interface DateInput {
    startDate: string;
    endDate: string;
  }
  
  interface FormattedDateOutput {
    startDate: string;
    endDate: string;
  }
  
 export const formatDates = (dates: any): FormattedDateOutput => {
    const formatDate = (dateString: string): string => {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = date.toLocaleString('default', { month: 'long' });
      const year = date.getFullYear().toString();
      return `${day}-${month}-${year}`;
    };
  
    return {
      startDate: formatDate(dates.startDate),
      endDate: formatDate(dates.endDate),
    };
  };

  export const subtractOneMonth = (dateString: any): string => {
    const date = new Date(dateString);
    
    // Subtract one month
    date.setMonth(date.getMonth() - 1);
  
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear().toString();
  
    return `${day}-${month}-${year}`;
  };