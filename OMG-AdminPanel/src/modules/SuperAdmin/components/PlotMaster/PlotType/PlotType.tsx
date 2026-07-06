import React, { useState, useEffect } from "react";
import { ApiService } from "../../../../../services/ApiService";
import DataTable from "react-data-table-component";
import ColumnSelector from "../../ColumnSelector/ColumnSelector";
import CustomPagination from "../../../../../components/CommonFormElements/Pagination/CustomPagination";
import ExportButtons from "../../../../../components/CommonFormElements/ExportButtons/ExportButtons";
import OopsNoData from "../../../../../components/CommonFormElements/DataNotFound/OopsNoData";
import TableSkeleton from "../../Forms/TableSkeleton";
import customStyles from "../../../../../components/CommonFormElements/DataTableComponents/CustomStyles";
import PermissionAwareTooltip from "../../Tooltip/PermissionAwareTooltip";
import { SmartActions } from "../../Security/SmartActionWithFormName";
import { useLocation } from "react-router-dom";
import Loader from "../../../common/Loader";
import AccessRestricted from "../../../common/AccessRestricted";
import ActionCell from "../../../../../components/CommonFormElements/DataTableComponents/ActionCell";
import LandingIllustration from "../../../../../components/CommonFormElements/LandingIllustration/LandingIllustration";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { PostService } from "../../../../../services/PostService";
import Swal from "sweetalert2";
import * as Yup from "yup";

