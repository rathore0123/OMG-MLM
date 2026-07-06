import { useLocation, useNavigate } from "react-router-dom";

type Props = {
  row: any;
  onDownload?: (row: any) => void;
};

// ✅ helper function (outside component)
export const handleDownload = (row: any) => {
  if (!row?.FileUrl) return;
  console.log(row);

  const link = document.createElement("a");
  link.href =
    import.meta.env.VITE_IMAGE_PREVIEW_URL + "CompanyDocs" + "/" + row.FileUrl;
  link.download = row.Title || "file";
  link.target = "_blank";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// ✅ component
export const ActionCell: React.FC<Props> = ({ row, onDownload }) => {
  console.log(row);
  const location = useLocation();
  const navigate = useNavigate();

  const isEmployeePage = location.pathname.toLowerCase().includes("/employee");

  const canDownload = !!row?.FileUrl;

  return (
    <div className="flex gap-2">
      {/* DOWNLOAD */}
      <button
        disabled={!canDownload}
        className={
          canDownload
            ? "mat-download-btn form-btn text-400"
            : "mat-download-btn text-gray-300 cursor-not-allowed"
        }
        onClick={() => (onDownload ? onDownload(row) : handleDownload(row))}
      >
        Download
      </button>

      {/* PERMISSION
      {isEmployeePage && row?.EmployeeId && (
        <button
          className="text-gray-500 hover:text-indigo-600"
          onClick={() =>
            navigate(`/superadmin/employee/${row.EmployeeId}/permissions`)
          }
        >
          <i className="material-symbols-outlined !text-md">settings</i>
        </button>
      )} */}
    </div>
  );
};
