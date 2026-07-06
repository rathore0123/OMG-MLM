import BinaryTree from "../../Tree/BinaryTree";
import { dynamicImage } from "../../../Service";
import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useApiHelper } from "../../../utils/ApiHelper";
import { decryptData } from "../../../utils/helper/Crypto";
import { Container, Col, Row } from "reactstrap";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import GenealogyBinary from "../Genealogy/GenealogyBinary";
import Breadcrumbs from "../../../CommonElements/Breadcrumbs/Breadcrumbs";
import { Image } from "../../../AbstractElements";
import { useProfile } from "../../../Context/ProfileContext";
import {
  TreeFormPropsType,
  TreeForminitialValues,
} from "../../../Type/Forms/FormsType";

const BinaryTreeComponent = () => {
  const { post, loading } = useApiHelper();
  const location = useLocation();

  const [firstNode, setfirstNode] = useState<any>(null);
  const [treeData, settreeData] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(false); // ── FIX: separate loading state
  const [searchError, setSearchError] = useState<string | null>(null);

  const [ClientID, setClientID] = useState(() =>
    decryptData(localStorage.getItem("clientId") as string),
  );
  const [UserName, setUserName] = useState(() =>
    localStorage.getItem("UserName"),
  );
  const [MemberName, setMemberName] = useState(() =>
    localStorage.getItem("MemberName"),
  );

  const { avatarUrl, profile } = useProfile();

  const generateTreeNodes = (
    Data: any,
    teamCountsById: Map<string, { LeftMemberCount: number; RightMemberCount: number }>,
  ) => {
    const Result = Data.map((itm: any) => {
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
        image: itm?.NodeImg,
      };
    });
    return Result;
  };

  const doAajxCall = async (payload: any) => {
    try {
      return await post(
        `${import.meta.env.VITE_EXEC_PROC}/ExecuteProcedure`,
        payload,
      );
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      throw error;
    }
  };

  const FetchNodeData = useCallback(async (
    usernameToFetch: string | null,
    searchedUserName?: string | null
  ) => {
    if (!usernameToFetch) return;

    // ── FIX: single param object, include SearchedUserName only when provided
    const param = searchedUserName
      ? { UserName: usernameToFetch, SearchedUserName: searchedUserName }
      : { UserName: usernameToFetch };

    const obj = {
      procName: "GetBinaryTree",
      Para: JSON.stringify(param),
    };

    // Real Left/Right MEMBER counts (not business volume) for every node in
    // this same subtree — root is whichever username the tree above resolves to.
    const teamCountsObj = {
      procName: "GetTeamCountsForTree",
      Para: JSON.stringify({ UserName: searchedUserName || usernameToFetch }),
    };

    // ── FIX: use isLoading state instead of setfirstNode(null) to control spinner
    setIsLoading(true);
    setfirstNode(null);
    settreeData([]);
    setSearchError(null); // clear previous error on new fetch

    try {
      const [res, teamCountsRes] = await Promise.all([
        doAajxCall(obj),
        doAajxCall(teamCountsObj),
      ]);

      // ── FIX: API returns "NoRecord" string or null/empty on failure —
      // must check Array.isArray before calling .map in generateTreeNodes
      if (!res || !Array.isArray(res) || res.length === 0) {
        setSearchError("User not found in your downline.");
        return;
      }
      console.log(res);

      const teamCountsById = new Map<
        string,
        { LeftMemberCount: number; RightMemberCount: number }
      >(
        (Array.isArray(teamCountsRes) ? teamCountsRes : []).map((r: any) => [
          String(r.id),
          { LeftMemberCount: r.LeftMemberCount ?? 0, RightMemberCount: r.RightMemberCount ?? 0 },
        ]),
      );

      const treeNodes = generateTreeNodes(res, teamCountsById);

      setfirstNode(treeNodes[0] ?? null);
      settreeData(treeNodes);
    } finally {
      // ── FIX: always stop spinner regardless of success or error
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const currentUserName = localStorage.getItem("UserName");
    const currentMemberName = localStorage.getItem("MemberName");
    const currentClientId = decryptData(
      localStorage.getItem("clientId") as string,
    );

    setUserName(currentUserName);
    setMemberName(currentMemberName);
    setClientID(currentClientId);

    FetchNodeData(currentUserName);
  }, [location.key, FetchNodeData]);

  const handleSearch = async (values: { Username: string }) => {
    const searchedUserName = values.Username?.trim();
    if (!searchedUserName) return;
    setSearchError(null);

    const loggedInUser = localStorage.getItem("UserName");

    // Same user → just reload their own tree
    if (searchedUserName === loggedInUser) {
      await FetchNodeData(loggedInUser);
      return;
    }

    // Pass both: root = logged-in user, searched = input
    await FetchNodeData(loggedInUser, searchedUserName);
  };

  return (
    <>
      <Breadcrumbs
        mainTitle="Genealogy Binary"
        parent={"Team"}
        ChildName=" Genealogy (Binary)"
      />

      <Container fluid>
        {/* ── search ── */}
        <Row>
          <Col xl="6">
            {" "}
            <div className="gt-header">
              <div className="gt-brand">
                <Image
                  src={avatarUrl}
                  alt="avatar"
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "100px",
                  }}
                />
                <span className="gt-brand-text">{MemberName}</span>
              </div>
            </div>
          </Col>
          <Col xl="6">
            <div className="gt-search-card">
              <Formik
                enableReinitialize
                initialValues={{ Username: UserName ?? "" }}
                validationSchema={""}
                onSubmit={(values, { setSubmitting }) => {
                  handleSearch(values as { Username: string });
                  setSubmitting(false);
                }}
              >
                {({ resetForm }) => (
                  <Form>
                    <Row>
                      <Col md="8" className="col-8">
                        <Field
                          type="text"
                          name="Username"
                          placeholder="Enter username to search"
                          className="st-filter-input"
                        />
                        <ErrorMessage
                          name="Username"
                          component="div"
                          className="text-danger"
                          style={{ fontSize: 11, marginTop: 4 }}
                        />
                      </Col>
                      <Col md="4" className="mt-1 col-4 d-flex gap-2">
                        <button type="submit" className="form-btn btn">
                          SEARCH
                        </button>
                        <button
                          type="button"
                          className="form-btn btn"
                          onClick={async (e) => {
                            const loggedInUser = localStorage.getItem("UserName");
                            resetForm({ values: { Username: loggedInUser ?? "" } });
                            setSearchError(null);
                            await FetchNodeData(loggedInUser);
                          }}
                        >
                          RESET
                        </button>
                      </Col>
                    </Row>
                    {searchError && (
                      <div
                        className="text-danger"
                        style={{ fontSize: 12, marginTop: 6 }}
                      >
                        {searchError}
                      </div>
                    )}
                  </Form>
                )}
              </Formik>
            </div>
          </Col>
        </Row>

        <Row>
          {/* ── FIX: isLoading controls spinner, firstNode controls tree render ── */}
          {isLoading ? (
            <div className="d-flex justify-content-center align-items-center">
              <div className="spinner-border text-success" role="status">
                <span className="sr-only">Loading...</span>
              </div>
            </div>
          ) : firstNode ? (
            <BinaryTree
              allUsers={treeData}
              rootUser={treeData[0]}
              bgSideBar={"#00b6eb"}
              colorText={"#333"}
              colorSideBar={"#fff"}
            />
          ) : null}
        </Row>
      </Container>
    </>
  );
};

export default BinaryTreeComponent;