const Template: React.FC = () => {
  const formSchema = Yup.object().shape({
    plotType: Yup.string().required("Plot Type name is required"),
    PLC: Yup.string().required("PLC is required"),
  });

  const [projectList, setProjectList] = useState<any[]>([]);
  const [sectorList, setSectorList] = useState<any[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [filterColumn, setFilterColumn] = useState("");
  const [showTable, setShowTable] = useState(false);
  const { universalService } = ApiService();
  const [hasVisitedTable, setHasVisitedTable] = useState(false);
  const [searchTrigger, setSearchTrigger] = useState(0);
  const [columns, setColumns] = useState<any[]>([]);
  const [data, setData] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sortColumnKey, setSortColumnKey] = useState<string>("");
  const [editLoading, setEditLoading] = useState(false);
  const [sortDirection, setSortDirection] = useState("ASC");
  const [visibleColumns, setVisibleColumns] = useState<any[]>([]);
  const [columnsReady, setColumnsReady] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);
  const [refreshGrid, setRefreshGrid] = useState(0);
  const [permissionsLoading, setPermissionsLoading] = useState(true);
  const [hasPageAccess, setHasPageAccess] = useState(true);
  const [initialSortReady, setInitialSortReady] = useState(false);
  const location = useLocation();
  const path = location.pathname;
  const segments = path.split("/").filter(Boolean);
  const last = segments[segments.length - 1];
  const isId = !isNaN(Number(last));
  const formName = isId ? segments[segments.length - 2] : last;
  const canExport = SmartActions.canExport(formName);
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const { postDocument } = PostService();

  const procedure = "TypeMaster";
  const pageTitle = "Manage Plot Type";
  const title = "Plot Type";

  const closeModal = () => {
    setOpen(false);
  };

  const fetchProjectList = async () => {
    try {
      const payload = {
        procName: procedure,
        Para: JSON.stringify({
          ActionMode: "fetchProjectList",
        }),
      };

      const response = await universalService(payload);
      const result = response?.data || response;

      setProjectList(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error("Project list fetch failed", error);
      setProjectList([]);
    }
  };

  const fetchSectorList = async () => {
    try {
      const payload = {
        procName: procedure,
        Para: JSON.stringify({
          ActionMode: "fetchSectorList",
        }),
      };

      const response = await universalService(payload);
      const result = response?.data || response;

      setSectorList(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error("Sector list fetch failed", error);
      setSectorList([]);
    }
  };

  useEffect(() => {
    fetchProjectList();
    fetchSectorList();
  }, []);

  const fetchFormPermissions = async () => {
    try {
      setPermissionsLoading(true);
      const saved = localStorage.getItem("EmployeeDetails");
      const employeeId = saved ? JSON.parse(saved).EmployeeId : 0;
      const payload = {
        procName: "AssignForm",
        Para: JSON.stringify({
          ActionMode: "GetForms",
          FormName: formName,
          EmployeeId: employeeId,
        }),
      };
      const response = await universalService(payload);
      const data = response?.data ?? response;
      if (!Array.isArray(data)) {
        setHasPageAccess(false);
        return;
      }
      const pagePermission = data.find(
        (p) =>
          String(p.FormNameWithExt).trim().toLowerCase() ===
          formName?.trim().toLowerCase(),
      );
      if (
        !pagePermission ||
        !pagePermission.Action ||
        pagePermission.Action.trim() === ""
      ) {
        setHasPageAccess(false);
        return;
      }
      SmartActions.load(data);
      setHasPageAccess(true);
    } catch (error) {
      console.error("Form permission fetch failed:", error);
      setHasPageAccess(false);
    } finally {
      setPermissionsLoading(false);
    }
  };

  const handleSort = (column: any, direction: string) => {
    setSortColumnKey(column.columnKey);
    setSortDirection(direction.toUpperCase());
    setInitialSortReady(true);
  };

  const handlePageChange = (p) => {
    setPage(p);
    fetchGridData({ pageOverride: p });
  };

  const handlePerRowsChange = (newPerPage, page) => {
    setPerPage(newPerPage);
    setPage(page);
  };

  const fetchGridColumns = async () => {
    const saved = localStorage.getItem("EmployeeDetails");
    const employeeId = saved ? JSON.parse(saved).EmployeeId : 0;
    try {
      const payload = {
        procName: "GetUserGridColumns",
        Para: JSON.stringify({
          UserId: employeeId,
          GridName: "USP_" + procedure,
        }),
      };
      const res = await universalService(payload);
      const data = res?.data || res;
      if (Array.isArray(data)) {
        const visibleSorted = data
          .filter((c: any) => c.IsVisible)
          .sort((a: any, b: any) => a.ColumnOrder - b.ColumnOrder);
        const defaultSortCol = visibleSorted.find((c: any) => c.isSort);
        if (defaultSortCol) {
          setSortColumnKey(defaultSortCol.ColumnKey);
          setSortDirection(
            (defaultSortCol.SortDir || "ASC").toUpperCase() === "DESC"
              ? "DESC"
              : "ASC",
          );
        }
        setInitialSortReady(true);
      }
      setInitialSortReady(true);
      if (Array.isArray(data)) {
        const reactCols = data
          .filter((c: any) => c.IsVisible === true)
          .sort((a: any, b: any) => a.ColumnOrder - b.ColumnOrder)
          .map((c: any, colIndex: number) => ({
            id: c.ColumnOrder,
            name: c.DisplayName,
            sortable: true,
            columnKey: c.ColumnKey,
            columnIndex: c.ColumnOrder,
            isCurrency: c.IsCurrency,
            isTotal: c.IsTotal,
            selector: (row: any) => row[c.ColumnKey],
            cell: (row: any) => {
              if (row.__isTotal) {
                if (colIndex === 0) return "Total";
                if (c.IsTotal) {
                  const value = row[c.ColumnKey] || 0;
                  return c.IsCurrency
                    ? `$${Number(value).toLocaleString()}`
                    : Number(value).toLocaleString();
                }
                return "";
              }
              const value = row[c.ColumnKey];

              if (c.ColumnKey === "ProjectImage") {
                return (
                  <a
                    href={`${import.meta.env.VITE_IMAGE_PREVIEW_URL_2}CompanyDocs/${value}`}
                    target="_blank"
                  >
                    View
                  </a>
                );
              }
              if (c.IsCurrency && value != null) {
                return `$${Number(value).toLocaleString()}`;
              }
              return value ?? "-";
            },
          }));

        const actionColumn = {
          name: "Action",
          cell: (row: any) => {
            if (row.__isTotal) return null;
            return (
              <ActionCell
                row={row}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            );
          },
          ignoreRowClick: true,
          button: true,
        };
        setColumns([...reactCols, actionColumn]);
      } else {
        setColumns([]);
      }
    } catch (err) {
      console.error("Grid columns fetch failed", err);
      setColumns([]);
    }
  };

  const handleEdit = async (row) => {
    setEditLoading(true);
    setOpen(true);
    setIsEdit(true);
    setEditData(row);
    setTimeout(() => setEditLoading(false), 200);
  };

  const exportColumns = columns
    .filter((c) => c.columnKey)
    .map((c) => ({
      key: c.columnKey,
      label: c.name,
    }));

  const fetchExportData = async () => {
    const payload = {
      procName: procedure,
      Para: JSON.stringify({
        SearchBy: filterColumn,
        Criteria: searchInput,
        Page: page,
        PageSize: 0,
        SortIndexColumn: sortColumnKey || "",
        SortDir: sortDirection,
      }),
    };
    const res = await universalService(payload);
    return res?.data ?? res ?? [];
  };

  const handleDelete = async (row: any) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      // ✅ FIX 4: Was `row.StateName` (copy-paste leftover) — fixed to `row.ProjectName`
      text: `Delete "${row.TypeName}" ?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
    });
    if (!result.isConfirmed) return;
    try {
      const payload = {
        procName: procedure,
        Para: JSON.stringify({
          ActionMode: "Delete",
          EditId: row.TypeId,
        }),
      };
      const response = await universalService(payload);
      const res = Array.isArray(response) ? response[0] : response;
      if (res?.Status === 1 || res?.Status === "1") {
        await Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: res?.msg || "Deleted successfully",
          timer: 1500,
          showConfirmButton: false,
        });
        setSearchTrigger((p) => p + 1);
        setRefreshGrid((p) => p + 1);
      } else {
        Swal.fire("Error", res?.msg || "Delete failed", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Server error", "error");
    }
  };

  const fetchGridData = async (options?: any) => {
    const pageToUse = options?.pageOverride ?? page;
    const perPageToUse = options?.perPageOverride ?? perPage;
    try {
      setTableLoading(true);
      const payload = {
        procName: procedure,
        Para: JSON.stringify({
          ActionMode: "GetReport",
          SearchBy: options?.searchBy ?? filterColumn ?? "",
          Criteria: options?.criteria ?? searchInput ?? "",
          Page: pageToUse,
          PageSize: perPageToUse,
          SortIndexColumn: sortColumnKey || "",
          SortDir: sortDirection,
        }),
      };
      const res = await universalService(payload);
      const result = res?.data || res;

      // ✅ FIX 5: Was `result[0]?.TotalRecords` when result.rows exists — result[0] is
      // undefined in that branch. Fixed to read TotalRecords from the correct place.
      if (result?.rows && Array.isArray(result.rows)) {
        setData(result.rows);
        setTotalRows(result?.TotalRecords || result.rows[0]?.TotalRecords || 0);
      } else if (Array.isArray(result)) {
        setData(result);
        setTotalRows(result[0]?.TotalRecords || 0);
      } else {
        setData([]);
        setTotalRows(0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTableLoading(false);
    }
  };

  const fetchVisibleColumns = async () => {
    const saved = localStorage.getItem("EmployeeDetails");
    const employeeId = saved ? JSON.parse(saved).EmployeeId : 0;
    const payload = {
      procName: "UniversalColumnSelector",
      Para: JSON.stringify({
        EmployeeId: employeeId,
        USPName: "USP_" + procedure, // ✅ was hardcoded "USP_State" — fixed to use procedure
        ActionMode: "List",
        Mode: "Get",
      }),
    };
    const response = await universalService(payload);
    const cols = response?.data ?? response;
    if (Array.isArray(cols)) {
      setVisibleColumns(
        cols
          .map((c) => ({
            ...c,
            IsVisible:
              c.IsVisible === true || c.IsVisible === 1 || c.IsVisible === "1",
            IsHidden:
              c.IsHidden === false || c.IsHidden === 0 || c.IsHidden === "0",
          }))
          .sort((a, b) => a.DisplayOrder - b.DisplayOrder),
      );
      setColumnsReady(true);
      setRefreshGrid((prev) => prev + 1);
    }
  };

  useEffect(() => {
    fetchGridColumns();
  }, [refreshGrid]);

  useEffect(() => {
    if (!showTable || !hasVisitedTable) return;
    if (!sortColumnKey && initialSortReady) {
      fetchGridData();
      return;
    }
    if (sortColumnKey) {
      fetchGridData();
    }
  }, [
    page,
    perPage,
    sortColumnKey,
    sortDirection,
    searchTrigger,
    initialSortReady,
  ]);

  const applySearch = () => {
    if (!SmartActions.canSearch(formName)) return;
    setShowTable(true);
    setHasVisitedTable(true);
    setPage(1);
    setSearchTrigger((p) => p + 1);
  };

  const hasData = data.length > 0;

  useEffect(() => {
    fetchFormPermissions();
  }, []);

  const pageTotals: any = {};
  columns.forEach((col: any) => {
    if (!col.isTotal || !col.columnKey) return;
    pageTotals[col.columnKey] = data.reduce((sum: number, row: any) => {
      return sum + Number(row[col.columnKey] || 0);
    }, 0);
  });

  const totalRow =
    Object.keys(pageTotals).length > 0
      ? columns.reduce((acc: any, col: any) => {
          if (!col.columnKey) {
            acc.__label = "Page Total";
            return acc;
          }
          if (col.isTotal) {
            acc[col.columnKey] = pageTotals[col.columnKey];
          } else {
            acc[col.columnKey] = "";
          }
          return acc;
        }, {})
      : null;

  const tableData =
    hasData && totalRow ? [...data, { ...totalRow, __isTotal: true }] : data;

  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setIsEdit(false);
        setEditData(null);
      }, 200);
      return () => clearTimeout(t);
    }
  }, [open]);

  if (permissionsLoading) {
    return <Loader />;
  }

  if (!hasPageAccess) {
    return <AccessRestricted />;
  }

  return (
    <div className="trezo-card bg-white dark:bg-[#0c1427] mb-[25px] p-[20px] md:p-[25px] rounded-md">
      {/* --- HEADER & SEARCH SECTION --- */}
      <div className="trezo-card-header mb-[10px] md:mb-[10px] sm:flex items-center justify-between pb-5 border-b border-gray-200 -mx-[20px] md:-mx-[25px] px-[20px] md:px-[25px]">
        <div className="trezo-card-title">
          <h5 className="!mb-0 font-bold text-xl text-black dark:text-white">
            {pageTitle}
          </h5>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 sm:w-auto w-full">
          <div className="flex flex-col sm:flex-row items-center gap-3 flex-wrap justify-end">
            {/* Filter Dropdown */}
            <div className="relative w-full sm:w-[180px]">
              <PermissionAwareTooltip
                allowed={SmartActions.canAdvancedSearch(formName)}
                allowedText="Search By"
              >
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-gray-500">
                  <i className="material-symbols-outlined !text-[18px]">
                    filter_list
                  </i>
                </span>
                <select
                  value={filterColumn}
                  onChange={(e) => setFilterColumn(e.target.value)}
                  className={`w-full h-[34px] pl-8 pr-8 text-xs rounded-md appearance-none outline-none border transition-all
                           ${
                             SmartActions.canAdvancedSearch(formName)
                               ? "bg-white text-black border-gray-300 focus:border-primary-button-bg"
                               : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                           }`}
                >
                  <option value="">Select Filter Option</option>
                  <option value="PlotType">Plot Type</option>
                </select>
                <span className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-gray-400">
                  <i className="material-symbols-outlined !text-[18px]">
                    expand_more
                  </i>
                </span>
              </PermissionAwareTooltip>
            </div>

            {/* Search Input */}
            <div className="relative">
              <PermissionAwareTooltip
                allowed={SmartActions.canSearch(formName)}
                allowedText="Enter Criteria"
              >
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-gray-500">
                  <i className="material-symbols-outlined !text-[18px]">
                    search
                  </i>
                </span>
                <input
                  type="text"
                  value={searchInput}
                  placeholder="Enter Criteria..."
                  disabled={!SmartActions.canSearch(formName)}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && applySearch()}
                  className={`h-[34px] w-full pl-8 pr-3 text-xs rounded-md outline-none border transition-all
                           ${
                             SmartActions.canSearch(formName)
                               ? "bg-white text-black border-gray-300 focus:border-primary-button-bg"
                               : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                           }`}
                />
              </PermissionAwareTooltip>
            </div>

            {/* Buttons Group */}
            <div className="flex items-center gap-2">
              <PermissionAwareTooltip
                allowed={SmartActions.canSearch(formName)}
                allowedText="Search"
              >
                <button
                  type="button"
                  onClick={applySearch}
                  disabled={!SmartActions.canSearch(formName)}
                  className="w-[34px] h-[34px] flex items-center justify-center rounded-md border border-primary-button-bg text-primary-button-bg hover:bg-primary-button-bg hover:text-white transition-all shadow-sm disabled:opacity-50"
                >
                  <i className="material-symbols-outlined text-[20px]">
                    search
                  </i>
                </button>
              </PermissionAwareTooltip>
              <PermissionAwareTooltip
                allowed={SmartActions.canManageColumns(formName)}
                allowedText="Manage Columns"
              >
                <div
                  className={`h-[34px] flex items-center ${
                    !SmartActions.canManageColumns(formName)
                      ? "pointer-events-none opacity-50"
                      : ""
                  }`}
                >
                  <ColumnSelector
                    procName={"USP_" + procedure}
                    onApply={fetchVisibleColumns}
                  />
                </div>
              </PermissionAwareTooltip>
              <PermissionAwareTooltip
                allowed={SmartActions.canAdd(formName)}
                allowedText="Add New"
              >
                <button
                  type="button"
                  disabled={!SmartActions.canAdd(formName)}
                  onClick={() => {
                    setOpen(true);
                  }}
                  className="w-[34px] h-[34px] flex items-center justify-center rounded-md border border-primary-button-bg text-white bg-primary-button-bg hover:bg-white hover:border-primary-button-bg hover:text-primary-button-bg transition-all shadow-sm disabled:opacity-50"
                >
                  <i className="material-symbols-outlined text-[20px]">add</i>
                </button>
              </PermissionAwareTooltip>
            </div>
            {(filterColumn || searchInput) && (
              <PermissionAwareTooltip
                allowed={SmartActions.canSearch(formName)}
                allowedText="Reset filter"
              >
                <button
                  type="button"
                  disabled={!SmartActions.canSearch(formName)}
                  onClick={() => {
                    setFilterColumn("");
                    setSearchInput("");
                    setPage(1);
                    setSearchTrigger((p) => p + 1);
                  }}
                  className={`w-[34px] h-[34px] flex items-center justify-center rounded-md
        ${
          SmartActions.canSearch(formName)
            ? "border border-gray-400 text-gray-600 hover:bg-gray-200"
            : "border border-gray-300 text-gray-300 cursor-not-allowed"
        }`}
                >
                  <i className="material-symbols-outlined text-[20px]">
                    refresh
                  </i>
                </button>
              </PermissionAwareTooltip>
            )}
          </div>
        </div>
      </div>

      {!showTable && (
        <LandingIllustration
          title={pageTitle}
          // ✅ FIX 6 (minor): Was hardcoded "Add State" — fixed to match this module
          addLabel="Add Plot Type"
          formName={formName}
          description={
            <>
              Search {title} using filters above.
              <br />
              Manage records, export reports and analyse performance.
              <br />
              <span className="font-medium">OR</span>
              <br />
              Click on Add button to create a new {title} entry.
            </>
          }
        />
      )}

      {showTable && (
        <div>
          {tableLoading ? (
            <div className="flex justify-between items-center py-2 animate-pulse">
              <div className="h-8 w-[120px] bg-gray-200 dark:bg-gray-700 rounded-md" />
              <div className="flex gap-2">
                <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded-md" />
                <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded-md" />
                <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded-md" />
                <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded-md" />
              </div>
            </div>
          ) : hasData ? (
            <div className="flex justify-between items-center py-2 mb-[10px]">
              <div className="relative">
                <select
                  value={perPage}
                  onChange={(e) => {
                    const size = Number(e.target.value);
                    setPerPage(size);
                    setPage(1);
                    fetchGridData({ pageOverride: 1, perPageOverride: size });
                  }}
                  className="h-8 w-[120px] px-3 pr-7 text-xs font-semibold
        text-gray-600 dark:text-gray-300
        bg-transparent border border-gray-300 dark:border-gray-600
        rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800
        transition-all appearance-none"
                >
                  <option value="10">10 / page</option>
                  <option value="25">25 / page</option>
                  <option value="50">50 / page</option>
                  <option value="100">100 / page</option>
                </select>
                <span className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                  <i className="material-symbols-outlined text-[18px] text-gray-500">
                    expand_more
                  </i>
                </span>
              </div>
              <PermissionAwareTooltip allowed={canExport}>
                <div
                  className={!canExport ? "pointer-events-none opacity-50" : ""}
                >
                  <ExportButtons
                    title={title}
                    columns={exportColumns}
                    fetchData={fetchExportData}
                    disabled={!canExport}
                  />
                </div>
              </PermissionAwareTooltip>
            </div>
          ) : null}

          <div
            className="trezo-card-content 
  bg-white dark:bg-[#0f172a]
  text-gray-800 dark:text-gray-200
  border border-gray-200 dark:border-gray-700
  rounded-lg overflow-hidden"
          >
            <DataTable
              columns={columns}
              data={tableData}
              customStyles={customStyles}
              pagination
              paginationServer
              paginationTotalRows={totalRows}
              paginationComponent={(props) => (
                <CustomPagination
                  {...props}
                  currentPage={page}
                  rowsPerPage={perPage}
                />
              )}
              onChangePage={handlePageChange}
              onChangeRowsPerPage={handlePerRowsChange}
              onSort={handleSort}
              sortServer
              defaultSortFieldId={
                columns.find((col) => col.columnKey === sortColumnKey)?.id
              }
              defaultSortAsc={sortDirection === "ASC"}
              progressPending={tableLoading}
              progressComponent={
                <TableSkeleton rows={perPage} columns={columns.length || 8} />
              }
              conditionalRowStyles={[
                {
                  when: (row) => row.__isTotal,
                  style: {
                    fontWeight: 700,
                    backgroundColor: "var(--color-primary-table-bg)",
                  },
                },
              ]}
              noDataComponent={!tableLoading && <OopsNoData />}
            />
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      <Dialog open={open} onClose={closeModal} className="relative z-60">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
        />

        <div className="fixed inset-0 z-60 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all
      data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200
      data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-[550px]
      data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
            >
              <div className="trezo-card w-full bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
                {/* Header */}
                <div
                  className="trezo-card-header bg-gray-50 dark:bg-[#15203c] mb-[20px] md:mb-[25px]
      flex items-center justify-between -mx-[20px] md:-mx-[25px] -mt-[20px] md:-mt-[25px]
      p-[20px] md:p-[25px] rounded-t-md"
                >
                  <div className="trezo-card-title">
                    <h5 className="!mb-0">
                      {isEdit ? "Edit Segment" : "Add New Segment"}
                    </h5>
                  </div>
                  <button
                    type="button"
                    className="text-[23px] transition-all leading-none text-black dark:text-white hover:text-primary-button-bg"
                    onClick={closeModal}
                  >
                    <i className="ri-close-fill"></i>
                  </button>
                </div>

                {/* Body */}
                {editLoading ? (
                  <div className="flex items-center justify-center min-h-[280px]">
                    <div className="flex flex-col items-center gap-3">
                      <div className="theme-loader"></div>
                      <p className="text-sm text-gray-500">
                        Loading document...
                      </p>
                    </div>
                  </div>
                ) : (
                  <Formik
                    enableReinitialize
                    initialValues={{
                      plotType: editData?.TypeName || "",
                      PLC: editData?.PLCPercentage || "",
                    }}
                    validationSchema={formSchema}
                    onSubmit={async (values, { resetForm }) => {
                      // ✅ FIX 2: setSaving(true) was missing — button stayed enabled during submit
                      setSaving(true);

                      const payload = {
                        procName: procedure,
                        Para: JSON.stringify({
                          ActionMode: isEdit ? "Update" : "Insert",
                          EditId: editData?.TypeId || 0,
                          TypeName: values.plotType,
                          PLCPercentage: values.PLC,
                        }),
                      };

                      try {
                        const res = await universalService(payload);
                        if (res[0]?.Status == 1) {
                          await Swal.fire({
                            icon: "success",
                            title: isEdit ? "Updated!" : "Added!",
                            text: res[0]?.Msg || "Segment saved successfully",
                            timer: 1500,
                            showConfirmButton: false,
                          });
                          resetForm();
                          closeModal();
                          setPage(1);
                          setSearchTrigger((p) => p + 1);
                          setRefreshGrid((p) => p + 1);
                        } else {
                          Swal.fire(
                            "Error",
                            res[0]?.Msg || "Operation failed",
                            "error",
                          );
                        }
                      } catch (err) {
                        Swal.fire("Error", "Server error", "error");
                      } finally {
                        // ✅ FIX 3: Removed duplicate fetchGridData() + setRefreshGrid()
                        // calls that were after the try/catch — the setSearchTrigger inside
                        // the success block already triggers fetchGridData via useEffect,
                        // and setRefreshGrid re-fetches columns. No double-fetch needed.
                        setSaving(false);
                      }
                    }}
                  >
                    {({
                      setFieldValue,
                      setErrors,
                      values,
                      errors,
                      touched,
                    }) => (
                      <Form className="space-y-6">
                        {/* Block Name */}
                        <div>
                          <label className="mb-[10px] text-black dark:text-white font-medium block">
                            Plot Type Name
                            <span className="text-red-500">*</span>
                          </label>

                          <Field
                            type="text"
                            name="plotType"
                            placeholder="Enter Plot Type Name"
                            className="h-[55px] rounded-md text-black dark:text-white border border-gray-200
      dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0
      transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400
      focus:border-primary-button-bg"
                          />

                          <ErrorMessage
                            name="plotType"
                            component="p"
                            className="text-red-500 text-sm"
                          />
                        </div>

                        {/* Block Name */}
                        <div>
                          <label className="mb-[10px] text-black dark:text-white font-medium block">
                            PLC Percentage
                            <span className="text-red-500">*</span>
                          </label>

                          <Field
                            type="text"
                            name="PLC"
                            placeholder="Enter PLC Percentage"
                            className="h-[55px] rounded-md text-black dark:text-white border border-gray-200
      dark:border-[#172036] bg-white dark:bg-[#0c1427] px-[17px] block w-full outline-0
      transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400
      focus:border-primary-button-bg"
                          />

                          <ErrorMessage
                            name="PLC"
                            component="p"
                            className="text-red-500 text-sm"
                          />
                        </div>

                        <hr className="border-0 border-t border-gray-100 dark:border-gray-800 my-6 md:-mx-[25px]" />

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3">
                          <button
                            type="button"
                            className="mr-[15px] px-[26.5px] py-[12px] rounded-md bg-danger-500 text-white hover:bg-danger-400"
                            onClick={closeModal}
                          >
                            Cancel
                          </button>

                          <button
                            type="submit"
                            disabled={saving}
                            className="px-[26.5px] py-[12px] rounded-md bg-primary-button-bg text-white hover:bg-primary-button-bg-hover disabled:opacity-60"
                          >
                            {saving
                              ? isEdit
                                ? "Updating..."
                                : "Adding..."
                              : isEdit
                                ? "Update"
                                : "Add"}
                          </button>
                        </div>
                      </Form>
                    )}
                  </Formik>
                )}
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default Template;
