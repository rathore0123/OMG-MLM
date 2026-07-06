declare module 'react-data-table-component-extensions' {
  import { ComponentType } from 'react';

  interface DataTableProps<T> {
    columns: any;
    data: T[];
    theme?: string;
    print?: boolean;
    customStyles?: any;
    highlightOnHover?: boolean;
    pagination?: boolean;
    subHeader?: boolean;
    subHeaderComponent?: React.ReactNode;
  }

  const DataTable: ComponentType<DataTableProps<any>>;
  export default DataTable;
}
