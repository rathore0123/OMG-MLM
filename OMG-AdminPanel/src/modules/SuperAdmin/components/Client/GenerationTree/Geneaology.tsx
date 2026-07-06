import BinaryTree from "../../Tree/BinaryTree";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { ApiService } from "../../../../../services/ApiService";
import AutoCompleter from "../../../../../components/CommonFormElements/InputTypes/AutoCompleter";

// ── hardcoded root user, NOT read from localStorage per requirement
const UserName = "OMG00001";

// ── fallback avatar when API doesn't return a NodeImg for a user
const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

// ── icon shown on empty ("Blank") binary tree slots
const PLUS_ICON =
  "http://122.160.25.202/omgmlm/mainapi/uploads/employeedocuments/plus.png";

const BinaryTreeComponent = () => {
  const { universalService } = ApiService();

  const [firstNode, setfirstNode] = useState<any>(null);
  const [treeData, settreeData] = useState<any>([]);

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [treeLoading, setTreeLoading] = useState(false);
  const [treeError, setTreeError] = useState<string | null>(null);

  const [searchValue, setSearchValue] = useState(UserName);

  // ── guards against race conditions — only the latest fetch may commit state
  const fetchIdRef = useRef(0);

  const generateTreeNodes = (
    Data: any,
    teamCountsById: Map<string, { LeftMemberCount: number; RightMemberCount: number }>,
  ) => {
    return Data.map((itm: any) => {
      const counts = teamCountsById.get(String(itm?.id));
      return {
        id: itm?.id,
        left_child_id: itm?.left_child_id,
        right_child_id: itm?.right_child_id,
        username: itm?.username,
        paidstatus: itm?.paidstatus,
        description: {
          userName: itm?.userName,
          Reg_Date: itm?.Reg_Date,
          Bot_Status: itm?.BotActivationStatus,
          Bot_Activation_Date: itm?.Bot_Activation_Date,
          totalInvestmentAmount: itm?.invested,
          Sponsor: itm?.Sponsor,
          totalleftTeamCount: itm?.TotalLeftTeamBotCount,
          totalRightTeamCount: itm?.TotalRightTeamBotCount,
          leftTeamCount: itm?.LeftTeamBotCount,
          rightTeamCount: itm?.RightTeamBotCount,
          leftRemainingTeamCount: itm?.LeftRemainingTeamBotCount,
          rightRemaining: itm?.RightRemainingTeamBotCount,
          leftMemberCount: counts?.LeftMemberCount ?? 0,
          rightMemberCount: counts?.RightMemberCount ?? 0,
        },
        image:
          itm?.NodeImg && itm.NodeImg.trim() !== "" ? itm.NodeImg : DEFAULT_AVATAR,
      };
    });
  };

  const FetchNodeData = useCallback(
    async (usernameToFetch: string | null, searchedUserName?: string | null) => {
      if (!usernameToFetch) return;

      const thisFetchId = ++fetchIdRef.current;

      const param = searchedUserName
        ? { UserName: usernameToFetch, SearchedUserName: searchedUserName }
        : { UserName: usernameToFetch };

      const payload = {
        procName: "GetBinaryTree",
        Para: JSON.stringify(param),
      };

      // Real Left/Right MEMBER counts (not business volume) for every node in
      // this same subtree — root is whichever username the tree above resolves to.
      const teamCountsPayload = {
        procName: "GetTeamCountsForTree",
        Para: JSON.stringify({ UserName: searchedUserName || usernameToFetch }),
      };

      setTreeLoading(true);
      setfirstNode(null);
      settreeData([]);
      setTreeError(null);

      try {
        const [res, teamCountsRes] = await Promise.all([
          universalService(payload),
          universalService(teamCountsPayload),
        ]);
        const data = res?.data ?? res;

        // stale response — a newer search has already started, ignore this one
        if (thisFetchId !== fetchIdRef.current) return;

        if (!data || !Array.isArray(data) || data.length === 0) {
          setTreeError("User not found in your downline.");
          return;
        }

        console.log(data);

        const teamCountsData = teamCountsRes?.data ?? teamCountsRes;
        const teamCountsById = new Map<
          string,
          { LeftMemberCount: number; RightMemberCount: number }
        >(
          (Array.isArray(teamCountsData) ? teamCountsData : []).map((r: any) => [
            String(r.id),
            { LeftMemberCount: r.LeftMemberCount ?? 0, RightMemberCount: r.RightMemberCount ?? 0 },
          ]),
        );

        const treeNodes = generateTreeNodes(data, teamCountsById);
        setfirstNode(treeNodes[0] ?? null);
        settreeData(treeNodes);
      } catch (error) {
        console.error("Error fetching tree data:", error);
        if (thisFetchId === fetchIdRef.current) {
          setTreeError("Failed to load tree. Please try again.");
        }
      } finally {
        if (thisFetchId === fetchIdRef.current) {
          setTreeLoading(false);
        }
      }
    },
    [],
  );

  const handleSearch = useCallback(
    async (rawUsername: string) => {
      const searchedUserName = rawUsername?.trim();
      if (!searchedUserName) return;

      setTreeError(null);

      if (searchedUserName === UserName) {
        await FetchNodeData(UserName);
        return;
      }

      await FetchNodeData(UserName, searchedUserName);
    },
    [FetchNodeData],
  );

  const fetchManagers = async (searchText: string) => {
    try {
      setLoading(true);

      const payload = {
        procName: "Client",
        Para: JSON.stringify({
          searchData: searchText,
          ActionMode: "getUsersList",
        }),
      };

      const res = await universalService(payload);
      const data = res?.data || res;

      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load managers", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const onClickUser = (userId: any) => {
    // GetBinaryTree resolves its root by @UserName (a string like "OMG00001"),
    // not by ClientId — the clicked node only carries its numeric id, so pull
    // the real username back out of the "ClientName[UserName]" display string.
    const clickedNode = treeData.find((u: any) => u.id === userId);
    const rawUsername = clickedNode?.username?.match(/\[([^\]]+)\]$/)?.[1];
    if (rawUsername) FetchNodeData(rawUsername);
  };

  useEffect(() => {
    FetchNodeData(UserName);
  }, [FetchNodeData]);

  return (
    <div className="trezo-card bg-white dark:bg-[#0c1427] mb-[25px] p-[20px] md:p-[25px] rounded-md">
      <div className="trezo-card-header mb-[10px] md:mb-[10px] sm:flex items-center justify-between pb-5 border-b border-gray-200 -mx-[20px] md:-mx-[25px] px-[20px] md:px-[25px]">
        <div className="trezo-card-title">
          <h5 className="!mb-0 font-bold text-xl text-black dark:text-white">
            Binary Tree
          </h5>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 sm:w-auto w-full">
          <div className="flex flex-col sm:flex-row items-center gap-3 flex-wrap justify-end">
            <div>
              <div className="flex shadow-sm rounded-lg overflow-visible">
                <AutoCompleter
                  memberList={users}
                  loading={loading}
                  onSearch={(text: string) => {
                    setSearchValue(text);
                    fetchManagers(text);
                  }}
                  onSelect={(member) => {
                    setSearchValue(member.username);
                    handleSearch(member.username);
                  }}
                />
                <button
                  onClick={() => handleSearch(searchValue)}
                  disabled={treeLoading}
                  className="w-[55px] ml-2 rounded-md border flex items-center justify-center bg-primary-button-bg text-white hover:bg-primary-button-bg-hover transition disabled:opacity-50"
                >
                  <i className="material-symbols-outlined">search</i>
                </button>

                <button
                  onClick={() => {
                    setSearchValue(UserName);
                    setTreeError(null);
                    FetchNodeData(UserName);
                  }}
                  disabled={treeLoading}
                  className="w-[55px] ml-2 rounded-md border flex items-center justify-center bg-primary-button-bg text-white hover:bg-primary-button-bg-hover transition disabled:opacity-50"
                >
                  <i className="material-symbols-outlined">refresh</i>
                </button>
              </div>
            </div>
          </div>
        </div>

        {treeError && (
          <div className="text-danger" style={{ fontSize: 12, marginTop: 6 }}>
            {treeError}
          </div>
        )}
      </div>

      <div className="mt-5 min-h-[450px]">
        {treeLoading ? (
          <div className="flex items-center justify-center min-h-[450px]">
            <div className="spinner-border text-success" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        ) : firstNode ? (
          <div className="animate-in fade-in duration-500">
            {/*
              FIX: BinaryTree/BinaryTreeNode only understand `imageFake` and
              `nameFake` (not `plusIcon`) for the empty-slot placeholder, and
              `defaultAvatar` for the broken/missing-image fallback. Passing
              the old `plusIcon` prop meant it was silently ignored.
            */}
            <BinaryTree
              allUsers={treeData}
              rootUser={treeData[0]}
              bgSideBar={"#00b6eb"}
              colorText={"#333"}
              colorSideBar={"#fff"}
              onClickUser={onClickUser}
              imageFake={PLUS_ICON}
              nameFake="Blank"
              defaultAvatar={DEFAULT_AVATAR}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default BinaryTreeComponent;