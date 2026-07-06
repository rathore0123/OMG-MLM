import React from 'react';
import { Formik, Form, Field } from 'formik';
import DatePicker from 'react-datepicker';
import { useState } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';



interface DatePickerFieldProps {
    field: {
      name: string;
      value: Date | null;
    };
    form: {
      setFieldValue: (field: string, value: Date | null) => void;
    };
  }
  
  export const DatePickerField: React.FC<DatePickerFieldProps> = ({ field, form }) => {
    const [startDate, setStartDate] = useState(new Date());
  //   const handleChange = (date: Date | null) => {
  //     form.setFieldValue(field.name, date)
  //     if (date) {
  //         console.log(format(date, 'dd-MMMM-yyyy')); // Format the date as needed
  //     }
  // };
    return (
      <></>
      // <DatePicker  className="form-control" dateFormat="PPP"  selected={field.value} onChange={(date:Date) => form.setFieldValue("DOB", date)} />
    );
  };




