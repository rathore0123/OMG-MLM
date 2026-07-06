import MembersTable from "../components/Members/MembersTable";
import { Link } from "react-router-dom";

export default function Members() {
  return (
    <>
      <div className="mb-[25px] md:flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h5 className="!mb-0">Members</h5>
          <Link
            to="/members/carry-forward"
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-md bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 transition-all"
          >
            <i className="material-symbols-outlined !text-[14px]">account_balance</i>
            Carry-Forward Report
          </Link>
        </div>

        <ol className="breadcrumb mt-[12px] md:mt-0">
          <li className="breadcrumb-item inline-block relative text-sm mx-[11px] ltr:first:ml-0 rtl:first:mr-0 ltr:last:mr-0 rtl:last:ml-0">
            <Link
              to="/dashboard/ecommerce"
              className="inline-block relative ltr:pl-[22px] rtl:pr-[22px] transition-all hover:text-primary-500"
            >
              <i className="material-symbols-outlined absolute ltr:left-0 rtl:right-0 !text-lg -mt-px text-primary-500 top-1/2 -translate-y-1/2">
                home
              </i>
              Dashboard
            </Link>
          </li>

          <li className="breadcrumb-item inline-block relative text-sm mx-[11px] ltr:first:ml-0 rtl:first:mr-0 ltr:last:mr-0 rtl:last:ml-0">
            Members
          </li>
        </ol>
      </div>

      <MembersTable />
    </>
  );
}
